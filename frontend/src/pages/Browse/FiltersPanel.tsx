import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { FilterState } from '@/pages/Browse/Browse';

// --- Filter panel ---
interface FilterPanelProps {
  appliedFilters: FilterState;
  availableFilters: FilterState; // still carries raw string values for non-FK filters
  onChange: (next: FilterState) => void;
  machineOptions: { value: string; label: string }[];
}

const FiltersPanel = ({
  appliedFilters,
  availableFilters,
  onChange,
  machineOptions,
}: FilterPanelProps) => {
  const handleChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const nextValue = Array.isArray(value) ? Array.from(new Set(value)) : value;
    onChange({ ...appliedFilters, [key]: nextValue });
  };

  return (
    <aside className="w-[360px] max-w-full bg-background border-r p-6 flex flex-col gap-6 min-h-screen">
      {/* Scientific Goal */}
      <CollapsibleGroup
        title="Scientific Goal"
        description="Filter by high-level scientific purpose, such as campaign, experiment, or outputs."
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

        <MultiSelectCheckboxGroup
          label="Variables"
          options={availableFilters.variables || []}
          selected={appliedFilters.variables || []}
          onChange={(next) => handleChange('variables', next)}
        />

        {/* Frequency left out for now */}
      </CollapsibleGroup>

      {/* Simulation Context */}
      <CollapsibleGroup
        title="Simulation Context"
        description="Refine results based on the technical setup of the simulation."
      >
        <MultiSelectCheckboxGroup
          label="Machine"
          // Prefer id/label pairs if provided, else fall back to raw ids
          options={
            machineOptions && machineOptions.length > 0
              ? machineOptions
              : availableFilters.machineId || []
          }
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
        description="Filter by run status or time information."
      >
        <MultiSelectCheckboxGroup
          label="Status"
          options={availableFilters.status || []}
          selected={appliedFilters.status || []}
          onChange={(next) => handleChange('status', next)}
          renderOptionLabel={(option) =>
            typeof option === 'string'
              ? option.charAt(0).toUpperCase() + option.slice(1)
              : option.label
          }
        />
        {/* Date pickers can go here later */}
      </CollapsibleGroup>

      {/* Metadata */}
      <CollapsibleGroup title="Metadata" description="Filter by upload information.">
        <div>{/* Upload date range UI placeholder */}</div>
      </CollapsibleGroup>
    </aside>
  );
};

export default FiltersPanel;

// --- Presentational groups & checkbox list ---
interface GroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleGroup = ({ title, description, children, defaultOpen = true }: GroupProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <motion.div
            layout
            initial={false}
            className="rounded-lg shadow-sm p-4 cursor-pointer flex items-center justify-between mb-2 transition-shadow"
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
                className="pl-4 pt-4 pb-2 flex flex-col gap-4"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Allow options to be either strings or {value,label}
export type Option = string | { value: string; label: string };

interface MultiSelectCheckboxGroupProps {
  label: string;
  options: Option[];
  selected: string[]; // always IDs under the hood
  onChange: (next: string[]) => void;
  renderOptionLabel?: (option: Option) => React.ReactNode;
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
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const display = renderOptionLabel
            ? renderOptionLabel(opt)
            : typeof opt === 'string'
              ? opt
              : opt.label;
          const isChecked = selected?.includes(value);
          return (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`${label}-${value}`}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  let next: string[] = selected ?? [];
                  if (checked === true) next = Array.from(new Set([...next, value]));
                  else if (checked === false) next = next.filter((s) => s !== value);
                  onChange(next);
                }}
              />
              <label htmlFor={`${label}-${value}`} className="text-sm">
                {display}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
