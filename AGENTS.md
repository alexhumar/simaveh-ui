# AGENTS.md

Guia para agentes de IA (y personas) que trabajan en este repositorio. Complementa al [README](README.md): aca va lo que no se deduce leyendo el codigo.

## Proyecto

Front-End de **SiMaVeh**, API REST **OData** (ASP.NET) para administrar y registrar mantenimientos vehiculares.

Stack: React 19, Vite 8, TypeScript 7, Mantine 9 (UI), TanStack Query 5 (estado del servidor), React Router 7, react-hook-form + zod 4 (formularios), axios, orval (generacion del cliente), oxlint, Prettier.

Idioma: la UI, los mensajes y los comentarios estan en **espanol**. Los nombres de entidades y propiedades respetan los de la API (`Marca`, `Nombre`, `ServicioReparador`, ...).

## Comandos

| Comando             | Uso                                                           |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Regenera el cliente y levanta Vite en http://localhost:5173   |
| `npm run build`     | Regenera el cliente, type-check y build de produccion         |
| `npm run typecheck` | `tsc -b` (app + archivos de configuracion)                    |
| `npm run lint`      | oxlint                                                        |
| `npm run format`    | Prettier                                                      |
| `npm run api:sync`  | Descarga el contrato desde la API (requiere la API levantada) |
| `npm run api:gen`   | Genera `src/api/generated/` (orval + metadata de entidades)   |

**Para validar un cambio**: `npm run typecheck && npm run lint && npm run build`. Todavia no hay tests automatizados.

## Contrato OpenAPI y cliente generado

Es la regla mas importante del repo:

- `openapi/simaveh.json` es la **fuente de verdad** de entidades y endpoints.
- **Nunca** escribir a mano tipos, modelos o servicios de la API, y **nunca** editar `src/api/generated/`: se borra y se regenera en cada `api:gen`.
- Si el contrato necesita ajustes para generar mejor codigo, se hacen en `openapi/transform.ts` (transformacion previa a orval), no en el JSON.
- Cuando cambia la API: `npm run api:sync && npm run api:gen && npm run typecheck`, y corregir lo que marque TypeScript.
- El spec pesa ~800 KB: para explorarlo usar `node -e` o grep (paths, `components.schemas`), no leerlo entero.

`npm run api:gen` produce:

