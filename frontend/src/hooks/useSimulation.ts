import { useQuery } from '@tanstack/react-query';

import { Simulation } from '@/types';

export const useSimulation = (id: string, seed?: Simulation) => {
  return useQuery<Simulation>({
    queryKey: ['simulation', id],
    placeholderData: seed,
    queryFn: async () => {
      const res = await fetch('/mock/simulations.json');
      const simulations = await res.json();

      const simulation = simulations.find((sim: Simulation) => sim.id === id);
      if (!simulation) throw new Error('Not found');
      return simulation;
    },
    staleTime: 60_000,
  });
};
