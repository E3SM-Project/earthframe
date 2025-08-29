import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import ResultCard from '@/pages/Browse/ResultCard';
import type { Simulation } from '@/types/index';

interface ResultCardsProps {
  simulations: Simulation[];
  filteredData: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
  handleCompareButtonClick: () => void;
}

const ResultCards = ({
  simulations,
  filteredData,
  selectedSimulationIds,
  setSelectedSimulationIds,
  handleCompareButtonClick,
}: ResultCardsProps) => {
  const isCompareButtonDisabled = selectedSimulationIds.length < 2;

  return (
    <div>
      {/* Top controls */}
      <div className="flex items-center py-4">
        <SelectedSimulationChipList
          simulations={simulations}
          buttonText="Compare"
          onCompareButtonClick={handleCompareButtonClick}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
          isCompareButtonDisabled={isCompareButtonDisabled}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((sim) => (
          <div key={sim.id} className="h-full">
            <ResultCard
              simulation={sim}
              selected={selectedSimulationIds.includes(sim.id)}
              onSelect={() => {
                if (selectedSimulationIds.includes(sim.id)) {
                  setSelectedSimulationIds(selectedSimulationIds.filter((id) => id !== sim.id));
                } else {
                  setSelectedSimulationIds([...selectedSimulationIds, sim.id]);
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
