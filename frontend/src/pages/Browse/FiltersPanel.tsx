import type { FilterState } from '@/pages/Browse/Browse';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

const FiltersPanel = ({ filters, onChange }: FilterPanelProps) => {
  // Get all filter keys except functions
  const filterKeys = Object.keys(filters) as (keyof FilterState)[];

  return (
    <aside className="w-72 max-w-full bg-background border-r md:border-r p-6 flex flex-col gap-6 min-h-screen md:w-72 w-full md:min-h-screen min-h-0">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      {filterKeys.map((key) => (
        <div key={String(key)}>
          <label className="block text-sm font-medium mb-2" htmlFor={`${key}-filter`}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            id={`${key}-filter`}
            type="text"
            placeholder={`Search ${key}`}
            value={filters[key] as string}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
            className="shadcn-input w-full"
          />
        </div>
      ))}
    </aside>
  );
};

export default FiltersPanel;
