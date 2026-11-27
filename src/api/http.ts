import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * Instancia HTTP compartida por todo el cliente generado con orval
 * (es el `mutator` configurado en `orval.config.ts`).
 *
 * En desarrollo `VITE_API_BASE_URL` queda vacio y Vite hace de proxy hacia la API
 * (ver `vite.config.ts`), asi se evitan CORS y el certificado autofirmado.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { Accept: 'application/json' },
  // OData espera las listas separadas por coma: $select=Id,Nombre&$orderby=Nombre desc
  paramsSerializer: { serialize: serializeODataParams },
});

function serializeODataParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.append(key, value.join(','));
    } else {
      search.append(key, String(value));
    }
  }
  return search.toString();
}

export const httpClient = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
  axiosInstance({ ...config, ...options }).then(({ data }) => data);

export type ErrorType<E> = AxiosError<E>;
export type BodyType<B> = B;
