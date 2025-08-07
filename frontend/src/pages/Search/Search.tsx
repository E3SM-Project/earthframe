import { Simulation } from '@/App';
import { DataTable } from '@/pages/Search/DataTable';
import FiltersPanel from '@/pages/Search/FiltersPanel';
import { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface FilterState {
  // Scientific Goal
  campaign: string;
  experiment: string;
  targetVariables: string[];
  frequency: string;

  // Simulation Context
  machine: string;
  compset: string;
  gridName: string;
  simulationType: string;
  versionTag: string;

  // Execution Details
  status: string;
  modelRunStartDate: string;
  modelRunEndDate: string;

  // Metadata
  uploadStartDate: string;
  uploadEndDate: string;
}

interface BrowseProps {
  data: Simulation[];
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
}

const Search = ({ data, selectedDataIds, setSelectedDataIds }: BrowseProps) => {
  // Scientific Goal
  const [filters, setFilters] = useState<FilterState>({
    // Scientific Goal
    campaign: '',
    experiment: '',
    variables: [], // e.g. ['ta', 'tas', 'tasmax']
    frequency: '', // e.g. '3hr', 'day', 'year', 'mon'

    // Simulation Context
    machine: '',
    compset: '', // e.g. 'E3SM-1-0', 'E3SM-2-0'
    gridName: '',
    simulationType: '', // e.g. 'Production', 'Master'
    versionTag: '', // e.g. 'v1.0.0', 'v2.0.0', 'v3.0.0'

    // Execution Details
    status: '',
    modelRunStartDate: '',
    modelRunEndDate: '',

    // Metadata
    uploadStartDate: '',
    uploadEndDate: '',
  });

  // Sync filter state with URL query params

  const location = useLocation();
  const navigate = useNavigate();

  // Parse filters from URL when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters: Partial<FilterState> = {};
    // Define which keys are arrays
    const arrayKeys: (keyof FilterState)[] = ['variables'];
    (Object.keys(filters) as (keyof FilterState)[]).forEach((key) => {
      const value = params.get(key);
      if (value !== null) {
        if (arrayKeys.includes(key)) {
          newFilters[key] = value.split(',') as any;
        } else {
          newFilters[key] = value as any;
        }
      }
    });
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        params.set(key, value.join(','));
      } else if (typeof value === 'string' && value) {
        params.set(key, value);
      }
    });
    navigate({ search: params.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filteredData = useMemo(() => {
    const filterKeys = Object.keys(filters) as (keyof FilterState)[];
    return data.filter((record) =>
      filterKeys.every((key) => {
        const filterValue = filters[key];
        if (Array.isArray(filterValue)) {
          return !filterValue.length || filterValue.every((v) => record[key]?.includes?.(v));
        }
        return !filterValue || record[key] === filterValue;
      }),
    );
  }, [data, filters]);

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col md:flex-row w-full gap-8 md:max-w-[70%]">
        <div className="flex flex-row w-full gap-6">
          <div className="w-full md:w-[220px] min-w-0 md:min-w-[180px]">
            <FiltersPanel filters={filters} onChange={setFilters} />
          </div>
          <div className="flex-1 flex flex-col">
            <header className="mb-3 px-2 mt-4">
              <h1 className="text-3xl font-bold mb-2">Search Simulations</h1>
              <p className="text-gray-600 max-w-6xl">
                Explore and filter available simulations using the panel on the left. Select
                simulations to view more details or take further actions.
              </p>
            </header>
            <DataTable
              data={data}
              filteredData={filteredData}
              selectedDataIds={selectedDataIds}
              setSelectedDataIds={setSelectedDataIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
