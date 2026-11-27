// Genera src/api/generated/entities.ts a partir del contrato OpenAPI:
// metadata de cada entity set (campos, clave, navegaciones asignables) y el mapa
// a las funciones CRUD que genera orval. Se ejecuta en `npm run api:gen`, despues de orval.
//
// Uso: node scripts/gen-entity-metadata.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { transformSimavehSpec } from '../openapi/transform.ts';

type Json = Record<string, any>;

const root = new URL('../', import.meta.url);
const raw = JSON.parse(readFileSync(new URL('openapi/simaveh.json', root), 'utf8'));
const spec: Json = transformSimavehSpec(raw);
const schemas: Json = spec.components.schemas;
const responses: Json = spec.components.responses ?? {};
const API_ROOT = '/simaveh/';

const refName = (ref: string | undefined) => ref?.split('/').pop();
const camel = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Esquema de la respuesta 200 de una operacion (resolviendo components/responses). */
function responseSchema(op: Json | undefined): Json | undefined {
  const ok = op?.responses?.['200'];
  if (!ok) return undefined;
  const response = ok.$ref ? responses[refName(ok.$ref)!] : ok;
  return response?.content?.['application/json']?.schema;
}

/** Propiedades de un tipo, incluyendo las heredadas por allOf. */
function propertiesOf(type: string): Json {
  const schema = schemas[type];
  if (!schema) return {};
  const parts: Json[] = schema.allOf ?? [schema];
  return Object.assign({}, ...parts.map((p) => (p.$ref ? propertiesOf(refName(p.$ref)!) : (p.properties ?? {}))));
}

/** Tipo base directo (allOf con $ref), si lo tiene. */
const baseTypeOf = (type: string) => refName(schemas[type]?.allOf?.find((p: Json) => p.$ref)?.$ref);

const isSubtypeOf = (type: string, ancestor: string): boolean => {
  for (let t: string | undefined = type; t; t = baseTypeOf(t)) if (t === ancestor) return true;
  return false;
};

// 1. Entity sets: /simaveh/<Set> con GET de coleccion.
const sets: { set: string; type: string; ops: Record<string, string> }[] = [];
for (const [path, item] of Object.entries<Json>(spec.paths)) {
  const match = /^\/simaveh\/([A-Za-z]+)$/.exec(path);
  if (!match || !item.get) continue;
  const collection = responseSchema(item.get);
  const collectionSchema = schemas[refName(collection?.$ref)!];
  const type = refName(collectionSchema?.properties?.value?.items?.$ref);
  if (!type) throw new Error(`No se pudo determinar el tipo de ${path}`);
  const set = match[1];
  const entityPath = Object.keys(spec.paths).find(
    (p) => p === `${API_ROOT}${set}({Id})` || p === `${API_ROOT}${set}('{Id}')`,
  );
  const entity = entityPath ? spec.paths[entityPath] : {};
  const ops = {
    list: item.get?.operationId,
    create: item.post?.operationId,
    get: entity.get?.operationId,
    update: entity.patch?.operationId,
    remove: entity.delete?.operationId,
  };
  for (const [name, id] of Object.entries(ops)) if (!id) throw new Error(`${set}: falta la operacion ${name}`);
  sets.push({ set, type, ops });
}
sets.sort((a, b) => a.set.localeCompare(b.set));

// 2. Navegaciones asignables segun los endpoints $ref.
function refEnum(set: string, suffix: string, method: string): string[] {
  const item = spec.paths[`${API_ROOT}${set}({Id})/{navigationProperty}${suffix}`];
  const param = (item?.[method]?.parameters ?? []).find((p: Json) => p.name === 'navigationProperty');
  return param?.schema?.enum ?? [];
}

