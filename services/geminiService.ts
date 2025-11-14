
import type { Truck, GasStation, RoutePlan } from '../types';

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';
const FUNCTION_PATH = '/.netlify/functions/optimizeRoute';
const ENDPOINT = `${FUNCTIONS_BASE}${FUNCTION_PATH}`;

interface OptimizeResponse {
  routePlans: RoutePlan[] | null;
  error?: string;
  message?: string;
}

export const optimizeRoute = async (
  truck: Truck,
  stationsToRefuel: { station: GasStation; fuelNeeded: { type: string; volume: number }[] }[]
): Promise<RoutePlan[] | null> => {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ truck, stationsToRefuel }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Route optimizer responded with ${response.status}: ${text}`);
    }

    const data = (await response.json()) as OptimizeResponse;

    if (data.error) {
      throw new Error(data.error);
    }

    return data.routePlans ?? null;
  } catch (error) {
    console.error("Ошибка при оптимизации маршрута через функцию:", error);
    throw error;
  }
};
