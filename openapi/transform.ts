/**
 * Ajusta el contrato OpenAPI de SiMaVeh (generado por Microsoft.OpenApi.OData)
 * antes de que orval genere el cliente. El archivo `simaveh.json` queda intacto;
 * esta transformacion solo afecta lo que ve el generador.
 *
 * - Descarta endpoints que no aportan al front: propiedades primitivas sueltas
 *   (`/Marcas({Id})/Nombre`, `/$value`), `/$count` (se usa `$count=true` en la
 *   coleccion), `$metadata` y el documento de servicio.
 * - Acorta nombres: `SiMaVeh.Domain.Models.Marca` -> `Marca`,
 *   `Marcas.Marca.ListMarca` -> `ListMarca`, tag `Marcas.Marca` -> `Marcas`.
 * - Entrecomilla las claves de texto en la URL: `Monedas('{Id}')`.
 * - Simplifica las navegaciones `anyOf: [$ref, {type: object, nullable}]`
 *   a `$ref` nullable, para que el tipo sea `Moneda | null`.
 * - Declara `@odata.count` y `@odata.nextLink` en las respuestas de coleccion.
 */

type Json = Record<string, any>;

const SCHEMA_PREFIXES = ['SiMaVeh.Domain.Models.', 'SiMaVeh.Domain.Enums.', 'Default.ODataErrors.'];
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;
const API_ROOT = '/simaveh/';

const shortName = (name: string) => {
  const prefix = SCHEMA_PREFIXES.find((p) => name.startsWith(p));
  return prefix ? name.slice(prefix.length) : name;
};

/** Renombra recursivamente los `$ref` de schemas y responses. */
function renameRefs(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(renameRefs);
  if (node && typeof node === 'object') {
    const out: Json = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') {
        const match = /^#\/components\/(schemas|responses)\/(.+)$/.exec(value);
        out[key] = match ? `#/components/${match[1]}/${shortName(match[2])}` : value;
      } else {
        out[key] = renameRefs(value);
      }
    }
    return out;
  }
  return node;
}

/** `anyOf: [{$ref}, {type: object, nullable: true}]` -> `{allOf: [{$ref}], nullable: true}`. */
function simplifyNullableRefs(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(simplifyNullableRefs);
  if (node && typeof node === 'object') {
    const obj = node as Json;
    const anyOf = obj.anyOf;
    if (
      Array.isArray(anyOf) &&
      anyOf.length === 2 &&
      anyOf[0]?.$ref &&
      anyOf[1]?.type === 'object' &&
      anyOf[1]?.nullable === true &&
      !anyOf[1]?.properties
    ) {
      const { anyOf: _drop, ...rest } = obj;
      return { ...rest, allOf: [anyOf[0]], nullable: true };
    }
    const out: Json = {};
    for (const [key, value] of Object.entries(obj)) out[key] = simplifyNullableRefs(value);
    return out;
  }
  return node;
}

/** Devuelve el `$ref` de schema que responde el GET 200 de un path (si lo hay). */
function getResponseSchemaRef(pathItem: Json, spec: Json): string | undefined {
  const ok = pathItem.get?.responses?.['200'];
  if (!ok) return undefined;
  const response = ok.$ref ? spec.components?.responses?.[ok.$ref.split('/').pop()] : ok;
  return response?.content?.['application/json']?.schema?.$ref;
}

function keepPath(path: string, pathItem: Json, spec: Json): boolean {
  if (path === '/version') return true;
  if (!path.startsWith(API_ROOT)) return false;
  const rest = path.slice(API_ROOT.length);
  if (!rest || rest.startsWith('$')) return false; // documento de servicio, $metadata
  if (rest.endsWith('/$count') || rest.endsWith('/$value')) return false;
  if (rest.endsWith('/$ref')) return true; // altas/bajas de relaciones
  const segments = rest.split('/');
  if (segments.length === 1) return true; // coleccion o entidad
  // Subrecurso de una entidad: se conservan solo las navegaciones (entidad o coleccion).
  const ref = getResponseSchemaRef(pathItem, spec);
  return !!ref && /SiMaVeh\.Domain\.Models\./.test(ref);
}

export function transformSimavehSpec<T extends object>(input: T): T {
  const spec: Json = structuredClone(input);

  // 1. Filtrar paths y entrecomillar claves de texto.
  const paths: Json = {};
  for (const [path, item] of Object.entries<Json>(spec.paths ?? {})) {
    if (!keepPath(path, item, spec)) continue;
    let newPath = path;
    const ops = HTTP_METHODS.map((m) => item[m]).filter(Boolean);
    const idParam = [...(item.parameters ?? []), ...ops.flatMap((o: Json) => o.parameters ?? [])].find(
      (p: Json) => p?.name === 'Id' && p?.in === 'path',
    );
    if (idParam?.schema?.type === 'string') newPath = newPath.replace('({Id})', "('{Id}')");
    paths[newPath] = item;
  }
  spec.paths = paths;

  // 2. Tags y operationIds cortos.
  //    CRUD del entity set: `ListMarca`, `GetMarca`, ... (hooks `useListMarca`, `useGetMarca`).
  //    Navegaciones y $ref: siempre prefijados con el set (`MarcasListCategorias`, `MarcasCreateRef`),
  //    porque el mismo nombre corto aparece en varios recursos.
  const operationIds = new Set<string>();
  for (const [path, item] of Object.entries<Json>(paths)) {
    const isSubresource = path.startsWith(API_ROOT) && path.slice(API_ROOT.length).includes('/');
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op) continue;
      const tag = String(op.tags?.[0] ?? 'Default').split('.')[0];
      const short = String(op.operationId).split('.').pop()!;
      op.tags = [tag];
      op.operationId = isSubresource ? `${tag}${short}` : short;
      if (operationIds.has(op.operationId)) throw new Error(`operationId duplicado: ${op.operationId} (${path})`);
      operationIds.add(op.operationId);
    }
  }
  spec.tags = [
    ...new Set(Object.values<Json>(paths).flatMap((item) => HTTP_METHODS.flatMap((m) => item[m]?.tags ?? []))),
  ].map((name) => ({ name }));

  // 3. Renombrar componentes.
  for (const section of ['schemas', 'responses'] as const) {
    const current: Json = spec.components?.[section] ?? {};
    const renamed: Json = {};
    for (const [name, value] of Object.entries(current)) {
      const target = shortName(name);
      if (renamed[target]) throw new Error(`Colision de nombres al acortar ${section}: ${name} -> ${target}`);
      renamed[target] = value;
    }
    if (spec.components) spec.components[section] = renamed;
  }
  const result = simplifyNullableRefs(renameRefs(spec)) as Json;

  // 4. Metadatos OData en las respuestas de coleccion.
  for (const [name, schema] of Object.entries<Json>(result.components?.schemas ?? {})) {
    if (!name.endsWith('CollectionResponse') || !schema.properties) continue;
    schema.properties['@odata.count'] = { type: 'integer', format: 'int64' };
    schema.properties['@odata.nextLink'] = { type: 'string', nullable: true };
  }

  return result as T;
}