| Archivo generado                             | Contenido                                                                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/generated/endpoints/<set>/<set>.ts` | Funciones y hooks de React Query por entity set (orval)                                                                                                                    |
| `src/api/generated/model/`                   | Tipos de las entidades (orval)                                                                                                                                             |
| `src/api/generated/entities.ts`              | `EntitySet`, `ENTITY_SETS` y `ENTITY_METADATA`: campos con tipo, clave, enums, navegaciones con sus sets destino y si se pueden asignar (`scripts/gen-entity-metadata.ts`) |
| `src/api/generated/entity-api.ts`            | `ENTITY_API`: mapa set → funciones CRUD de orval (`list`, `get`, `create`, `update`, `remove`)                                                                             |

`entities.ts` y `entity-api.ts` van separados para que el menu y las rutas no carguen todo el cliente.

Nombres de los hooks generados:

- CRUD del entity set, sin prefijo: `useListMarca`, `useGetMarca`, `useCreateMarca`, `useUpdateMarca` (PATCH), `useReplaceMarca` (PUT), `useDeleteMarca`.
- Navegaciones y referencias, con el set como prefijo: `useMarcasListCategorias`, `useMarcasCreateRef`, `useMarcasDeleteRef`.
- Las query keys son la URL: `['/simaveh/Marcas', params]`, `['/simaveh/Marcas(1)']`.

## Particularidades de la API (OData)

- Las colecciones aceptan `$filter`, `$top`, `$skip`, `$count`, `$orderby`, `$select` y `$expand`. Las listas se mandan separadas por coma; eso lo resuelve `src/api/http.ts`.
- Paginacion: `$top` + `$skip` + `$count: true`, y el total viene en `data['@odata.count']`.
- Helpers en `src/lib/odata.ts`:
  - `containsFilter(campo, texto)`: busqueda sin distinguir mayusculas.
  - `odataString(texto)`: escapa literales para usarlos en `$filter`.
  - `invalidateEntitySet(queryClient, 'Marcas')`: llamarlo despues de cada mutacion.
  - `getApiErrorMessages(error)`: arma los mensajes para la UI (se muestran con `ApiErrorAlert`).
- Claves de texto: `Monedas('ARS')`, `EquipamientosAirbags`, `UbicacionesPieza`. El transform ya genera la URL con comillas.
- **Relaciones**: los bodies no tienen campos de clave foranea. El flujo, confirmado con el usuario, es crear la entidad (POST) y despues asignar cada relacion con los endpoints `$ref` (`src/api/references.ts`):
  - Simples: `PUT .../{nav}/$ref`. No hay DELETE para las simples, asi que una relacion simple asignada no se puede vaciar.
  - Colecciones: `POST .../{nav}/$ref` para agregar y `DELETE .../{nav}({IdRelacionado})/$ref` para quitar.
  - El body es `{"@odata.id": "<url absoluta>"}`. La URL se arma con la raiz del servicio que informa la propia API (`@odata.context` de `GET /simaveh`), no con la del proxy.
  - Que navegaciones se pueden asignar sale de los enums de los endpoints `$ref`; queda en `canSet`, `canAdd` y `canRemove` de la metadata.
- **Tipos abstractos**: `Vehiculo` → Automoviles; `Persona` → Reparadores | Usuarios; `Recambio` → Repuestos | KitsRepuestos; `TargetMantenimiento` → Aceites | Fluidos | Piezas. Las entidades expandidas traen `@odata.type` con el tipo concreto (ver `setOfEntity`).
- `$expand` usa el nombre de la propiedad de navegacion (`Categorias`), no el del entity set (`CategoriasMarca`).
- **Discrepancia con el contrato**: el 400 de validacion llega como `{ "@odata.context": ..., "value": string[] }`, aunque el spec declara `string[]`. `getApiErrorMessages` acepta las dos formas.
- Las entidades heredan con `allOf`: por ejemplo, `Automovil` es `Vehiculo & {...}`.

## Arquitectura y convenciones

```
src/
  api/http.ts            instancia axios usada por orval (mutator)
  api/references.ts      operaciones $ref genericas y raiz del servicio
  api/generated/         cliente y metadata generados (no editar)
  app/                   providers (Mantine, Dates, React Query) y router
  components/            layout (AppLayout), QueryState (PageLoader, ApiErrorAlert), NotFound
  entities/types.ts      tipos de la metadata y de EntityApi
  entities/config.ts     presentacion por entidad (a mano)
  entities/registry.ts   une metadata + config; helpers de textos, claves, busqueda y formato
  features/entities/     CRUD generico: lista, detalle, formulario, EntitySelect, RelationCollection, hooks
  features/inicio/       pagina de inicio
  lib/odata.ts           helpers OData
