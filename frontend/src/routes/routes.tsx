// src/routes/routes.tsx

import { RouteObject, useRoutes } from 'react-router-dom';

import Search from '@/pages/Search/Search';
import Compare from '@/pages/Compare/Compare';
import Upload from '@/pages/Upload/Upload';
import Docs from '@/pages/Docs/Docs';
import { Simulation } from '@/App';
import Home from '@/pages/Home/Home';

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
      element: <Home data={data} />,
    },
    {
      path: '/search',
      element: (
        <Search
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
      path: '/upload',
      element: <Upload />,
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
