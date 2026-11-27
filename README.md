# simaveh-ui

Front-End para la API SiMaVeh (registro de mantenimientos vehiculares).

React + Vite + TypeScript, Mantine (UI), TanStack Query (estado del servidor), React Router, react-hook-form + zod (formularios).
El cliente HTTP (tipos + hooks de React Query) se **genera** con [orval](https://orval.dev) a partir del contrato OpenAPI de la API.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # opcional: por defecto la API se espera en https://localhost:44340
npm run dev               # regenera el cliente y levanta Vite en http://localhost:5173
```

En desarrollo Vite hace de proxy de `/simaveh` y `/version` hacia la API (`VITE_API_PROXY_TARGET`),
asi no hay problemas de CORS ni con el certificado autofirmado de ASP.NET.

## Contrato OpenAPI

| Archivo / script       | Que hace                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openapi/simaveh.json` | Contrato de la API, versionado en el repo.                                                                                                                                                                    |
| `npm run api:sync`     | Lo vuelve a descargar desde la API (`OPENAPI_URL`, por defecto `https://localhost:44340/openapi.json`).                                                                                                       |
| `npm run api:gen`      | Genera `src/api/generated/`: cliente con orval y metadata de entidades con `scripts/gen-entity-metadata.ts`. Se ejecuta solo antes de `dev` y `build`.                                                        |
| `openapi/transform.ts` | Ajusta el contrato antes de generar: descarta endpoints de propiedades sueltas/`$value`/`$count`, acorta nombres (`SiMaVeh.Domain.Models.Marca` -> `Marca`), entrecomilla claves de texto (`Monedas('ARS')`). |

Flujo cuando cambia la API: `npm run api:sync && npm run api:gen && npm run typecheck`; los errores de TypeScript marcan lo que hay que adaptar.

**No editar `src/api/generated/`**: se regenera.

### Nombres de los hooks generados

- CRUD del entity set: `useListMarca`, `useGetMarca`, `useCreateMarca`, `useUpdateMarca` (PATCH), `useReplaceMarca` (PUT), `useDeleteMarca`.
- Navegaciones y referencias, prefijadas con el set: `useMarcasListCategorias`, `useMarcasCreateRef`, `useMarcasDeleteRef`.

## Estructura

```
src/
  api/http.ts            instancia axios (mutator de orval, serializa parametros OData)
  api/references.ts      operaciones $ref (asignar/agregar/quitar relaciones)
  api/generated/         cliente y metadata generados (no editar)
  app/                   providers y router
  components/            layout y componentes compartidos
  entities/config.ts     textos, menu y presentacion de cada entidad (a mano)
  entities/registry.ts   metadata + config y helpers
  features/entities/     CRUD generico: lista, detalle, formulario y relaciones
  lib/odata.ts           helpers: filtros, invalidacion de cache, mensajes de error
```

Las 33 entidades usan las mismas pantallas, armadas desde la metadata generada del contrato (campos, tipos y relaciones asignables).
Para cambiar como se muestra una entidad, editar `src/entities/config.ts`. Mas detalle en [AGENTS.md](AGENTS.md).

## Scripts

`dev`, `build`, `preview`, `typecheck`, `lint` (oxlint), `format` (prettier), `api:sync`, `api:gen`.
