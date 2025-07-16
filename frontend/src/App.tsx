import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/routes';
import NavBar from '@/components/layout/NavBar';
import { useEffect, useMemo, useState } from 'react';

export interface Simulation {
  id: string;
  name: string;
  modelStartDate: string; // Start date of the model simulation
  runStartDate: string; // Date when the simulation run started

  repo: string; // Default "E3SM", can be forked repos for rare cases
  branch: string; // At least one of branch or tag is required
  tag: string; // At least one of branch or tag is required

  campaign: string;
  compset: string;
  gridName: string;
  machine: string;
  compiler: string;

  notes: string;
  keyFeatures: string;
  knownIssues: string;

  runScripts: ExternalUrl[];
  outputLocation: ExternalUrl[];
  archiveLocation: ExternalUrl[];
  diagnosticLinks: ExternalUrl[];
  paceLinks: ExternalUrl[];
}
export interface ExternalUrl {
  label: string; // e.g., "Documentation", "Results"
  url: string;
}

export default function App() {
  const [data, setData] = useState<Simulation[]>([]); // data

  const LOCAL_STORAGE_KEY = 'selectedDataIds';

  const [selectedDataIds, setSelectedDataIds] = useState<string[]>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever selectedDataIds changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedDataIds));
  }, [selectedDataIds]);

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
        selectedData={selectedData}
      />
    </BrowserRouter>
  );
}
