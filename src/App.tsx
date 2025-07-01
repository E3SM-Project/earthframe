import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from '@/routes/routes';
import NavBar from '@/components/layout/NavBar';

function AppRoutes() {
  const routing = useRoutes(routes);
  return routing;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <AppRoutes />
    </BrowserRouter>
  );
}
