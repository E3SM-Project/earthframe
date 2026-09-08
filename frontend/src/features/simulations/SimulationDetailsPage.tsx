import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { resolvePaceExecution } from '@/features/simulations/api/api';
import { SimulationDetailsView } from '@/features/simulations/components/SimulationDetailsView';
import { useSimulation } from '@/features/simulations/hooks/useSimulation';

export const SimulationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: simulation, loading, error } = useSimulation(id ?? '');
  const [paceExperimentId, setPaceExperimentId] = useState<string | null>(null);
  const [paceResolutionAttempted, setPaceResolutionAttempted] = useState(false);

  const state = location.state as { from?: string } | null;
  const backHref = typeof state?.from === 'string' ? state.from : '/browse';
  const normalizedBackHref = backHref.split(/[?#]/)[0];
  const backLabel = normalizedBackHref.startsWith('/cases/')
    ? 'Back to Case'
    : normalizedBackHref === '/cases'
      ? 'Back to Cases'
      : normalizedBackHref.startsWith('/simulations')
        ? 'Back to Simulations'
        : 'Back to Runs';
  const currentSimulation = simulation?.id === id ? simulation : null;
  const executionId = currentSimulation?.executionId?.trim() ?? '';

  useEffect(() => {
    if (!executionId) {
      setPaceExperimentId(null);
      setPaceResolutionAttempted(false);
      return;
    }

    let cancelled = false;
    setPaceExperimentId(null);
    setPaceResolutionAttempted(false);

    resolvePaceExecution(executionId)
      .then((result) => {
        if (!cancelled) {
          setPaceExperimentId(result.experimentId?.trim() || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPaceExperimentId(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPaceResolutionAttempted(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [executionId]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">Invalid simulation ID</div>
      </div>
    );
  }

  if (loading || (simulation !== null && currentSimulation === null)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">Loading simulation details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!currentSimulation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">Simulation not found</div>
      </div>
    );
  }

  const paceLink = executionId
    ? paceExperimentId
      ? {
          href: `https://pace.ornl.gov/exp-details/${encodeURIComponent(paceExperimentId)}`,
          label: 'Open in PACE',
        }
      : {
          href: `https://pace.ornl.gov/search/${encodeURIComponent(executionId)}`,
          label: 'Search in PACE',
        }
    : null;

  return (
    <SimulationDetailsView
      simulation={currentSimulation}
      backHref={backHref}
      backLabel={backLabel}
      paceLink={paceLink}
      isResolvingPace={Boolean(executionId) && !paceResolutionAttempted}
      showPaceFallbackInfo={paceResolutionAttempted && !paceExperimentId}
    />
  );
};
