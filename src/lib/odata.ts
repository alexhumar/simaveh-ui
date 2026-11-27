import axios from 'axios';
import type { QueryClient } from '@tanstack/react-query';

/** Escapa un literal de texto para usarlo dentro de un `$filter` OData. */
export const odataString = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** `contains(tolower(Campo),'texto')`, o `undefined` si no hay texto. */
export function containsFilter(field: string, text: string): string | undefined {
  const term = text.trim().toLowerCase();
  return term ? `contains(tolower(${field}),${odataString(term)})` : undefined;
}

/**
 * Invalida todas las queries de un entity set (lista, detalle y navegaciones).
 * Las query keys generadas por orval empiezan con la URL: `/simaveh/Marcas`, `/simaveh/Marcas(1)`, ...
 */
export function invalidateEntitySet(queryClient: QueryClient, entitySet: string) {
  const prefix = `/simaveh/${entitySet}`;
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      typeof queryKey[0] === 'string' && (queryKey[0] === prefix || queryKey[0].startsWith(`${prefix}(`)),
  });
}

/**
 * Extrae mensajes legibles de un error de la API.
 * - 400 de validacion: la API responde `{ value: string[] }` (el contrato declara `string[]`; se aceptan ambos).
 * - Errores OData: `{ error: { message } }`.
 */
export function getApiErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;
    if (Array.isArray(data)) return data.map(String);
    if (data && typeof data === 'object') {
      const obj = data as { value?: unknown; error?: { message?: string } };
      if (Array.isArray(obj.value)) return obj.value.map(String);
      if (obj.error?.message) return [obj.error.message];
    }
    if (error.response?.status === 404) return ['El registro no existe.'];
    return [error.message];
  }
  return [error instanceof Error ? error.message : 'Error inesperado.'];
}
