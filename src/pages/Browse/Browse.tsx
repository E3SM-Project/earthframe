import { Simulation } from '@/App';
import { DataTable } from '@/pages/Browse/DataTable';
import FiltersPanel from '@/pages/Browse/FiltersPanel';
import { useState, useMemo } from 'react';

export interface FilterState {
  name: string;
  status: string;
  email: string;
}

interface BrowseProps {
  data: Simulation[];
  selectedDataIds: string[] | null;
  setSelectedDataIds: (ids: string[]) => void;
}

const Browse = ({ data, selectedDataIds, setSelectedDataIds }: BrowseProps) => {
  const [filters, setFilters] = useState<FilterState>({ name: '', status: '', email: '' });

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      return (
        (!filters.status || record.status === filters.status) &&
        (!filters.name || record.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.email || record.email.toLowerCase().includes(filters.email.toLowerCase()))
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
            data={filteredData}
            selectedDataIds={selectedDataIds}
            setSelectedDataIds={setSelectedDataIds}
          />
        </div>
      </div>
    </div>
  );
};

export default Browse;
