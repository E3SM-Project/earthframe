import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import NavBar from '@/components/layout/NavBar';
import { AppRoutes } from '@/routes/routes';

export interface Simulation {
  // 🧾 Identification
  id: string;
  name: string;
  versionTag: string;
  gitHash: string;
  externalRepoUrl: string;
  status: 'complete' | 'running' | 'not-started' | 'failed';
  simulationType: 'production' | 'master' | 'experimental';

  // 📦 Provenance & Submission
  campaignId: string;
  experimentTypeId: string;
  variables: string[];
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  lastEditedBy: string;
  lastEditedAt: string;

  // 🧪 Model Setup
  machineId: string;
  compiler: string;
  compset: string;
  gridName: string;
  initializationType: string;
  parentSimulationId: string;
  branch: string;
  branchTime: string;
  modelStartDate: string;
  modelEndDate: string;
  calendarStartDate: string;

  // 🏃 Execution & Output
  runDate: string;
  outputPath: string;
  archivePath: string;
  runScriptPath: string;
  batchLogPaths: ExternalUrl[];

  // 🧹 Postprocessing & Diagnostics
  postprocessingScriptPath: string;
  diagnosticLinks: ExternalUrl[];
  paceLinks: ExternalUrl[];

  // 📝 Metadata & Audit
  notesMarkdown: string;
  knownIssues: string;
  annotations: string;
}
export interface ExternalUrl {
  label: string; // e.g., "Documentation", "Results"
  url: string;
}

export default function App() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);

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
    () => simulations.filter((item) => selectedSimulationIds.includes(item.id)),
    [simulations, selectedSimulationIds],
  );

  useEffect(() => {
    fetch('/data/simulations.json')
      .then((res) => res.json())
      .then((json) => setSimulations(json));
  }, []);

  return (
    <BrowserRouter>
      <NavBar selectedSimulationIds={selectedSimulationIds} />
      <AppRoutes
        simulations={simulations}
        selectedSimulationIds={selectedSimulationIds}
        setSelectedSimulationIds={setSelectedSimulationIds}
        selectedSimulations={selectedSimulations}
      />
    </BrowserRouter>
  );
}
