import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { useSimulations } from '@/api/simulations';
import NavBar from '@/components/layout/NavBar';
import { AppRoutes } from '@/routes/routes';

const App = () => {
  // -------------------- Constants --------------------
  const LOCAL_STORAGE_KEY = 'selectedSimulationIds';

  // -------------------- Local State --------------------
  const queryClient = useMemo(() => new QueryClient(), []);

  // Fetch simulations data using custom hook.
  const simulations = useSimulations();

  const [selectedSimulationIds, setSelectedSimulationIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const selectedSimulations = useMemo(
    () => (simulations.data ?? []).filter((item) => selectedSimulationIds.includes(item.id)),
    [simulations.data, selectedSimulationIds],
  );
  // -------------------- Effects --------------------
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedSimulationIds));
  }, [selectedSimulationIds]);

  // -------------------- Render --------------------
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavBar selectedSimulationIds={selectedSimulationIds} />
        <AppRoutes
          simulations={simulations.data}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
          selectedSimulations={selectedSimulations}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
