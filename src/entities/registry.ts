import { ENTITY_METADATA, ENTITY_SETS, type EntitySet } from '../api/generated/entities';
import { containsFilter, odataString } from '../lib/odata';
import { ENTITY_CONFIG, FIELD_LABELS, MENU_GROUPS, TYPE_DISPLAY_FIELDS, type EntityConfig } from './config';
import type { EntityKey, EntityMeta, EntityRecord, FieldMeta } from './types';

/** Todo lo necesario para presentar un entity set. */
export interface EntityDefinition extends EntityMeta, EntityConfig {
  set: EntitySet;
  slug: string;
}

const toSlug = (set: string) => set.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export const ENTITIES: Record<EntitySet, EntityDefinition> = Object.fromEntries(
  ENTITY_SETS.map((set) => [set, { ...ENTITY_METADATA[set], ...ENTITY_CONFIG[set], set, slug: toSlug(set) }]),
) as Record<EntitySet, EntityDefinition>;

const BY_SLUG = new Map(Object.values(ENTITIES).map((e) => [e.slug, e]));
const BY_TYPE = new Map(Object.values(ENTITIES).map((e) => [e.type, e]));

export const entityBySlug = (slug: string | undefined) => (slug ? BY_SLUG.get(slug) : undefined);
export const entityPath = (set: EntitySet, key?: EntityKey) =>
  key === undefined ? `/${ENTITIES[set].slug}` : `/${ENTITIES[set].slug}/${encodeURIComponent(String(key))}`;

export const isEntitySet = (value: string): value is EntitySet => value in ENTITIES;

/** Entidades del menu agrupadas, en el orden de MENU_GROUPS. */
export const MENU = MENU_GROUPS.map((group) => ({
  group,
  entities: Object.values(ENTITIES)
    .filter((e) => e.group === group)
    .sort((a, b) => a.plural.localeCompare(b.plural, 'es')),
}));

/** Clave en formato OData: `1` o `'ARS'`. */
export const formatKey = (definition: Pick<EntityMeta, 'key'>, key: EntityKey) =>
  definition.key.kind === 'string' ? odataString(String(key)) : String(key);

/** Convierte el segmento de la URL del front a la clave tipada. */
export const parseKey = (definition: Pick<EntityMeta, 'key'>, raw: string): EntityKey =>
  definition.key.kind === 'string' ? raw : Number(raw);

export const keyOf = (definition: Pick<EntityMeta, 'key'>, entity: EntityRecord) =>
  entity[definition.key.name] as EntityKey;

/** Entity set al que pertenece una entidad expandida, segun `@odata.type` (para tipos abstractos). */
export function setOfEntity(entity: EntityRecord, fallbackSets: string[]): EntitySet | undefined {
  const odataType = typeof entity['@odata.type'] === 'string' ? entity['@odata.type'].split('.').pop() : undefined;
  const byType = odataType ? BY_TYPE.get(odataType)?.set : undefined;
  return byType ?? (fallbackSets.length === 1 ? (fallbackSets[0] as EntitySet) : undefined);
}

// ---- Busqueda y orden ----

/** Campos de texto para buscar (config o todos los string). */
export const searchFieldsOf = (definition: EntityDefinition) =>
  definition.searchFields ?? definition.fields.filter((f) => f.kind === 'string').map((f) => f.name);

/**
 * `$filter` de busqueda libre: contains sobre los campos de texto, o igualdad por Id si el texto es numerico
 * (asi se puede buscar tambien en entidades sin campos de texto).
 */
export function searchFilter(definition: EntityDefinition, text: string): string | undefined {
  const term = text.trim();
  if (!term) return undefined;
  const clauses = searchFieldsOf(definition)
    .map((field) => containsFilter(field, term))
    .filter(Boolean);
  if (definition.key.kind === 'number' && /^\d+$/.test(term)) clauses.push(`Id eq ${term}`);
  return clauses.length ? clauses.map((c) => `(${c})`).join(' or ') : 'false';
}

