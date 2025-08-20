import type { FilterState } from '@/pages/Search/Search';
import type { Simulation } from '@/App';
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

interface GroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
const CollapsibleGroup = ({ title, description, children, defaultOpen = true }: GroupProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-6">
      <CollapsibleTrigger asChild>
        <motion.div
          layout
          initial={false}
          className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm p-4 cursor-pointer flex items-center justify-between mb-2 border border-gray-200 hover:shadow-md transition-shadow`}
          onClick={() => setOpen((prev) => !prev)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="inline-block ml-2"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </motion.span>
            </div>
            {description && (
              <motion.p
                key="desc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="text-sm text-gray-500 px-1"
              >
                {description}
              </motion.p>
            )}
          </div>
        </motion.div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="pl-2 pt-4 pb-2 flex flex-col gap-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

const FiltersPanel = ({ filters, onChange }: FilterPanelProps) => {
  // Helper for updating filter values
  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <aside className="w-[560px] max-w-full bg-background border-r p-8 flex flex-col gap-4 min-h-screen">
      <CollapsibleGroup
        title="Scientific Goal"
        description="Filter by experiment type, campaign, and available outputs to match specific research goals."
      >
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Campaign</label>
          <input
            type="text"
            placeholder="e.g., E3SMv2, CMIP6"
            value={filters.campaignId || ''}
            onChange={(e) => handleChange('campaignId', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Experiment</label>
          <input
            type="text"
            placeholder="e.g., AMIP, historical"
            value={filters.experiment || ''}
            onChange={(e) => handleChange('experiment', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
        {/* Target Variables - commented out for now */}
        {/*
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Target Variables</label>
        <input
        type="text"
        placeholder="e.g., temperature, precipitation"
        value={filters.targetVariables || ''}
        onChange={e => handleChange('targetVariables', e.target.value)}
        className="shadcn-input w-full"
        />
      </div>
      */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <select
            value={filters.frequency || ''}
            onChange={(e) => handleChange('frequency', e.target.value)}
            className="shadcn-input w-full"
          >
            <option value="">Select frequency</option>
            <option value="3hr">3hr (3 hourly)</option>
            <option value="day">day (daily)</option>
            <option value="year">year (annual)</option>
            <option value="mon">mon (monthly)</option>
          </select>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup
        title="Simulation Context"
        description="Refine simulations by experiment type, version/tag, and more."
      >
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Machine</label>
          <input
            type="text"
            placeholder="Machine name"
            value={filters.machine || ''}
            onChange={(e) => handleChange('machine', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Grid Name</label>
          <input
            type="text"
            placeholder="Grid name"
            value={filters.gridName || ''}
            onChange={(e) => handleChange('gridName', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Simulation Type</label>
          <div className="flex gap-4">
            <label>
              <input
                type="checkbox"
                checked={filters.production || false}
                onChange={(e) => handleChange('production', e.target.checked)}
              />
              <span className="ml-1 text-sm">Production</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.master || false}
                onChange={(e) => handleChange('master', e.target.checked)}
              />
              <span className="ml-1 text-sm">Master</span>
            </label>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Version / Tag</label>
          <select
            value={filters.version || ''}
            onChange={(e) => handleChange('version', e.target.value)}
            className="shadcn-input w-full"
          >
            <option value="">Select version</option>
            <option value="v1.0.0">v1.0.0</option>
            <option value="v2.0.0">v2.0.0</option>
            <option value="v3.0.0">v3.0.0</option>
          </select>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup
        title="Execution Details"
        description="Filter simulations by their real-world run status and execution date"
      >
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Status</label>
          <input
            type="text"
            placeholder="Status"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Model Run Date Range</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
            value={filters.modelRunDateRange || ''}
            onChange={(e) => handleChange('modelRunDateRange', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title="Metadata" description="Narrow results based on submission date.">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Upload Date Range</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
            value={filters.uploadDateRange || ''}
            onChange={(e) => handleChange('uploadDateRange', e.target.value)}
            className="shadcn-input w-full"
          />
        </div>
      </CollapsibleGroup>
    </aside>
  );
};

export default FiltersPanel;
