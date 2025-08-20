import { TooltipProvider } from '@radix-ui/react-tooltip';
import { LayoutGrid, Table } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Simulation } from '@/App';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTable } from '@/pages/Search/DataTable';
import FiltersPanel from '@/pages/Search/FiltersPanel';
import ResultCards from '@/pages/Search/ResultCards';

export interface FilterState {
  // Scientific Goal
  campaignId: string[];
  experimentTypeId: string[];
  variables: string[];
  frequency: string[];

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
  uploadStartDate: string;
  uploadEndDate: string;
}

interface BrowseProps {
  simulations: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
}

const Search = ({ simulations, selectedSimulationIds, setSelectedSimulationIds }: BrowseProps) => {
  // Scientific Goal
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    // Scientific Goal
    campaignId: [],
    experimentTypeId: [],
    variables: [], // e.g. ['ta', 'tas', 'tasmax']
    frequency: [], // e.g. '3hr', 'day', 'year', 'mon'

    // Simulation Context
    machineId: [],
    compset: [], // e.g. 'E3SM-1-0', 'E3SM-2-0'
    gridName: [],
    simulationType: [], // e.g. 'Production', 'Master'
    versionTag: [], // e.g. 'v1.0.0', 'v2.0.0', 'v3.0.0'

    // Execution Details
    status: [],
    modelStartDate: '',
    modelEndDate: '',

    // Metadata
    uploadStartDate: '',
    uploadEndDate: '',
  });

  const availableFilters = useMemo(() => {
    const initial: FilterState = {
      campaignId: [],
      experimentTypeId: [],
      variables: [],
      frequency: [],
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

    simulations.forEach((sim) => {
      Object.keys(initial).forEach((key) => {
        const value = sim[key as keyof FilterState];
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (
              v &&
              Array.isArray(initial[key as keyof FilterState]) &&
              !initial[key as keyof FilterState].includes(v)
            ) {
              (initial[key as keyof FilterState] as string[]).push(v);
            }
          });
        } else if (
          value &&
          Array.isArray(initial[key as keyof FilterState]) &&
          !initial[key as keyof FilterState].includes(value)
        ) {
          (initial[key as keyof FilterState] as string[]).push(value);
        }
      });
    });

    return initial;
  }, [simulations]);

  // Sync filter state with URL query params

  const location = useLocation();
  const navigate = useNavigate();

  const handleCompareButtonClick = () => {
    navigate('/compare');
  };

  // Parse filters from URL when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters: Partial<FilterState> = {};

    // Define which keys are arrays
    const arrayKeys: (keyof FilterState)[] = ['variables'];

    (Object.keys(appliedFilters) as (keyof FilterState)[]).forEach((key) => {
      const value = params.get(key);
      if (value !== null) {
        if (arrayKeys.includes(key)) {
          newFilters[key] = value ? value.split(',') : [];
        } else {
          newFilters[key] = value ? [value] : [];
        }
      }
    });

    setAppliedFilters((prev) => ({ ...prev, ...newFilters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Update URL when filters change
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const filteredData = useMemo(() => {
    const filterKeys = Object.keys(appliedFilters) as (keyof FilterState)[];
    return simulations.filter((record) =>
      filterKeys.every((key) => {
        const filterValue = appliedFilters[key];
        if (Array.isArray(filterValue)) {
          return !filterValue.length || filterValue.every((v) => record[key]?.includes?.(v));
        }
        return !filterValue || record[key] === filterValue;
      }),
    );
  }, [simulations, appliedFilters]);

  // View mode state: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-row w-full gap-6">
            <div className="w-full md:w-[400px] min-w-0 md:min-w-[180px]">
              <FiltersPanel
                appliedFilters={appliedFilters}
                availableFilters={availableFilters}
                onChange={setAppliedFilters}
              />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <header className="mb-3 px-2 mt-4 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Search Simulations</h1>
                  <p className="text-gray-600 max-w-6xl">
                    Explore and filter available simulations using the panel on the left. Select
                    simulations to view more details or take further actions.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500 mb-1">
                    View mode:
                    <span className="ml-1 font-medium">
                      {viewMode === 'grid' ? 'Cards' : 'Table'}
                    </span>
                  </span>
                  <TooltipProvider delayDuration={150}>
                    <div className="flex gap-2">
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
                {/* Active Filters Chips */}
                <div className="flex flex-wrap gap-2">
                  {(
                    Object.entries(appliedFilters) as [keyof FilterState, string[] | string][]
                  ).flatMap(([key, values]) => {
                    if (Array.isArray(values)) {
                      return values.map((value, idx) => (
                        <span
                          key={`${key}-${value}-${idx}`}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 border border-gray-300"
                        >
                          <span className="mr-2 font-medium capitalize">
                            {key.replace(/Id$/, '')}:
                          </span>
                          <span className="mr-2">{value}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${key} filter`}
                            className="ml-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none"
                            onClick={() => {
                              setAppliedFilters((prev) => ({
                                ...prev,
                                [key]:
                                  prev[key] instanceof Array
                                    ? prev[key].filter((v) => v !== value)
                                    : '',
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
                      ));
                    } else if (values) {
                      return (
                        <span
                          key={`${key}-${values}`}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 border border-gray-300"
                        >
                          <span className="mr-2 font-medium capitalize">
                            {key.replace(/Id$/, '')}:
                          </span>
                          <span className="mr-2">{values}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${key} filter`}
                            className="ml-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none"
                            onClick={() => {
                              setAppliedFilters((prev) => ({
                                ...prev,
                                [key]: '',
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
                    }
                    return [];
                  })}
                </div>
              </div>
              <div>
                {viewMode === 'table' ? (
                  <DataTable
                    simulations={simulations}
                    filteredData={filteredData}
                    selectedSimulationIds={selectedSimulationIds}
                    setSelectedSimulationIds={setSelectedSimulationIds}
                    handleCompareButtonClick={handleCompareButtonClick}
                  />
                ) : (
                  <ResultCards
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

export default Search;
