import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/routes';
import NavBar from '@/components/layout/NavBar';
import { useEffect, useState } from 'react';

export interface Simulation {
  id: string;
  name: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

export default function App() {
  const [data, setData] = useState<Simulation[]>([]);

  useEffect(() => {
    fetch('/data/simulations.json')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
    <BrowserRouter>
      <NavBar />
      <AppRoutes data={data} />
    </BrowserRouter>
  );
}
