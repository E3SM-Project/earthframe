import { RouteObject, useLocation, useParams, useRoutes } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSimulation } from '@/hooks/useSimulation';
import Browse from '@/pages/Browse/Browse';
import Compare from '@/pages/Compare/Compare';
import Docs from '@/pages/Docs/Docs';
import Home from '@/pages/Home/Home';
import SimulationDetails from '@/pages/Simulations/SimulationDetails';
import Simulations from '@/pages/Simulations/Simulations';
import Upload from '@/pages/Upload/Upload';
import type { Simulation } from '@/types/index';

interface RoutesProps {
  simulations: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
  selectedSimulations: Simulation[];
}
const SimulationDetailsRoute = () => {
  const { id = '' } = useParams();
  const location = useLocation() as { state?: { seed?: Simulation } };
  const seed = location.state?.seed;
  const { data, isLoading, error, refetch } = useSimulation(id, seed);

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading simulation…</div>;
  }
  if (error || !data) {
    return (
      <div className="p-8 space-y-3">
        <div className="text-base font-semibold">Simulation not found</div>
        <div className="text-sm text-muted-foreground">
          We couldn&apos;t load the simulation with id: <code>{id}</code>.
        </div>
        <Button size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return <SimulationDetails simulation={data} canEdit={false} />;
};

const createRoutes = ({
  simulations,
  selectedSimulationIds,
  setSelectedSimulationIds,
  selectedSimulations,
}: RoutesProps): RouteObject[] => {
  return [
    { path: '/', element: <Home simulations={simulations} /> },
    {
      path: '/browse',
      element: (
        <Browse
          simulations={simulations}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
        />
      ),
    },
    { path: '/simulations', element: <Simulations simulations={simulations} /> },
    // Details page now fetches by :id (no need to pass list)
    { path: '/simulations/:id', element: <SimulationDetailsRoute /> },
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
    { path: '/upload', element: <Upload /> },
    { path: '/docs', element: <Docs /> },
    { path: '*', element: <div className="p-8">404 - Page not found</div> },
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
