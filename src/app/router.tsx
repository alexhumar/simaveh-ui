import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { NotFound } from '../components/NotFound';
import { InicioPage } from '../features/inicio/InicioPage';
import { MarcaDetailPage } from '../features/marcas/MarcaDetailPage';
import { MarcaFormPage } from '../features/marcas/MarcaFormPage';
import { MarcasListPage } from '../features/marcas/MarcasListPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      {
        path: 'marcas',
        children: [
          { index: true, element: <MarcasListPage /> },
          { path: 'nueva', element: <MarcaFormPage /> },
          { path: ':id', element: <MarcaDetailPage /> },
          { path: ':id/editar', element: <MarcaFormPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
