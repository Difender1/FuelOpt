
import { GoogleGenAI, Type } from "@google/genai";
import type { Truck, GasStation, RoutePlan } from '../types';
import { DEPOT_COORDINATES } from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY for Gemini is not set. Route optimization will not work.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const routePlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      truckId: { type: Type.STRING },
      driver: { type: Type.STRING },
      fuelType: { type: Type.STRING },
      totalVolumeLoaded: { type: Type.NUMBER },
      estimatedTime: { type: Type.STRING },
      estimatedCost: { type: Type.NUMBER },
      route: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['depot', 'station'] },
            action: { type: Type.STRING },
            name: { type: Type.STRING },
            // Fix: Removed `nullable: true` as it's not a standard part of the supported schema. Optionality is handled by the `required` array.
            address: { type: Type.STRING },
            coordinates: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
            },
          },
          required: ['type', 'action', 'name', 'coordinates'],
        },
      },
    },
    required: ['truckId', 'driver', 'fuelType', 'totalVolumeLoaded', 'estimatedTime', 'estimatedCost', 'route'],
  },
};

export const optimizeRoute = async (
  truck: Truck,
  stationsToRefuel: { station: GasStation; fuelNeeded: { type: string; volume: number }[] }[]
): Promise<RoutePlan[] | null> => {
  if (!API_KEY || !ai) {
    throw new Error("VITE_GEMINI_API_KEY for Gemini is not set.");
  }

  // Filter stations to only include those that need the fuel the selected truck carries.
  const relevantStations = stationsToRefuel
    .map(s => {
        const relevantFuel = s.fuelNeeded.find(f => f.type === truck.fuelType);
        if (!relevantFuel) return null;
        return {
            station: s.station,
            fuelNeeded: [relevantFuel] // Pass only the relevant fuel type
        };
    })
    .filter((s): s is { station: GasStation; fuelNeeded: { type: string; volume: number }[] } => s !== null);

  // If no relevant stations are left after filtering, no route can be planned.
  if (relevantStations.length === 0) {
      console.log("No relevant stations for the selected truck's fuel type.");
      return null;
  }

  const prompt = `
    Ты - эксперт по логистике в компании по доставке топлива. 
    Твоя задача - создать оптимальный план доставки для КОНКРЕТНОГО топливозаправщика на ВЫБРАННЫЕ АЗС.

    **Правила:**
    1. Топливозаправщик должен посетить все указанные АЗС, которым требуется топливо его типа.
    2. Общий объем топлива для доставки на АЗС в одном рейсе не должен превышать вместимость цистерны топливозаправщика. Рассчитай общий объем для загрузки.
    3. Построй самый эффективный маршрут, чтобы минимизировать общее расстояние и время.
    4. Нефтебаза находится в координатах ${JSON.stringify(DEPOT_COORDINATES)}. Топливозаправщик начинает и заканчивает маршрут на базе.
    5. Маршрут всегда начинается с действия "Загрузить" на нефтебазе и заканчивается возвращением на нефтебазу.
    6. Предоставь ответ в формате JSON, соответствующем предоставленной схеме. JSON должен быть массивом с одним объектом, представляющим один рейс для одного грузовика.
    7. В поле 'action' подробно опиши действие, например "Загрузить 28000л АИ-95" или "Разгрузить 15000л АИ-95".
    8. Рассчитай примерную стоимость и время для всего рейса.

    **Данные для планирования:**

    **Выбранный топливозаправщик (может перевозить только ${truck.fuelType}):**
    ${JSON.stringify(truck, null, 2)}

    **Выбранные АЗС для заправки (только топливом типа ${truck.fuelType}):**
    ${JSON.stringify(relevantStations, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: routePlanSchema,
        },
    });
    
    const text = response.text.trim();
    if (text) {
      return JSON.parse(text) as RoutePlan[];
    }
    return null;
  } catch (error) {
    console.error("Ошибка при оптимизации маршрута:", error);
    return null;
  }
};
