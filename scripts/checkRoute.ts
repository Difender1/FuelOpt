import { handler } from '../netlify/functions/optimizeRoute';
import { MOCK_TRUCKS, MOCK_STATIONS } from '../constants';
import type { GasStation } from '../types';

const truck = MOCK_TRUCKS[0];

const buildStationsToRefuel = (stations: GasStation[]) => {
  return stations
    .map(station => {
      const fuelNeeded = station.fuelLevels
        .filter(level => level.current < level.min)
        .map(level => ({
          type: level.type,
          volume: level.max - level.current,
        }));

      if (fuelNeeded.length === 0) {
        return null;
      }

      return {
        station,
        fuelNeeded,
      };
    })
    .filter((item): item is { station: GasStation; fuelNeeded: { type: string; volume: number }[] } => item !== null);
};

async function main() {
  try {
    const stationsToRefuel = buildStationsToRefuel(MOCK_STATIONS);
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ truck, stationsToRefuel }),
    };
    const response = await handler(event);
    console.log('Status:', response.statusCode);
    console.log('Body:', response.body);
  } catch (error) {
    console.error('Ошибка при проверке сервиса оптимизации:', error);
    process.exitCode = 1;
  }
}

main();

