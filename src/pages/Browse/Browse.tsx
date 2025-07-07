import { Simulation } from '@/App';
import { DataTable } from '@/pages/Browse/DataTable';
import FiltersPanel from '@/pages/Browse/FiltersPanel';
import { useState, useMemo } from 'react';

export interface FilterState {
  id: string;
  name: string;
  startDate: string;
  tag: string;
  campaign: string;
  compset: string;
  resolution: string;
  machine: string;
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
    startDate: '',
    tag: '',
    campaign: '',
    compset: '',
    resolution: '',
    machine: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      return (
        (!filters.id || record.id === filters.id) &&
        (!filters.name || record.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.startDate || record.startDate === filters.startDate) &&
        (!filters.tag || record.tag === filters.tag) &&
        (!filters.campaign || record.campaign === filters.campaign) &&
        (!filters.compset || record.compset === filters.compset) &&
        (!filters.resolution || record.resolution === filters.resolution) &&
        (!filters.machine || record.machine === filters.machine)
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
