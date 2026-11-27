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

| Archivo / script | Que hace |
| --- | --- |
| `openapi/simaveh.json` | Contrato de la API, versionado en el repo. |
| `npm run api:sync` | Lo vuelve a descargar desde la API (`OPENAPI_URL`, por defecto `https://localhost:44340/openapi.json`). |
| `npm run api:gen` | Genera `src/api/generated/` con orval (se ejecuta solo antes de `dev` y `build`). |
| `openapi/transform.ts` | Ajusta el contrato antes de generar: descarta endpoints de propiedades sueltas/`$value`/`$count`, acorta nombres (`SiMaVeh.Domain.Models.Marca` -> `Marca`), entrecomilla claves de texto (`Monedas('ARS')`). |

Flujo cuando cambia la API: `npm run api:sync && npm run api:gen && npm run typecheck`; los errores de TypeScript marcan lo que hay que adaptar.

**No editar `src/api/generated/`**: se regenera.

### Nombres de los hooks generados

- CRUD del entity set: `useListMarca`, `useGetMarca`, `useCreateMarca`, `useUpdateMarca` (PATCH), `useReplaceMarca` (PUT), `useDeleteMarca`.
- Navegaciones y referencias, prefijadas con el set: `useMarcasListCategorias`, `useMarcasCreateRef`, `useMarcasDeleteRef`.

## Estructura

```
src/
  api/http.ts        instancia axios (mutator de orval, serializa parametros OData)
  api/generated/     cliente generado (endpoints/ por entity set, model/ con los tipos)
  app/               providers (Mantine, React Query) y router
  components/        layout y componentes compartidos
  features/<set>/    paginas por recurso (lista, detalle, formulario)
  lib/odata.ts       helpers: filtros, invalidacion de cache, mensajes de error
```

`features/marcas/` es la plantilla de referencia para el resto de los recursos.

## Scripts

`dev`, `build`, `preview`, `typecheck`, `lint` (oxlint), `format` (prettier), `api:sync`, `api:gen`.
