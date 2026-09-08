import { useEffect, useState } from 'react';

import { resolvePaceExperimentId } from '@/features/simulations/api/api';

export const usePaceExperiment = (executionId: string | null | undefined) => {
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(executionId));

  useEffect(() => {
    let cancelled = false;

    if (!executionId) {
      setExperimentId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setExperimentId(null);

    resolvePaceExperimentId(executionId)
      .then((resolvedExperimentId) => {
        if (!cancelled) setExperimentId(resolvedExperimentId);
      })
      .catch(() => {
        if (!cancelled) setExperimentId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [executionId]);

  return { experimentId, loading };
};
