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
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
  selectedData: Simulation[];
}

const createRoutes = ({
  data,
  selectedDataIds,
  setSelectedDataIds,
  selectedData,
}: RoutesProps): RouteObject[] => {
  return [
    {
      path: '/',
      element: <Navigate to="/browse" replace />,
    },
    {
      path: '/browse',
      element: (
        <Browse
          data={data}
          selectedDataIds={selectedDataIds}
          setSelectedDataIds={setSelectedDataIds}
        />
      ),
    },
    {
      path: '/compare',
      element: (
        <Compare
          data={data}
          selectedDataIds={selectedDataIds}
          setSelectedDataIds={setSelectedDataIds}
          selectedData={selectedData}
        />
      ),
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

export const AppRoutes = ({
  data,
  selectedDataIds,
  setSelectedDataIds,
  selectedData,
}: RoutesProps) => {
  const routes = createRoutes({ data, selectedDataIds, setSelectedDataIds, selectedData });
  const routing = useRoutes(routes);

  return routing;
};
