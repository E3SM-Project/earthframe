import type { Simulation } from '@/App';
import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import ResultCard from '@/pages/Search/ResultCard';

interface ResultCardsProps {
  data: Simulation[];
  filteredData: Simulation[];
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
  handleCompareButtonClick: () => void;
}

const ResultCards = ({
  data,
  filteredData,
  selectedDataIds,
  setSelectedDataIds,
  handleCompareButtonClick,
}: ResultCardsProps) => {
  return (
    <div>
      {/* Top controls */}
      <div className="flex items-center py-4">
        <SelectedSimulationChipList
          data={data}
          buttonText="Compare"
          onCompareButtonClick={handleCompareButtonClick}
          selectedDataIds={selectedDataIds}
          setSelectedDataIds={setSelectedDataIds}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((sim) => (
          <div key={sim.id} className="h-full">
            <ResultCard
              simulation={sim}
              selected={selectedDataIds.includes(sim.id)}
              onSelect={() => {
                if (selectedDataIds.includes(sim.id)) {
                  setSelectedDataIds(selectedDataIds.filter((id) => id !== sim.id));
                } else {
                  setSelectedDataIds([...selectedDataIds, sim.id]);
                }
              }}
              onViewDetails={null}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultCards;
