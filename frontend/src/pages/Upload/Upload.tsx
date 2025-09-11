import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { RawSimulation } from '@/types';

/**
 * Minimal inline “token” input (chips) for comma/Enter-separated values.
 * No external deps; keeps MVP scope.
 */
function TokenInput({
  values,
  setValues,
  placeholder = 'Type and press Enter',
}: {
  values: string[];
  setValues: (vals: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const addToken = (v: string) => {
    const val = v.trim();
    if (!val) return;
    if (!values.includes(val)) setValues([...values, val]);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addToken(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      e.preventDefault();
      setValues(values.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-10 items-center flex-wrap gap-2 rounded-md border border-gray-300 px-2 py-2 focus-within:ring-2 focus-within:ring-gray-900/10">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 text-xs"
        >
          {v}
          <button
            type="button"
            className="opacity-60 hover:opacity-100"
            onClick={() => setValues(values.filter((x) => x !== v))}
            aria-label={`Remove ${v}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[12ch] bg-transparent outline-none text-sm"
        value={draft}
        placeholder={values.length ? '' : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => addToken(draft)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

/**
 * Section shell with header + progress and chevrons.
 */
function Section({
  title,
  isOpen,
  onToggle,
  requiredCount,
  satisfiedCount,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  requiredCount?: number;
  satisfiedCount?: number;
  children: React.ReactNode;
}) {
  const done = requiredCount && satisfiedCount !== undefined && satisfiedCount >= requiredCount;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <button
        type="button"
        className="w-full text-left px-5 py-3 bg-gray-50/80 backdrop-blur flex items-center justify-between border-b"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span className="font-semibold">{title}</span>
          {requiredCount ? (
            <span className="text-xs text-muted-foreground">
              ({Math.min(satisfiedCount ?? 0, requiredCount)} of {requiredCount} required)
            </span>
          ) : null}
        </div>
        {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
      </button>
      {isOpen ? <div className="px-5 py-4">{children}</div> : null}
    </div>
  );
}

/**
 * Sticky action bar at bottom.
 */
function StickyActions({
  disabled,
  onSaveDraft,
  onNext,
}: {
  disabled?: boolean;
  onSaveDraft: () => void;
  onNext: () => void;
}) {
  return (
    <div className="sticky bottom-0 inset-x-0 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Tip: You can collapse completed sections to stay focused.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            onClick={onSaveDraft}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={disabled}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            onClick={onNext}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Form ---

const initialState: RawSimulation = {
  // Configuration
  id: '',
  name: '',
  caseName: '',
  versionTag: null,
  compset: null,
  gridName: null,
  gridResolution: null,
  initializationType: null,
  compiler: null,
  parentSimulationId: null,

  // Timeline
  modelStartDate: '',
  modelEndDate: '',
  calendarStartDate: null,

  // Model setup (context)
  simulationType: 'production',
  status: 'not-started',
  campaignId: '',
  experimentTypeId: '',
  machineId: '',
  variables: [],

  // Provenance & submission
  uploadedBy: '',
  uploadDate: '',
  lastModified: '',
  lastEditedBy: '',
  lastEditedAt: '',

  // Version Control
  branch: null,
  branchTime: null,
  gitHash: null,
  externalRepoUrl: null,

  // Execution & output
  runDate: null,
  outputPath: null,
  archivePaths: [],
  runScriptPaths: [],
  batchLogPaths: null,

  // Postprocessing & diagnostics
  postprocessingScriptPath: [],
  diagnosticLinks: [],
  paceLinks: [],

  // Metadata & audit
  notesMarkdown: null,
  knownIssues: null,
  annotations: [],

  // Optional embedded snapshot
  // @ts-expect-error – provided by backend when present
  machine: {},
};

type OpenKey =
  | 'configuration'
  | 'modelSetup'
  | 'versionControl'
  | 'paths'
  | 'docs'
  | 'review'
  | null;

export default function Upload() {
  const [open, setOpen] = useState<OpenKey>('configuration');
  const [form, setForm] = useState<RawSimulation>(initialState);

  // Local-only UI state
  const [variables, setVariables] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [diagLinks, setDiagLinks] = useState<{ label: string; url: string }[]>([]);
  const [paceLinks, setPaceLinks] = useState<{ label: string; url: string }[]>([]);

  // keep RawSimulation.variables synchronized
  const formWithVars = useMemo(() => ({ ...form, variables }), [form, variables]);

  // Simple computed “required satisfied” counts per section
  const configReq = 4; // name, status, campaignId, experimentTypeId
  const configSat =
    (form.name ? 1 : 0) +
    (form.status && form.status !== 'not-started' ? 1 : 0) +
    (form.campaignId ? 1 : 0) +
    (form.experimentTypeId ? 1 : 0);

  const modelReq = 2; // machineId, compiler (if you want strict, adjust)
  const modelSat = (form.machineId ? 1 : 0) + (form.compiler ? 1 : 0);

  const versionReq = 2; // branch, gitHash
  const versionSat = (form.branch ? 1 : 0) + (form.gitHash ? 1 : 0);

  const pathsReq = 3; // outputPath, runScriptPaths
  const pathsSat =
    (form.outputPath ? 1 : 0) +
    (Array.isArray(form.runScriptPaths) && form.runScriptPaths.length ? 1 : 0);

  const allValid = configSat >= configReq && modelSat >= modelReq && versionSat >= versionReq;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggle = (k: OpenKey) => setOpen((prev) => (prev === k ? null : k));

  // helpers for links
  const addDiag = () => setDiagLinks([...diagLinks, { label: '', url: '' }]);
  const setDiag = (i: number, field: 'label' | 'url', v: string) => {
    const next = diagLinks.slice();
    next[i][field] = v;
    setDiagLinks(next);
    setForm((p) => ({ ...p, diagnosticLinks: next }));
  };
  const addPace = () => setPaceLinks([...paceLinks, { label: '', url: '' }]);
  const setPace = (i: number, field: 'label' | 'url', v: string) => {
    const next = paceLinks.slice();
    next[i][field] = v;
    setPaceLinks(next);
    setForm((p) => ({ ...p, paceLinks: next }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Upload a New Simulation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provide configuration and context. You can save a draft at any time.
          </p>
        </header>

        {/* Configuration */}
        <Section
          title="Configuration"
          isOpen={open === 'configuration'}
          onToggle={() => toggle('configuration')}
          requiredCount={configReq}
          satisfiedCount={configSat}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">
                Simulation Name <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., 20190815.ne30_oECv3_ICG.A_WCYCL1850S_CMIP6.piControl"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="not-started">Not started</option>
                <option value="running">Running</option>
                <option value="complete">Complete</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Campaign <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="campaignId"
                value={form.campaignId}
                onChange={handleChange}
                placeholder="e.g., v3.LR"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Experiment Type <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="experimentTypeId"
                value={form.experimentTypeId}
                onChange={handleChange}
                placeholder="e.g., piControl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Target Variables{' '}
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <div className="mt-1">
                <TokenInput
                  values={variables}
                  setValues={setVariables}
                  placeholder="ts, pr, huss…"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Add model variables relevant to this simulation (comma or Enter to add).
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Tags <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <div className="mt-1">
                <TokenInput values={tags} setValues={setTags} placeholder="ocean, ne30, q1-2024…" />
              </div>
            </div>
          </div>
        </Section>

        {/* Model Setup */}
        <Section
          title="Model Setup"
          isOpen={open === 'modelSetup'}
          onToggle={() => toggle('modelSetup')}
          requiredCount={modelReq}
          satisfiedCount={modelSat}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">
                Machine ID <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="machineId"
                value={form.machineId}
                onChange={handleChange}
                placeholder="e.g., cori, perlmutter, lassen"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Compiler <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="compiler"
                value={form.compiler ?? ''}
                onChange={handleChange}
                placeholder="e.g., intel/2021.4"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Grid Name <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="gridName"
                value={form.gridName ?? ''}
                onChange={handleChange}
                placeholder="e.g., ne30_oECv3_ICG"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Compset <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="compset"
                value={form.compset ?? ''}
                onChange={handleChange}
                placeholder="e.g., A_WCYCL1850S_CMIP6"
              />
            </div>
          </div>
        </Section>

        {/* Version Control */}
        <Section
          title="Version Control"
          isOpen={open === 'versionControl'}
          onToggle={() => toggle('versionControl')}
          requiredCount={versionReq}
          satisfiedCount={versionSat}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">
                Branch <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="branch"
                value={form.branch ?? ''}
                onChange={handleChange}
                placeholder="e.g., e3sm-v3"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Git Hash <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="gitHash"
                value={form.gitHash ?? ''}
                onChange={handleChange}
                placeholder="e.g., a1b2c3d"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Branch Time</label>
              <input
                type="datetime-local"
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="branchTime"
                value={(form.branchTime as string) ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                External Repo URL{' '}
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="externalRepoUrl"
                value={form.externalRepoUrl ?? ''}
                onChange={handleChange}
                placeholder="https://github.com/org/repo"
              />
            </div>
          </div>
        </Section>
        {/* Data Paths & Scripts */}
        <Section
          title="Data Paths & Scripts"
          isOpen={open === 'paths'}
          onToggle={() => toggle('paths')}
          requiredCount={pathsReq}
          satisfiedCount={pathsSat}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">
                Output Path <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="outputPath"
                value={form.outputPath ?? ''}
                onChange={handleChange}
                placeholder="/global/archive/sim-output/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Archive Paths (comma-separated) <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="archivePaths"
                value={form.archivePaths?.join?.(', ') ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    archivePaths: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="/global/archive/sim-state/..., /other/path/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Run Script Paths (comma-separated) <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="runScriptPaths"
                value={form.runScriptPaths?.join?.(', ') ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    runScriptPaths: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="/home/user/run.sh, /home/user/run2.sh"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Postprocessing Script Path
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                name="postprocessingScriptPath"
                value={form.postprocessingScriptPath?.join?.(', ') ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    postprocessingScriptPath: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="/home/user/post.sh"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Batch Log Paths
                <span className="text-xs text-muted-foreground ml-1">(optional, one per line)</span>
              </label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2"
                name="batchLogPaths"
                value={form.batchLogPaths?.join('\n') ?? ''}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    batchLogPaths: e.target.value
                      .split('\n')
                      .map(s => s.trim())
                      .filter(Boolean),
                  }))
                }
                rows={2}
                placeholder="/autolog/sim/run-19345.log"
              />
            </div>
          </div>
        </Section>

        {/* Documentation & Notes */}
        <Section
          title="Documentation & Notes"
          isOpen={open === 'docs'}
          onToggle={() => toggle('docs')}
        >
          <div className="space-y-6">
            <div>
              <div className="font-medium mb-2">
                Diagnostic Links <span className="text-xs text-muted-foreground">(optional)</span>
              </div>
              {diagLinks.map((lnk, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="w-1/3 h-10 rounded-md border px-3"
                    placeholder="Label"
                    value={lnk.label}
                    onChange={(e) => setDiag(i, 'label', e.target.value)}
                  />
                  <input
                    className="w-2/3 h-10 rounded-md border px-3"
                    placeholder="URL"
                    value={lnk.url}
                    onChange={(e) => setDiag(i, 'url', e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="text-sm text-blue-600 underline" onClick={addDiag}>
                + Add Link
              </button>
            </div>

            <div>
              <div className="font-medium mb-2">
                PACE Links <span className="text-xs text-muted-foreground">(optional)</span>
              </div>
              {paceLinks.map((lnk, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="w-1/3 h-10 rounded-md border px-3"
                    placeholder="Label"
                    value={lnk.label}
                    onChange={(e) => setPace(i, 'label', e.target.value)}
                  />
                  <input
                    className="w-2/3 h-10 rounded-md border px-3"
                    placeholder="URL"
                    value={lnk.url}
                    onChange={(e) => setPace(i, 'url', e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="text-sm text-blue-600 underline" onClick={addPace}>
                + Add Link
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">
                Notes (Markdown){' '}
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2"
                name="notesMarkdown"
                value={form.notesMarkdown ?? ''}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Known Issues <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2"
                name="knownIssues"
                value={form.knownIssues ?? ''}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Annotations (JSON/text){' '}
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2"
                name="annotations"
                value={form.annotations ?? ''}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </Section>

        {/* Review & Submit */}
        <Section
          title="Review & Submit"
          isOpen={open === 'review'}
          onToggle={() => toggle('review')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div>
                  <strong>Name:</strong> {form.name || '—'}
                </div>
                <div>
                  <strong>Status:</strong> {form.status || '—'}
                </div>
                <div>
                  <strong>Campaign:</strong> {form.campaignId || '—'}
                </div>
                <div>
                  <strong>Experiment Type:</strong> {form.experimentTypeId || '—'}
                </div>
                <div>
                  <strong>Variables:</strong> {variables.join(', ') || '—'}
                </div>
                <div>
                  <strong>Tags:</strong> {tags.join(', ') || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <strong>Machine ID:</strong> {form.machineId || '—'}
                </div>
                <div>
                  <strong>Compiler:</strong> {form.compiler || '—'}
                </div>
                <div>
                  <strong>Grid:</strong> {form.gridName || '—'}
                </div>
                <div>
                  <strong>Branch:</strong> {form.branch || '—'}
                </div>
                <div>
                  <strong>Git Hash:</strong> {form.gitHash || '—'}
                </div>
                <div>
                  <strong>External Repo:</strong> {form.externalRepoUrl || '—'}
                </div>
              </div>
            </div>

            <div className="text-sm">
              <strong>Output Path:</strong> {form.outputPath || '—'}
              <br />
              <strong>Archive Paths:</strong> {(form.archivePaths || []).join(', ') || '—'}
              <br />
              <strong>Run Scripts:</strong> {(form.runScriptPaths || []).join(', ') || '—'}
            </div>

            <div className="text-sm">
              <strong>Diagnostic Links:</strong>
              <ul className="list-disc ml-6">
                {diagLinks.map((l, i) => (
                  <li key={i}>
                    {l.label ? `${l.label}: ` : ''}
                    <a href={l.url} className="text-blue-600 underline">
                      {l.url}
                    </a>
                  </li>
                ))}
                {diagLinks.length === 0 ? (
                  <li className="list-none text-muted-foreground">—</li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="border px-5 py-2 rounded-md"
              onClick={() => {
                setForm(initialState);
                setVariables([]);
                setTags([]);
                setDiagLinks([]);
                setPaceLinks([]);
              }}
            >
              Reset Form
            </button>
            <button
              type="button"
              className="bg-gray-900 text-white px-5 py-2 rounded-md disabled:opacity-50"
              disabled={!allValid}
              onClick={() => {
                // In your app, submit formWithVars + tags to backend
                alert('Submitted!');
              }}
            >
              Submit Simulation
            </button>
          </div>
        </Section>

        {/* Sticky actions */}
        <StickyActions
          disabled={!allValid}
          onSaveDraft={() => console.log('Save draft', formWithVars, { tags })}
          onNext={() => {
            if (!allValid) return window.scrollTo({ top: 0, behavior: 'smooth' });
            setOpen('review');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
}
