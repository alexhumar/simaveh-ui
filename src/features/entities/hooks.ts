import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../api/http';
import { addReference, removeReference, setReference } from '../../api/references';
import type { EntitySet } from '../../api/generated/entities';
import { ENTITY_API } from '../../api/generated/entity-api';
import { ENTITIES, formatKey } from '../../entities/registry';
import type { EntityKey, EntityRecord, ODataCollection, ODataListParams } from '../../entities/types';
import { invalidateEntitySet } from '../../lib/odata';

/**
 * Hooks genericos sobre las funciones CRUD generadas (ENTITY_API).
 * Las query keys siguen el formato de orval (la URL), asi `invalidateEntitySet` invalida
 * por igual lo generado y lo generico.
 */
const entityApi = (set: EntitySet) => ENTITY_API[set];

/** Segmento OData de una entidad: `Marcas(1)`, `Monedas('ARS')`. */
export const entityUrl = (set: EntitySet, key: EntityKey) => `${set}(${formatKey(ENTITIES[set], key)})`;

export function useEntityList(set: EntitySet, params: ODataListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [`/simaveh/${set}`, params],
    queryFn: ({ signal }) => entityApi(set).list(params, undefined, signal),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useEntity(set: EntitySet, key: EntityKey | undefined, params?: { $expand?: string[] }) {
  return useQuery({
    queryKey: [`/simaveh/${key === undefined ? set : entityUrl(set, key)}`, params],
    queryFn: ({ signal }) => entityApi(set).get(key!, params, undefined, signal),
    enabled: key !== undefined,
  });
}

/** Elementos de una navegacion de coleccion: GET `/simaveh/Marcas(1)/Categorias`. */
export function useNavigationCollection(set: EntitySet, key: EntityKey, navigation: string, params: ODataListParams) {
  const url = `/simaveh/${entityUrl(set, key)}/${navigation}`;
  return useQuery({
    queryKey: [url, params],
    queryFn: ({ signal }) => httpClient<ODataCollection>({ url, method: 'GET', params, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteEntity(set: EntitySet) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: EntityKey) => entityApi(set).remove(key),
    onSuccess: () => invalidateEntitySet(queryClient, set),
  });
}

export interface ReferenceChange {
  navigation: string;
  targetSet: EntitySet;
  targetKey: EntityKey;
}

export interface SaveEntityInput {
  key?: EntityKey;
  data: EntityRecord;
  references: ReferenceChange[];
}

/** Error al asignar relaciones despues de haber guardado la entidad. */
export class ReferenceAssignmentError extends Error {
  readonly key: EntityKey;
  readonly failed: { navigation: string; error: unknown }[];

  constructor(key: EntityKey, failed: { navigation: string; error: unknown }[]) {
    super('La entidad se guardo, pero no se pudieron asignar algunas relaciones.');
    this.key = key;
    this.failed = failed;
  }
}

/**
 * Alta o edicion: POST/PATCH con los campos y luego PUT `$ref` por cada relacion simple cambiada
 * (la API no acepta relaciones en el cuerpo).
 */
export function useSaveEntity(set: EntitySet) {
  const queryClient = useQueryClient();
  const definition = ENTITIES[set];
  return useMutation({
    mutationFn: async ({ key, data, references }: SaveEntityInput): Promise<EntityKey> => {
      let savedKey = key;
      if (key === undefined) {
        const created = await entityApi(set).create(data);
        savedKey = created[definition.key.name] as EntityKey;
      } else {
        await entityApi(set).update(key, data);
      }
      const failed: { navigation: string; error: unknown }[] = [];
      for (const ref of references) {
        try {
          await setReference(entityUrl(set, savedKey!), ref.navigation, entityUrl(ref.targetSet, ref.targetKey));
        } catch (error) {
          failed.push({ navigation: ref.navigation, error });
        }
      }
      if (failed.length) throw new ReferenceAssignmentError(savedKey!, failed);
      return savedKey!;
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        invalidateEntitySet(queryClient, set),
        ...variables.references.map((r) => invalidateEntitySet(queryClient, r.targetSet)),
      ]);
    },
  });
}

/** Agregar / quitar elementos de una navegacion de coleccion. */
export function useCollectionReference(set: EntitySet, key: EntityKey, navigation: string) {
  const queryClient = useQueryClient();
  const invalidate = (targetSet: EntitySet) =>
    Promise.all([invalidateEntitySet(queryClient, set), invalidateEntitySet(queryClient, targetSet)]);

  const add = useMutation({
    mutationFn: ({ targetSet, targetKey }: { targetSet: EntitySet; targetKey: EntityKey }) =>
      addReference(entityUrl(set, key), navigation, entityUrl(targetSet, targetKey)),
    onSuccess: (_d, v) => invalidate(v.targetSet),
  });
  const remove = useMutation({
    mutationFn: ({ targetSet, targetKey }: { targetSet: EntitySet; targetKey: EntityKey }) =>
      removeReference(entityUrl(set, key), navigation, formatKey(ENTITIES[targetSet], targetKey)),
    onSuccess: (_d, v) => invalidate(v.targetSet),
  });
  return { add, remove };
}