/** Campo de orden inicial: config, primer campo de presentacion existente, o la clave. */
export function defaultSortOf(definition: EntityDefinition): string {
  if (definition.defaultSort) return definition.defaultSort;
  const display = displayFieldsOf(definition.type, definition.fields).find((n) =>
    definition.fields.some((f) => f.name === n),
  );
  return display ?? definition.key.name;
}

// ---- Textos ----

const WORDS: Record<string, string> = {
  Anio: 'Año',
  Anios: 'Años',
  Numero: 'Número',
  Descripcion: 'Descripción',
  Codigo: 'Código',
  Accion: 'Acción',
  Version: 'Versión',
  Dias: 'Días',
  Fabricacion: 'Fabricación',
  Diametro: 'Diámetro',
  Indice: 'Índice',
  Relacion: 'Relación',
  Construccion: 'Construcción',
  Categoria: 'Categoría',
  Categorias: 'Categorías',
  Telefono: 'Teléfono',
  Telefonos: 'Teléfonos',
  Direccion: 'Dirección',
  Ubicacion: 'Ubicación',
  Presion: 'Presión',
  Acompanante: 'Acompañante',
  Neumatico: 'Neumático',
  Pais: 'País',
  Vehiculo: 'Vehículo',
  Vehiculos: 'Vehículos',
  Energia: 'Energía',
  Camion: 'Camión',
  Reparacion: 'Reparación',
  Kilometros: 'Kilómetros',
  Periodicidad: 'Periodicidad',
};

/** `NumeroDocumento` -> `Número documento`. */
export function humanize(name: string): string {
  const words = name.match(/[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z0-9]+|[A-Z]+/g) ?? [name];
  return words
    .map((w, i) => {
      const word = WORDS[w] ?? w;
      if (i === 0 || (w.length > 1 && w === w.toUpperCase())) return word;
      return word.charAt(0).toLowerCase() + word.slice(1);
    })
    .join(' ');
}

export const fieldLabel = (name: string) => FIELD_LABELS[name] ?? humanize(name);
export const enumLabel = (value: string) => humanize(value);

// ---- Representacion de entidades ----

export function displayFieldsOf(type: string, fields?: FieldMeta[]): string[] {
  if (TYPE_DISPLAY_FIELDS[type]) return TYPE_DISPLAY_FIELDS[type];
  if (!fields || fields.some((f) => f.name === 'Nombre')) return ['Nombre'];
  return ['Id'];
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

export function formatValue(value: unknown, field?: Pick<FieldMeta, 'kind'>): string {
  if (value === null || value === undefined || value === '') return '—';
  switch (field?.kind) {
    case 'boolean':
      return value ? 'Sí' : 'No';
    case 'datetime':
      return dateFormatter.format(new Date(String(value)));
    case 'decimal':
    case 'integer':
      return typeof value === 'number' ? numberFormatter.format(value) : String(value);
    case 'enum':
      return enumLabel(String(value));
    default:
      return String(value);
  }
}

/** Texto que representa a una entidad (relacion, selector, titulo). */
export function displayEntity(entity: EntityRecord | null | undefined, type: string): string {
  if (!entity) return '—';
  // Tipo abstracto (Persona, Recambio, ...): si viene @odata.type se usa el tipo concreto.
  const concreteSet = setOfEntity(entity, []);
  const definition = concreteSet ? ENTITIES[concreteSet] : BY_TYPE.get(type);
  const fields = definition?.fields;
  const names = displayFieldsOf(definition?.type ?? type, fields).filter((n) => entity[n] != null && entity[n] !== '');
  if (!names.length) return entity.Id != null ? `#${entity.Id}` : '—';
  return names
    .map((n) =>
      formatValue(
        entity[n],
        fields?.find((f) => f.name === n),
      ),
    )
    .join(', ');
}
