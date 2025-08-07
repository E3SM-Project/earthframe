import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/routes';
import NavBar from '@/components/layout/NavBar';
import { useEffect, useMemo, useState } from 'react';

export interface Simulation {
  // 🧾 Identification
  id: string;
  name: string;
  tag: string;
  status: string;
  simulationType: 'production' | 'master';

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
  versionTag: string;
  gitHash: string;
  externalRepoUrl: string;
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
