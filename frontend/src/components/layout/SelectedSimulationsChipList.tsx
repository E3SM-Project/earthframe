import { Simulation } from '@/App';
import { Button } from '@/components/ui/button';

interface SelectedSimulationsBreadcrumbProps {
  data: Simulation[];
  buttonText: string;
  onCompareButtonClick: () => void;
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
}

const MAX_SELECTION = 5;

const SelectedSimulationChipList = ({
  data,
  buttonText,
  onCompareButtonClick,
  selectedDataIds,
  setSelectedDataIds,
}: SelectedSimulationsBreadcrumbProps) => {
  return (
    <div className="flex items-center">
      <Button
        variant="default"
        size="sm"
        onClick={() => onCompareButtonClick()}
        disabled={selectedDataIds.length < 2}
      >
        {buttonText}
      </Button>

      <div className="ml-4 flex flex-wrap items-center gap-2">
        <span
          className={`text-xs ${
            selectedDataIds.length === MAX_SELECTION
              ? 'text-warning font-bold'
              : 'text-muted-foreground'
          }`}
        >
          Selected: {selectedDataIds.length} / {MAX_SELECTION}
        </span>
        {selectedDataIds.map((id) => {
          const row = data.find((r) => r.id === id);
          if (!row) return null;
          return (
            <span
              key={id}
              className="flex items-center rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {row.name}
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                aria-label={`Remove ${row.name}`}
                onClick={() => setSelectedDataIds(selectedDataIds.filter((rowId) => rowId !== id))}
              >
                ×
              </button>
            </span>
          );
        })}
        {selectedDataIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => setSelectedDataIds([])}
          >
            Deselect all
          </Button>
        )}
      </div>
    </div>
  );
};

export default SelectedSimulationChipList;
