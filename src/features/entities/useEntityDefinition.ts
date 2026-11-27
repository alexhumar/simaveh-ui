import { useParams } from 'react-router-dom';
import { entityBySlug, parseKey } from '../../entities/registry';

/** Definicion del entity set y clave segun la URL (`/:slug/:id`). */
export function useEntityRoute() {
  const { slug, id } = useParams();
  const definition = entityBySlug(slug);
  const key = definition && id !== undefined ? parseKey(definition, id) : undefined;
  return { definition, key };
}
