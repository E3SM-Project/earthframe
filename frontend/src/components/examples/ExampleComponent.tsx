/**
 * ExampleComponent.tsx
 *
 * This file defines the `ExampleComponent`, a React functional component
 * that demonstrates the use of React hooks, router utilities, and local state.
 *
 * Features:
 * - Displays an ID (formatted if provided) and a count.
 * - Provides buttons to increment the count and navigate to the dashboard.
 * - Logs location changes using the `useLocation` hook.
 *
 * The component is structured with clear sections for imports, types, helpers,
 * state, effects, handlers, and rendering for better readability and maintainability.
 */

// -------------------- Imports --------------------
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// import { selectSomething } from "@/store/selectors";
import { Button } from '@/components/ui/button';

// -------------------- Types & Interfaces --------------------
interface ExampleComponentProps {
  id?: string;
}

// -------------------- Pure Helpers --------------------
// Keep small, pure utility functions here (no hooks, no side effects).
const formatLabel = (label: string) => label.toUpperCase();

// -------------------- Component --------------------
const ExampleComponent: React.FC<ExampleComponentProps> = ({ id }) => {
  // -------------------- Router --------------------
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // -------------------- Global State --------------------
  // const something = useSelector(selectSomething);

  // -------------------- Local State --------------------
  const [count, setCount] = useState(0);

  // -------------------- Derived Data --------------------
  const formattedId = id ? formatLabel(id) : 'N/A';
  const isActive = count > 0;

  // -------------------- Effects --------------------
  useEffect(() => {
    console.log('Location changed:', location.pathname);
  }, [location.pathname]);

  // -------------------- Handlers --------------------
  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleNavigate = () => navigate('/dashboard');

  // -------------------- Render --------------------
  return (
    <div>
      <h1>Example Component</h1>
      <p>ID: {formattedId}</p>
      <p>Count: {count}</p>
      {isActive && <p>Status: Active</p>}

      <Button onClick={handleIncrement}>Increment</Button>
      <Button onClick={handleNavigate}>Go to Dashboard</Button>
    </div>
  );
};

export default ExampleComponent;
