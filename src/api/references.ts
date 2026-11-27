import { httpClient } from './http';

/**
 * Operaciones `$ref` de OData (asignar/agregar/quitar relaciones) y lectura de navegaciones.
 * Las funciones generadas por orval (`MarcasCreateRef`, ...) tienen la misma forma con un
 * nombre distinto por set; estas son la version generica para el CRUD basado en metadata.
 * `entityUrl` es el segmento OData ya formateado, ej. `Marcas(1)` o `Monedas('ARS')`.
 */

let serviceRootPromise: Promise<string> | undefined;

/**
 * URL absoluta de la raiz del servicio segun la propia API (`@odata.context` del documento de servicio).
 * Se usa para `@odata.id`, asi la referencia apunta a la API y no al origen del front/proxy.
 */
export function getServiceRoot(): Promise<string> {
  serviceRootPromise ??= httpClient<{ '@odata.context'?: string }>({ url: '/simaveh', method: 'GET' })
    .then((doc) => {
      const context = doc['@odata.context'];
      if (!context) throw new Error('La API no devolvio @odata.context');
      return context.replace(/\$metadata.*$/, '');
    })
    .catch((error) => {
      serviceRootPromise = undefined;
      throw error;
    });
  return serviceRootPromise;
}

async function referenceBody(targetUrl: string) {
  return { '@odata.id': `${await getServiceRoot()}${targetUrl}` };
}

/** PUT `/simaveh/{entity}/{nav}/$ref`: asigna una navegacion simple. */
export async function setReference(entityUrl: string, navigation: string, targetUrl: string) {
  return httpClient<void>({
    url: `/simaveh/${entityUrl}/${navigation}/$ref`,
    method: 'PUT',
    data: await referenceBody(targetUrl),
  });
}

/** POST `/simaveh/{entity}/{nav}/$ref`: agrega un elemento a una coleccion. */
export async function addReference(entityUrl: string, navigation: string, targetUrl: string) {
  return httpClient<void>({
    url: `/simaveh/${entityUrl}/${navigation}/$ref`,
    method: 'POST',
    data: await referenceBody(targetUrl),
  });
}

/** DELETE `/simaveh/{entity}/{nav}({relatedKey})/$ref`: quita un elemento de una coleccion. */
export function removeReference(entityUrl: string, navigation: string, relatedKey: string) {
  return httpClient<void>({ url: `/simaveh/${entityUrl}/${navigation}(${relatedKey})/$ref`, method: 'DELETE' });
}
