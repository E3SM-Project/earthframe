/**
 * Matches the JSON “row” from simulations.json.
 * Keep fields nullable/optional where your JSON allows it.
 */
export interface RawSimulation {
  // Configuration
  id: string;
  name: string;
  caseName: string;
  versionTag?: string | null;
  compset?: string | null;
  gridName?: string | null;
  gridResolution?: string | null;
  initializationType?: string | null;
  compiler?: string | null;
  parentSimulationId?: string | null;

  // Provenance & submission
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  lastEditedBy: string;
  lastEditedAt: string;

  // Model setup (context)
  simulationType: 'production' | 'master' | 'experimental';
  status: 'complete' | 'running' | 'not-started' | 'failed';
  campaignId: string;
  experimentTypeId: string;
  machineId: string;
  variables: string[];

  branch?: string | null;
  branchTime?: string | null;
  gitHash?: string | null;
  externalRepoUrl?: string | null;

  modelStartDate: string;
  modelEndDate: string;
  calendarStartDate?: string | null;

  // Execution & output
  runDate?: string | null;
  outputPath?: string | null;
  archivePaths: string[];
  runScriptPaths: string[];
  batchLogPaths: string[] | null;

  // Postprocessing & diagnostics
  postprocessingScriptPath: string[];
  diagnosticLinks: ExternalUrl[];
  paceLinks: ExternalUrl[];

  // Metadata & audit
  notesMarkdown?: string | null;
  knownIssues?: string | null;
  annotations: string[];

  // Optional embedded snapshot (present in your new JSON)
  machine: Machine;
}

export interface ExternalUrl {
  label: string;
  url: string;
}

export interface Machine {
  id: string;
  name: string;
  site?: string;
  architecture?: string;
  scheduler?: string;
  gpu?: boolean;
  notes?: string;
  created_at?: string;
}

/** Domain-friendly type after enrichment (guarantee machine present if you join). */
export type Simulation = RawSimulation & { machine: Machine | null };