function fieldOf(name: string, schema: Json) {
  const field: Json = { name, nullable: !!schema.nullable };
  if (schema.$ref) {
    const target = schemas[refName(schema.$ref)!];
    if (!target?.enum) throw new Error(`Campo ${name}: $ref no soportado (${schema.$ref})`);
    Object.assign(field, { kind: 'enum', enumValues: target.enum });
  } else if (schema.type === 'boolean') {
    field.kind = 'boolean';
  } else if (schema.type === 'string') {
    field.kind = schema.format === 'date-time' ? 'datetime' : 'string';
  } else if (schema.type === 'number' || schema.type === 'integer') {
    field.kind =
      schema.format === 'decimal' || schema.format === 'double' || schema.format === 'float' ? 'decimal' : 'integer';
    if (schema.minimum !== undefined) field.min = schema.minimum;
    if (schema.maximum !== undefined) field.max = schema.maximum;
  } else {
    throw new Error(`Campo ${name}: tipo no soportado (${JSON.stringify(schema)})`);
  }
  return field;
}

const metadata: Json = {};
for (const { set, type } of sets) {
  const canSet = refEnum(set, '/$ref', 'put');
  const canAdd = refEnum(set, '/$ref', 'post');
  const canRemove = refEnum(set, '({IdRelacionado})/$ref', 'delete');
  const fields: Json[] = [];
  const navigations: Json[] = [];
  let keyKind: 'number' | 'string' = 'number';

  for (const [name, schema] of Object.entries<Json>(propertiesOf(type))) {
    const navRef = schema['x-ms-navigationProperty']
      ? refName(schema.allOf?.[0]?.$ref ?? schema.anyOf?.[0]?.$ref)
      : undefined;
    const collectionRef = schema.type === 'array' ? refName(schema.items?.$ref) : undefined;
    const targetType =
      navRef ??
      (collectionRef && (schemas[collectionRef]?.properties || schemas[collectionRef]?.allOf)
        ? collectionRef
        : undefined);

    if (targetType) {
      const collection = !navRef;
      const targetSets = sets.filter((s) => isSubtypeOf(s.type, targetType)).map((s) => s.set);
      navigations.push({
        name,
        collection,
        targetType,
        targetSets,
        canSet: !collection && canSet.includes(name),
        canAdd: collection && canAdd.includes(name),
        canRemove: collection && canRemove.includes(name),
      });
      continue;
    }
    const field = fieldOf(name, schema);
    if (name === 'Id') keyKind = field.kind === 'string' ? 'string' : 'number';
    fields.push(field);
  }

  metadata[set] = { set, type, key: { name: 'Id', kind: keyKind }, fields, navigations };
}

// 3. Emitir el archivo.
const setUnion = sets.map((s) => `'${s.set}'`).join(' | ');
const apiEntries = sets
  .map(
    ({ set, ops }) =>
      `  ${set}: {\n` +
      Object.entries(ops)
        .map(([name, id]) => `    ${name}: api.${camel(id)},`)
        .join('\n') +
      `\n  } as unknown as EntityApi,`,
  )
  .join('\n');

const header = `/**
 * Generado por scripts/gen-entity-metadata.ts a partir de openapi/simaveh.json.
 * No editar a mano: se regenera con \`npm run api:gen\`.
 */
`;

// Metadata y API en archivos separados: la metadata (menu, rutas) no arrastra todo el cliente generado.
const metadataFile = `${header}import type { EntityMeta } from '../../entities/types';

export type EntitySet = ${setUnion};

export const ENTITY_SETS = ${JSON.stringify(sets.map((s) => s.set))} as const satisfies readonly EntitySet[];

export const ENTITY_METADATA: Record<EntitySet, EntityMeta> = ${JSON.stringify(metadata, null, 2)};
`;

const apiFile = `${header}import * as api from './endpoints';
import type { EntityApi } from '../../entities/types';
import type { EntitySet } from './entities';

/** Funciones CRUD generadas por orval para cada entity set. */
export const ENTITY_API: Record<EntitySet, EntityApi> = {
${apiEntries}
};
`;

writeFileSync(new URL('src/api/generated/entities.ts', root), metadataFile, 'utf8');
writeFileSync(new URL('src/api/generated/entity-api.ts', root), apiFile, 'utf8');
console.log(`entities.ts + entity-api.ts: ${sets.length} entity sets`);
