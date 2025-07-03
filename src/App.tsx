import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/routes';
import NavBar from '@/components/layout/NavBar';
import { useEffect, useMemo, useState } from 'react';

export interface Simulation {
  id: string;
  name: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

export default function App() {
  const [data, setData] = useState<Simulation[]>([]); // data
  const [selectedDataIds, setSelectedDataIds] = useState<string[]>([]);

  // TODO: Pass selectedData to AppRoutes to use in child components.
  const selectedData = useMemo(
    () => data.filter((item) => selectedDataIds.includes(item.id)),
    [data, selectedDataIds],
  );

  useEffect(() => {
    fetch('/data/simulations.json')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
    <BrowserRouter>
      <NavBar />
      <AppRoutes
        data={data}
        selectedDataIds={selectedDataIds}
        setSelectedDataIds={setSelectedDataIds}
      />
    </BrowserRouter>
  );
}
