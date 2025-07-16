import { Simulation } from '@/App';
import { DataTable } from '@/pages/Browse/DataTable';
import FiltersPanel from '@/pages/Browse/FiltersPanel';
import { useState, useMemo } from 'react';

export interface FilterState {
  id: string;
  name: string;
  modelStartDate: string; // Start date of the model simulation
  runStartDate: string; // Date when the simulation was run

  repo: string; // Default "E3SM", can be forked repos for rare cases
  branch: string; // At least one of branch or tag is required
  tag: string; // At least one of branch or tag is required

  campaign: string;
  compset: string;
  gridName: string;
  machine: string;
  compiler: string;
}

interface BrowseProps {
  data: Simulation[];
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
}

const Browse = ({ data, selectedDataIds, setSelectedDataIds }: BrowseProps) => {
  const [filters, setFilters] = useState<FilterState>({
    id: '',
    name: '',
    modelStartDate: '',
    runStartDate: '',
    repo: '',
    branch: '',
    tag: '',
    campaign: '',
    compset: '',
    gridName: '',
    machine: '',
    compiler: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      return (
        (!filters.id || record.id === filters.id) &&
        (!filters.name || record.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.modelStartDate || record.modelStartDate === filters.modelStartDate) &&
        (!filters.runStartDate || record.runStartDate === filters.runStartDate) &&
        (!filters.repo || record.repo === filters.repo) &&
        (!filters.branch || record.branch === filters.branch) &&
        (!filters.tag || record.tag === filters.tag) &&
        (!filters.campaign || record.campaign === filters.campaign) &&
        (!filters.compset || record.compset === filters.compset) &&
        (!filters.gridName || record.gridName === filters.gridName) &&
        (!filters.machine || record.machine === filters.machine) &&
        (!filters.compiler || record.compiler === filters.compiler)
      );
    });
  }, [data, filters]);

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col md:flex-row w-full gap-8 md:max-w-[70%]">
        <div className="w-full md:w-[15%] min-w-0 md:min-w-[180px]">
          <FiltersPanel filters={filters} onChange={setFilters} />
        </div>
        <div className="flex-1">
          <div className="w-full flex flex-col items-start mb-2 mt-4 px-2">
            <h2 className="text-2xl font-semibold mb-1">Browse</h2>
            <p className="text-gray-600 text-sm mb-4 max-w-4xl">
              Explore and filter available simulations using the panel on the left. Select
              simulations to view more details or take further actions.
            </p>
          </div>
          <DataTable
            data={data}
            filteredData={filteredData}
            selectedDataIds={selectedDataIds}
            setSelectedDataIds={setSelectedDataIds}
          />
        </div>
      </div>
    </div>
  );
};

export default Browse;
