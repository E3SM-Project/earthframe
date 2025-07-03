// src/routes/routes.tsx

import { RouteObject, useRoutes } from 'react-router-dom';

import Browse from '@/pages/Browse/Browse';
import Compare from '@/pages/Compare/Compare';
import Submit from '@/pages/Submit/Submit';
import Docs from '@/pages/Docs/Docs';
import { Navigate } from 'react-router-dom';
import { Simulation } from '@/App';

interface RoutesProps {
  data: Simulation[];
}

const createRoutes = ({ data }: RoutesProps): RouteObject[] => {
  return [
    {
      path: '/',
      element: <Navigate to="/browse" replace />,
    },
    {
      path: '/browse',
      element: <Browse data={data} />,
    },
    {
      path: '/compare',
      element: <Compare />,
    },
    {
      path: '/submit',
      element: <Submit />,
    },
    {
      path: '/docs',
      element: <Docs />,
    },
    {
      path: '*',
      element: <div>404 - Page not found</div>,
    },
  ];
};

export const AppRoutes = ({ data }: { data: Simulation[] }) => {
  const routes = createRoutes({ data });
  const routing = useRoutes(routes);

  return routing;
};
