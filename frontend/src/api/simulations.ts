import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import type { RawSimulation } from '@/types';

const SIMULATIONS_URL = '/data/simulations.json';

export const fetchSimulations = async (url: string = SIMULATIONS_URL): Promise<RawSimulation[]> => {
  const res = await axios.get<RawSimulation[]>(url, { headers: { 'Cache-Control': 'no-cache' } });

  return res.data;
};

export const useSimulations = (url: string = SIMULATIONS_URL) => {
  const [data, setData] = useState<RawSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSimulations(url)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const byId = useMemo(() => new Map(data.map((s) => [s.id, s])), [data]);

  return { data, loading, error, byId };
};
