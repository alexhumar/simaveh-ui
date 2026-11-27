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
| `npm run api:gen`   | Genera `src/api/generated/` con orval                         |

**Para validar un cambio**: `npm run typecheck && npm run lint && npm run build`. Todavia no hay tests automatizados.

## Contrato OpenAPI y cliente generado

Es la regla mas importante del repo:

- `openapi/simaveh.json` es la **fuente de verdad** de entidades y endpoints.
- **Nunca** escribir a mano tipos, modelos o servicios de la API, y **nunca** editar `src/api/generated/`: se borra y se regenera en cada `api:gen`.
- Si el contrato necesita ajustes para generar mejor codigo, se hacen en `openapi/transform.ts` (transformacion previa a orval), no en el JSON.
- Cuando cambia la API: `npm run api:sync && npm run api:gen && npm run typecheck`, y corregir lo que marque TypeScript.
- El spec pesa ~800 KB: para explorarlo usar `node -e` o grep (paths, `components.schemas`), no leerlo entero.

Importar desde `src/api/generated/endpoints/<set>/<set>.ts` (hooks) y `src/api/generated/model` (tipos).

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
- **Relaciones**: los bodies no tienen campos de clave foranea. Las navegaciones se asignan con los endpoints `$ref` (`POST/PUT /simaveh/<Set>({Id})/{navegacion}/$ref` con body `{"@odata.id": "<url de la entidad relacionada>"}`). Todavia no se confirmo si la API acepta `@odata.bind` al crear.
- `$expand` usa el nombre de la propiedad de navegacion (`Categorias`), no el del entity set (`CategoriasMarca`).
- **Discrepancia con el contrato**: el 400 de validacion llega como `{ "@odata.context": ..., "value": string[] }`, aunque el spec declara `string[]`. `getApiErrorMessages` acepta las dos formas.
- Las entidades heredan con `allOf`: por ejemplo, `Automovil` es `Vehiculo & {...}`.

## Arquitectura y convenciones

```
src/
  api/http.ts        instancia axios usada por orval (mutator)
  api/generated/     cliente generado (no editar)
  app/               providers (Mantine, React Query) y router
  components/        layout (AppLayout), QueryState (PageLoader, ApiErrorAlert), NotFound
  features/<set>/    paginas por recurso
  lib/odata.ts       helpers OData
```

- **Plantilla para nuevos recursos**: `src/features/marcas/`.
  - Lista: busqueda con debounce, orden por columna, paginacion y filtros en la URL.
  - Detalle: incluye navegaciones y un modal de confirmacion para eliminar.
  - Formulario: alta y edicion en un solo componente, con validacion zod.
- Al agregar un recurso:
  1. Crear `src/features/<set-en-minusculas>/` siguiendo esa plantilla.
  2. Registrar las rutas en `src/app/router.tsx` (`/<set>`, `/<set>/nueva`, `/<set>/:id`, `/<set>/:id/editar`).
  3. Agregar la entrada en `NAV_ITEMS` de `src/components/AppLayout.tsx`.
- Despues de una mutacion: llamar a `invalidateEntitySet` y mostrar una notificacion (`@mantine/notifications`).
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

- Se usa [Semantic Versioning](https://semver.org/lang/es/) en `package.json`. Version actual: **0.1.0**, en desarrollo inicial (`0.y.z`).
  - MINOR: funcionalidad o recurso nuevo.
  - PATCH: correcciones.
  - `1.0.0`: cuando el front se considere estable.
- La version del front se muestra en el header (`__APP_VERSION__`, inyectada por Vite desde `package.json`) junto a la de la API.
- `src/api/generated/` **se versiona en git** para que los diffs muestren los cambios de contrato. Se regenera y se commitea en el mismo commit que actualiza `openapi/simaveh.json`.

## Pendientes conocidos

- Confirmar como se asignan las relaciones al crear entidades: `@odata.bind` o `$ref` posterior. Bloquea Automoviles y Mantenimientos.
- Code-splitting por ruta: el bundle supera los 500 KB y el build lo advierte.
- Tests: todavia no hay. Si se agregan, usar Vitest y Testing Library.
