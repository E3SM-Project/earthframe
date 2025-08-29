import axios from 'axios';

import type { Simulation } from '@/types/index';

const BASE_URL = 'http://localhost:8000/api';

export const fetchAISimAnalysis = async (simulations: Simulation[]): Promise<string> => {
  const response = await axios.post(`${BASE_URL}/analyze-simulations`, {
    simulations,
  });
  return response.data.summary;
};
