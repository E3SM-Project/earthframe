/**
 * Matches the JSON “row” from simulations.json.
 * Keep fields nullable/optional where your JSON allows it.
 */
export interface RawSimulation {
  // Identification
  id: string;
  name: string;
  versionTag?: string | null;
  gitHash?: string | null;
  externalRepoUrl?: string | null;
  status: 'complete' | 'running' | 'not-started' | 'failed';
  simulationType: 'production' | 'master' | 'experimental';

  // Provenance & submission
  campaignId: string;
  experimentTypeId: string;
  variables: string[];
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  lastEditedBy: string;
  lastEditedAt: string;

  // Model setup
  machineId: string;
  compiler?: string | null;
  compset?: string | null;
  gridName?: string | null;
  gridResolution?: string | null;
  initializationType?: string | null;
  parentSimulationId?: string | null;
  branch?: string | null;
  branchTime?: string | null;
  modelStartDate?: string | null;
  modelEndDate?: string | null;
  calendarStartDate?: string | null;

  // Execution & output
  runDate?: string | null;
  outputPath?: string | null;
  archivePath: string[];
  runScriptPath: string[];
  batchLogPaths: string[];

  // Postprocessing & diagnostics
  postprocessingScriptPath: string[];
  diagnosticLinks: ExternalUrl[];
  paceLinks: ExternalUrl[];

  // Metadata & audit
  notesMarkdown?: string | null;
  knownIssues?: string | null;
  annotations: string[];

  // Optional embedded snapshot (present in your new JSON)
  machine?: Machine | null;
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
