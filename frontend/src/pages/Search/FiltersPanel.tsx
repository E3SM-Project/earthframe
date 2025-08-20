import { ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { FilterState } from '@/pages/Search/Search';

interface FilterPanelProps {
  appliedFilters: FilterState;
  availableFilters: FilterState;
  onChange: (next: FilterState) => void;
}

const FiltersPanel = ({ appliedFilters, availableFilters, onChange }: FilterPanelProps) => {
  const handleChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...appliedFilters, [key]: value });
  };

  return (
    <aside className="w-[360px] max-w-full bg-background border-r p-6 flex flex-col gap-6 min-h-screen">
      {/* Scientific Goal */}
      <CollapsibleGroup
        title="Scientific Goal"
        description="Filter by experiment type, campaign, and available outputs."
      >
        <MultiSelectCheckboxGroup
          label="Campaign"
          options={availableFilters.campaignId || []}
          selected={appliedFilters.campaignId || []}
          onChange={(next) => handleChange('campaignId', next)}
        />

        <MultiSelectCheckboxGroup
          label="Experiment"
          options={availableFilters.experimentTypeId || []}
          selected={appliedFilters.experimentTypeId || []}
          onChange={(next) => handleChange('experimentTypeId', next)}
        />

        {/* <MultiSelectCheckboxGroup
          label="Frequency"
          options={availableFilters.frequency || []}
          selected={appliedFilters.frequency || []}
          onChange={(next) => handleChange('frequency', next)}
        /> */}
      </CollapsibleGroup>

      {/* Simulation Context */}
      <CollapsibleGroup
        title="Simulation Context"
        description="Refine simulations by machine, grid, and code version."
      >
        <MultiSelectCheckboxGroup
          label="Machine"
          options={availableFilters.machineId || []}
          selected={appliedFilters.machineId || []}
          onChange={(next) => handleChange('machineId', next)}
        />

        <MultiSelectCheckboxGroup
          label="Grid Name"
          options={availableFilters.gridName || []}
          selected={appliedFilters.gridName || []}
          onChange={(next) => handleChange('gridName', next)}
        />

        <MultiSelectCheckboxGroup
          label="Version / Tag"
          options={availableFilters.versionTag || []}
          selected={appliedFilters.versionTag || []}
          onChange={(next) => handleChange('versionTag', next)}
        />
      </CollapsibleGroup>

      {/* Execution Details */}
      <CollapsibleGroup
        title="Execution Details"
        description="Filter simulations by their run status and execution date."
      >
        <MultiSelectCheckboxGroup
          label="Status"
          options={availableFilters.status || []}
          selected={appliedFilters.status || []}
          onChange={(next) => handleChange('status', next)}
          renderOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
        />
        {/* TODO: Model start and end date picker */}
        {/* <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium mb-1">Model Run Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              className="rounded-md border px-2 py-1 text-xs"
              value={appliedFilters.modelStartDate || ''}
              onChange={(e) => handleChange('modelStartDate', e.target.value)}
            />
            <span className="mx-1 text-gray-500 text-xs">to</span>
            <input
              type="date"
              className="rounded-md border px-2 py-1 text-xs"
              value={appliedFilters.modelEndDate || ''}
              onChange={(e) => handleChange('modelEndDate', e.target.value)}
            />
          </div>
        </div> */}
      </CollapsibleGroup>

      {/* Metadata */}
      <CollapsibleGroup title="Metadata" description="Narrow results based on submission date.">
        <div>
          {/* TODO: Upload start and end date picker */}
          {/* <label className="block text-sm font-medium mb-1">Upload Date Range</label>
          <Calendar mode="range" className="rounded-md border" /> */}
        </div>
      </CollapsibleGroup>
    </aside>
  );
};

export default FiltersPanel;

interface GroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleGroup = ({ title, description, children, defaultOpen = true }: GroupProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <motion.div
          layout
          initial={false}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm p-4 cursor-pointer flex items-center justify-between mb-2 border border-gray-200 hover:shadow-md transition-shadow"
          onClick={() => setOpen((prev) => !prev)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
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
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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

interface MultiSelectCheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

interface MultiSelectCheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  renderOptionLabel?: (option: string) => React.ReactNode;
}

const MultiSelectCheckboxGroup = ({
  label,
  options,
  selected,
  onChange,
  renderOptionLabel,
}: MultiSelectCheckboxGroupProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = selected?.includes(option);
          return (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={option}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  let next: string[];
                  if (checked === true) {
                    next = [...selected, option];
                  } else if (checked === false) {
                    next = selected.filter((s) => s !== option);
                  } else {
                    next = selected;
                  }
                  onChange(next);
                }}
              />
              <label htmlFor={option} className="text-sm">
                {renderOptionLabel ? renderOptionLabel(option) : option}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
