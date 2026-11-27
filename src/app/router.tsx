import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { NotFound } from '../components/NotFound';

/**
 * Las pantallas de entidades son genericas: `/:slug` es el entity set en kebab-case
 * (ej. `/categorias-marca`), resuelto con la metadata en `src/entities/registry.ts`.
 * Se cargan en diferido para no inflar el bundle inicial.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../features/inicio/InicioPage')).InicioPage }) },
      {
        path: ':slug',
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('../features/entities/EntityListPage')).EntityListPage }),
          },
          {
            path: 'nueva',
            lazy: async () => ({ Component: (await import('../features/entities/EntityFormPage')).EntityFormPage }),
          },
          {
            path: ':id',
            lazy: async () => ({ Component: (await import('../features/entities/EntityDetailPage')).EntityDetailPage }),
          },
          {
            path: ':id/editar',
            lazy: async () => ({ Component: (await import('../features/entities/EntityFormPage')).EntityFormPage }),
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
