// src/routes/routes.tsx

import { RouteObject, useRoutes } from 'react-router-dom';

import Search from '@/pages/Search/Search';
import Compare from '@/pages/Compare/Compare';
import Upload from '@/pages/Upload/Upload';
import Docs from '@/pages/Docs/Docs';
import { Simulation } from '@/App';
import Home from '@/pages/Home/Home';

interface RoutesProps {
  simulations: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
  selectedSimulations: Simulation[];
}

const createRoutes = ({
  simulations,
  selectedSimulationIds,
  setSelectedSimulationIds,
  selectedSimulations,
}: RoutesProps): RouteObject[] => {
  return [
    {
      path: '/',
      element: <Home simulations={simulations} />,
    },
    {
      path: '/search',
      element: (
        <Search
          simulations={simulations}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
        />
      ),
    },
    {
      path: '/compare',
      element: (
        <Compare
          simulations={simulations}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
          selectedSimulations={selectedSimulations}
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
  simulations,
  selectedSimulationIds,
  setSelectedSimulationIds,
  selectedSimulations,
}: RoutesProps) => {
  const routes = createRoutes({
    simulations,
    selectedSimulationIds,
    setSelectedSimulationIds,
    selectedSimulations,
  });
  const routing = useRoutes(routes);

  return routing;
};
