import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { useSimulations } from '@/api/simulations';
import NavBar from '@/components/layout/NavBar';
import { AppRoutes } from '@/routes/routes';

export default function App() {
  const simulations = useSimulations();

  const LOCAL_STORAGE_KEY = 'selectedSimulationIds';

  const [selectedSimulationIds, setSelectedSimulationIds] = useState<string[]>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever selectedSimulationIds changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedSimulationIds));
  }, [selectedSimulationIds]);

  const selectedSimulations = useMemo(
    () => (simulations.data ?? []).filter((item) => selectedSimulationIds.includes(item.id)),
    [simulations.data, selectedSimulationIds],
  );

  return (
    <BrowserRouter>
      <NavBar selectedSimulationIds={selectedSimulationIds} />
      <AppRoutes
        simulations={simulations.data}
        selectedSimulationIds={selectedSimulationIds}
        setSelectedSimulationIds={setSelectedSimulationIds}
        selectedSimulations={selectedSimulations}
      />
    </BrowserRouter>
  );
}
