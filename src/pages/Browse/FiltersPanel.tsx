import { FilterState } from '@/pages/Browse/Browse';

type FilterPanelProps = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

export const FiltersPanel = ({ filters, onChange }: FilterPanelProps) => {
  return (
    <aside className="w-72 bg-background border-r p-6 flex flex-col gap-6 min-h-screen">
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="name-filter">
          Name
        </label>
        <input
          id="name-filter"
          type="text"
          placeholder="Search name"
          value={filters.name}
          onChange={(e) => onChange({ ...filters, name: e.target.value })}
          className="shadcn-input w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="status-filter">
          Status
        </label>
        <div id="status-filter" className="flex flex-col gap-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value=""
              checked={filters.status === ''}
              onChange={() => onChange({ ...filters, status: '' })}
              className="shadcn-radio"
            />
            <span className="ml-2">All Statuses</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value="success"
              checked={filters.status === 'success'}
              onChange={() => onChange({ ...filters, status: 'success' })}
              className="shadcn-radio"
            />
            <span className="ml-2">Success</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value="processing"
              checked={filters.status === 'processing'}
              onChange={() => onChange({ ...filters, status: 'processing' })}
              className="shadcn-radio"
            />
            <span className="ml-2">Processing</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value="failed"
              checked={filters.status === 'failed'}
              onChange={() => onChange({ ...filters, status: 'failed' })}
              className="shadcn-radio"
            />
            <span className="ml-2">Failed</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="email-filter">
          Email
        </label>
        {/* Replace this with shadcn/ui MultiSelect when available */}
        <input
          id="email-filter"
          type="text"
          placeholder="Search email"
          value={filters.email}
          onChange={(e) => onChange({ ...filters, email: e.target.value })}
          className="shadcn-input w-full"
        />
      </div>
    </aside>
  );
};

export default FiltersPanel;
