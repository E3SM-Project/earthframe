import { TooltipProvider } from '@radix-ui/react-tooltip';
import { LayoutGrid, Table } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import BrowseCardsView from '@/pages/Browse/BrowseCardsView';
import BrowseFiltersSidePanel from '@/pages/Browse/BrowseFiltersSidePanel';
import { BrowseTableView } from '@/pages/Browse/BrowseTableView';
import type { Simulation } from '@/types/index';

export interface FilterState {
  // Scientific Goal
  campaignId: string[];
  experimentTypeId: string[];
  variables: string[];

  // Simulation Context
  machineId: string[];
  compset: string[];
  gridName: string[];
  simulationType: string[];
  versionTag: string[];

  // Execution Details
  status: string[];
  modelStartDate: string;
  modelEndDate: string;

  // Metadata
  uploadStartDate: string; // ISO Date
  uploadEndDate: string; // ISO Date
}

interface BrowseProps {
  simulations: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
}

const parseDate = (s?: string) => (s ? new Date(s) : undefined);

const Browse = ({ simulations, selectedSimulationIds, setSelectedSimulationIds }: BrowseProps) => {
  // -------------------- Router --------------------
  const location = useLocation();
  const navigate = useNavigate();

  // -------------------- Local State --------------------
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    campaignId: [],
    experimentTypeId: [],
    variables: [],
    machineId: [],
    compset: [],
    gridName: [],
    simulationType: [],
    versionTag: [],
    status: [],
    modelStartDate: '',
    modelEndDate: '',
    uploadStartDate: '',
    uploadEndDate: '',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // -------------------- Derived Data --------------------
  const simMachineId = (s: Simulation) =>
    s.machine?.id ??
    (typeof (s as { machineId?: string }).machineId === 'string'
      ? (s as { machineId?: string }).machineId
      : undefined);
  const simMachineName = (s: Simulation) => s.machine?.name ?? 'Unknown machine';

  const machineOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of simulations) {
      const id = simMachineId(s);
      if (id) m.set(id, simMachineName(s));
    }
    return Array.from(m, ([value, label]) => ({ value, label }));
  }, [simulations]);

  const availableFilters = useMemo(() => {
    const initial: FilterState = {
      campaignId: [],
      experimentTypeId: [],
      variables: [],
      machineId: [],
      compset: [],
      gridName: [],
      simulationType: [],
      versionTag: [],
      status: [],
      modelStartDate: '',
      modelEndDate: '',
      uploadStartDate: '',
      uploadEndDate: '',
    };

    for (const sim of simulations) {
      const mid = simMachineId(sim);
      if (mid && !initial.machineId.includes(mid)) initial.machineId.push(mid);

      const keys = [
        'campaignId',
        'experimentTypeId',
        'variables',
        'compset',
        'gridName',
        'simulationType',
        'versionTag',
        'status',
      ] as const;

      for (const key of keys) {
        const value = (sim as Simulation)[key];

        if (Array.isArray(value)) {
          for (const v of value) {
            if (v && !(initial[key] as string[]).includes(v)) {
              (initial[key] as string[]).push(v);
            }
          }
        } else if (typeof value === 'string' && value) {
          if (!(initial[key] as string[]).includes(value)) {
            (initial[key] as string[]).push(value);
          }
        }
      }
    }

    return initial;
  }, [simulations]);

  const filteredData = useMemo(() => {
    const startModel = parseDate(appliedFilters.modelStartDate);
    const endModel = parseDate(appliedFilters.modelEndDate);
    const startUpload = parseDate(appliedFilters.uploadStartDate);
    const endUpload = parseDate(appliedFilters.uploadEndDate);

    const arrayFilterGetters: Record<
      keyof FilterState,
      (rec: Simulation) => string | string[] | undefined
    > = {
      machineId: (rec) => simMachineId(rec) ?? '',
      campaignId: (rec) => rec.campaignId ?? [],
      experimentTypeId: (rec) => rec.experimentTypeId ?? [],
      variables: (rec) => rec.variables ?? [],
      compset: (rec) => rec.compset ?? [],
      gridName: (rec) => rec.gridName ?? [],
      simulationType: (rec) => rec.simulationType ?? [],
      versionTag: (rec) => rec.versionTag ?? [],
      status: (rec) => rec.status ?? [],
      modelStartDate: () => undefined,
      modelEndDate: () => undefined,
      uploadStartDate: () => undefined,
      uploadEndDate: () => undefined,
    };

    return simulations.filter((record) => {
      for (const key of Object.keys(arrayFilterGetters) as (keyof FilterState)[]) {
        if (Array.isArray(appliedFilters[key]) && (appliedFilters[key] as string[]).length > 0) {
          const raw = arrayFilterGetters[key](record);
          const recVals = Array.isArray(raw) ? raw : ([raw].filter(Boolean) as string[]);
          if (!recVals.some((v) => (appliedFilters[key] as string[]).includes(v as string))) {
            return false;
          }
        }
      }

      if (startModel || endModel) {
        const recStart = parseDate((record as Simulation).modelStartDate);
        const recEnd = parseDate((record as Simulation).modelEndDate);
        if (startModel && recStart && recStart < startModel) return false;
        if (endModel && recEnd && recEnd > endModel) return false;
      }

      if (startUpload || endUpload) {
        const recUpload = parseDate((record as Simulation).uploadDate);
        if (startUpload && recUpload && recUpload < startUpload) return false;
        if (endUpload && recUpload && recUpload > endUpload) return false;
      }

      return true;
    });
  }, [simulations, appliedFilters]);

  // -------------------- Effects --------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next: Partial<FilterState> = {};
    const arrayKeys: (keyof FilterState)[] = [
      'campaignId',
      'experimentTypeId',
      'variables',
      'machineId',
      'compset',
      'gridName',
      'simulationType',
      'versionTag',
      'status',
    ];

    arrayKeys.forEach((key) => {
      const value = params.get(key);
      if (value !== null) {
        // FIXME: Fix below eslint error with any (TS is being difficult).
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Type 'string | string[]' is not assignable to type '(string[] & string) | undefined'.
        next[key] = arrayKeys.includes(key) ? (value.split(',') as string[]) : value;
      }
    });

    setAppliedFilters((prev) => ({ ...prev, ...next }));
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        params.set(key, value.join(','));
      } else if (typeof value === 'string' && value) {
        params.set(key, value);
      }
    });

    navigate({ search: params.toString() }, { replace: true });
  }, [appliedFilters, navigate]);

  // -------------------- Handlers --------------------
  const handleResetFilters = () => {
    setAppliedFilters({
      campaignId: [],
      experimentTypeId: [],
      variables: [],
      machineId: [],
      compset: [],
      gridName: [],
      simulationType: [],
      versionTag: [],
      status: [],
      modelStartDate: '',
      modelEndDate: '',
      uploadStartDate: '',
      uploadEndDate: '',
    });
  };

  const handleCompareButtonClick = () => {
    navigate('/compare');
  };

  // -------------------- Render --------------------
  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-row w-full gap-6">
            <div className="w-full md:w-[400px] min-w-0 md:min-w-[180px]">
              <BrowseFiltersSidePanel
                appliedFilters={appliedFilters}
                availableFilters={availableFilters}
                onChange={setAppliedFilters}
                machineOptions={machineOptions}
              />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <header className="mb-3 px-2 mt-4 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Browse Simulations</h1>
                  <p className="text-gray-600 max-w-6xl">
                    Explore and filter available simulations using the panel on the left. Select
                    simulations to view more details or take further actions.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground">{filteredData.length}</span>{' '}
                      simulations found
                    </span>
                    <span className="h-4 w-px bg-gray-300 mx-1" />
                    <span>
                      View mode:{' '}
                      <span className="font-medium text-foreground">
                        {viewMode === 'grid' ? 'Cards' : 'Table'}
                      </span>
                    </span>
                  </div>
                  <TooltipProvider delayDuration={150}>
                    <div className="flex gap-2 mt-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label="Grid view"
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <LayoutGrid size={24} strokeWidth={2} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Show simulations as cards</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label="Table view"
                            className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-200' : ''}`}
                            onClick={() => setViewMode('table')}
                          >
                            <Table size={24} strokeWidth={2} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Show simulations in a table</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </header>

              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2">
                  {(
                    Object.entries(appliedFilters) as [keyof FilterState, string[] | string][]
                  ).flatMap(([key, values]) => {
                    if (Array.isArray(values)) {
                      return values.map((value, idx) => {
                        const display =
                          key === 'machineId'
                            ? (machineOptions.find((opt) => opt.value === value)?.label ?? value)
                            : value;
                        return (
                          <span
                            key={`${key}-${value}-${idx}`}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 border border-gray-300"
                          >
                            <span className="mr-2 font-medium capitalize">
                              {String(key).replace(/Id$/, '')}:
                            </span>
                            <span className="mr-2">{display}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${String(key)} filter`}
                              className="ml-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none"
                              onClick={() => {
                                setAppliedFilters((prev) => ({
                                  ...prev,
                                  [key]: (prev[key] as string[]).filter((v) => v !== value),
                                }));
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                  d="M4 4L12 12M12 4L4 12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </span>
                        );
                      });
                    } else if (values) {
                      const display =
                        key === 'machineId'
                          ? (machineOptions.find((opt) => opt.value === values)?.label ?? values)
                          : values;
                      return (
                        <span
                          key={`${String(key)}-${values}`}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 border border-gray-300"
                        >
                          <span className="mr-2 font-medium capitalize">
                            {String(key).replace(/Id$/, '')}:
                          </span>
                          <span className="mr-2">{display}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${String(key)} filter`}
                            className="ml-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none"
                            onClick={() => {
                              setAppliedFilters((prev) => ({ ...prev, [key]: '' }));
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M4 4L12 12M12 4L4 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </span>
                      );
                    }
                    return [];
                  })}
                  {Object.values(appliedFilters).some((v) =>
                    Array.isArray(v) ? v.length > 0 : !!v,
                  ) && (
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm text-red-700 border border-red-300 ml-2"
                      aria-label="Clear all filters"
                      onClick={handleResetFilters}
                    >
                      <span className="mr-2 font-medium">Clear All</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 4L12 12M12 4L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div>
                {viewMode === 'table' ? (
                  <BrowseTableView
                    simulations={simulations}
                    filteredData={filteredData}
                    selectedSimulationIds={selectedSimulationIds}
                    setSelectedSimulationIds={setSelectedSimulationIds}
                    handleCompareButtonClick={handleCompareButtonClick}
                  />
                ) : (
                  <BrowseCardsView
                    simulations={simulations}
                    filteredData={filteredData}
                    selectedSimulationIds={selectedSimulationIds}
                    setSelectedSimulationIds={setSelectedSimulationIds}
                    handleCompareButtonClick={handleCompareButtonClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
