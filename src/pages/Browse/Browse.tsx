import { DataTable } from '@/pages/Browse/DataTable';
import { FiltersPanel } from '@/pages/Browse/FiltersPanel';
import { useState, useEffect, useMemo } from 'react';

export type Simulation = {
  id: string;
  name: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

export type FilterState = {
  name: string;
  status: string;
  email: string;
};

function Browse() {
  const [data, setData] = useState<Simulation[]>([]);
  const [filters, setFilters] = useState<FilterState>({ name: '', status: '', email: '' });

  useEffect(() => {
    fetch('/data/simulations.json')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

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
      <div className="flex w-full max-w-6xl gap-8">
        <div className="w-1/4 min-w-[220px]">
          <FiltersPanel filters={filters} onChange={setFilters} />
        </div>
        <div className="flex-1">
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export default Browse;