```

**Las pantallas son genericas y se arman desde la metadata.** No hay una feature por entidad.

- Rutas: `/:slug`, `/:slug/nueva`, `/:slug/:id` y `/:slug/:id/editar`. El slug es el entity set en kebab-case (`CategoriasMarca` → `/categorias-marca`). Todas se cargan en diferido.
- Menu: se arma con `MENU` (registry), agrupado segun `group` de `config.ts`.
- `src/entities/config.ts` es lo unico que se escribe a mano por entidad:
  - `singular`, `plural`, `femenino` (para "Nuevo"/"Nueva") y `group`.
  - Opcionales: `listColumns`, `searchFields` y `defaultSort`.
  - `TYPE_DISPLAY_FIELDS`: como se muestra una entidad cuando aparece como relacion o en un selector.
  - `FIELD_LABELS`: etiquetas que no salen bien al separar el PascalCase. Las demas se humanizan con tildes (diccionario `WORDS` en registry).
  - `satisfies Record<EntitySet, EntityConfig>` hace que falle la compilacion si aparece un entity set nuevo sin configurar.
- Lista: busqueda (`contains` sobre los campos de texto, o `Id eq n` si el texto es numerico), orden por columna, paginacion en la URL y `$expand` de las relaciones simples.
- Detalle:
  - Campos y relaciones simples, con link al detalle de la relacionada.
  - Una tarjeta por coleccion, paginada, con agregar y quitar segun `canAdd` y `canRemove`.
- Formulario:
  - El schema zod se arma desde los campos: `nullable` → opcional; `min`/`max`; enums.
  - Inputs por tipo: texto, numero, switch, select de enum y `DateTimePicker`. Las fechas se mandan en ISO con zona horaria.
  - La clave de texto solo se carga en el alta.
  - Las relaciones simples asignables se eligen con `EntitySelect` (busqueda remota; en tipos abstractos se elige primero el set).
  - `useSaveEntity` hace POST o PATCH y despues los `PUT $ref` de las relaciones que cambiaron. Si falla un `$ref` despues de un alta, navega a la edicion del registro creado y avisa que relacion falto.
- Personalizar una entidad puntual:
  - Primero probar con `config.ts`.
  - Si no alcanza, crear una pagina propia en `src/features/<entidad>/` y registrar una ruta especifica (`/marcas/...`) antes de `:slug` en `src/app/router.tsx`.
  - Reutilizar los hooks de `features/entities/hooks.ts` o los de orval.
- Hooks genericos (`useEntityList`, `useEntity`, `useNavigationCollection`, `useSaveEntity`, `useDeleteEntity`, `useCollectionReference`): usan `ENTITY_API` (funciones de orval) con query keys en el formato de orval (la URL). Asi `invalidateEntitySet` invalida tanto lo generico como lo generado.
- Despues de una mutacion: llamar a `invalidateEntitySet` (los hooks genericos ya lo hacen) y mostrar una notificacion (`@mantine/notifications`).
- Errores y carga: usar `PageLoader` y `ApiErrorAlert`, no reinventarlos.
- UI con componentes de Mantine. Evitar CSS propio salvo que haga falta.
- Prettier: comillas simples, ancho 120.

## Entorno local

- La API corre en `https://localhost:44340`, con el certificado de desarrollo de ASP.NET (autofirmado).
- En desarrollo Vite hace de proxy de `/simaveh` y `/version` hacia `VITE_API_PROXY_TARGET`, y `VITE_API_BASE_URL` queda vacio (ver `.env.example`).
- Para consultar la API directamente: `curl -k "https://localhost:44340/simaveh/Marcas?\$top=5&\$count=true"`.

## Reglas para agentes

- **No escribir en la API local** (POST/PUT/PATCH/DELETE) sin permiso explicito del usuario: es su base de datos. Las lecturas (GET) estan permitidas.
- No commitear `.env` ni secretos. No hacer commit, tag ni push sin pedido del usuario.
- No correr `api:sync` si la API no esta levantada: fallaria sin modificar el archivo, pero no aporta nada.
- Ante una decision de dominio que el contrato no define (que campos mostrar, reglas de negocio, como asignar relaciones), preguntar en lugar de suponer.
- Para agregar una dependencia, preferir lo que ya esta en el stack.

## Versionado

- Se usa [Semantic Versioning](https://semver.org/lang/es/) en `package.json`. Version actual: **0.3.0** (CRUD generico de las 33 entidades + modo claro/oscuro), en desarrollo inicial (`0.y.z`).
  - MINOR: funcionalidad o recurso nuevo.
  - PATCH: correcciones.
  - `1.0.0`: cuando el front se considere estable.
- La version del front se muestra en el header (`__APP_VERSION__`, inyectada por Vite desde `package.json`) junto a la de la API.
- `src/api/generated/` **se versiona en git** para que los diffs muestren los cambios de contrato. Se regenera y se commitea en el mismo commit que actualiza `openapi/simaveh.json`.

## Pendientes conocidos

- Las escrituras (alta, edicion, baja, `$ref`) del CRUD generico todavia no se probaron contra la API real. Las lecturas de las 33 entidades si.
- Bundle principal de ~630 KB (Mantine, React, router). Las pantallas ya se cargan en diferido; falta separar dependencias en chunks propios si se quiere eliminar el aviso del build.
- Tests: todavia no hay. Si se agregan, usar Vitest y Testing Library.
