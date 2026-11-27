import type { AxiosRequestConfig } from 'axios';

/** Entidad tal como la devuelve la API (propiedades en PascalCase). */
export type EntityRecord = Record<string, unknown>;
export type EntityKey = string | number;

export type FieldKind = 'string' | 'integer' | 'decimal' | 'boolean' | 'datetime' | 'enum';

export interface FieldMeta {
  name: string;
  kind: FieldKind;
  nullable: boolean;
  enumValues?: string[];
  min?: number;
  max?: number;
}

export interface NavigationMeta {
  name: string;
  collection: boolean;
  /** Tipo declarado (puede ser abstracto, ej. Persona). */
  targetType: string;
  /** Entity sets cuyo tipo es targetType o deriva de el. */
  targetSets: string[];
  /** Navegacion simple asignable con PUT .../$ref. */
  canSet: boolean;
  /** Coleccion: se pueden agregar (POST .../$ref) / quitar (DELETE .../$ref) elementos. */
  canAdd: boolean;
  canRemove: boolean;
}

export interface EntityMeta {
  set: string;
  type: string;
  key: { name: string; kind: 'number' | 'string' };
  fields: FieldMeta[];
  navigations: NavigationMeta[];
}

export interface ODataListParams {
  $top?: number;
  $skip?: number;
  $filter?: string;
  $count?: boolean;
  $orderby?: string[];
  $select?: string[];
  $expand?: string[];
}

export interface ODataCollection {
  value?: EntityRecord[];
  '@odata.count'?: number;
}

type RequestOptions = AxiosRequestConfig;

/**
 * Firma comun de las funciones CRUD generadas por orval.
 * (Sintaxis de metodo: los parametros son bivariantes y aceptan las firmas concretas.)
 */
export interface EntityApi {
  list(params?: ODataListParams, options?: RequestOptions, signal?: AbortSignal): Promise<ODataCollection>;
  get(
    id: EntityKey,
    params?: Pick<ODataListParams, '$select' | '$expand'>,
    options?: RequestOptions,
    signal?: AbortSignal,
  ): Promise<EntityRecord>;
  create(data: EntityRecord, options?: RequestOptions): Promise<EntityRecord>;
  update(id: EntityKey, data: EntityRecord, options?: RequestOptions): Promise<unknown>;
  remove(id: EntityKey, options?: RequestOptions): Promise<unknown>;
}
