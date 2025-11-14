import { GoogleGenAI, Type } from "@google/genai";
import { DEPOT_COORDINATES } from "../../constants";
import type { Truck, GasStation, RoutePlan } from "../../types";

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

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
            type: { type: Type.STRING, enum: ["depot", "station"] },
            action: { type: Type.STRING },
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            coordinates: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
            },
          },
          required: ["type", "action", "name", "coordinates"],
        },
      },
    },
    required: [
      "truckId",
      "driver",
      "fuelType",
      "totalVolumeLoaded",
      "estimatedTime",
      "estimatedCost",
      "route",
    ],
  },
};

const buildPrompt = (truck: Truck, relevantStations: { station: GasStation; fuelNeeded: { type: string; volume: number }[] }[]) => `
Ты - эксперт по логистике в компании по доставке топлива. 
Твоя задача - создать оптимальный план доставки для КОНКРЕТНОГО топливозаправщика на ВЫБРАННЫЕ АЗС.

Правила:
1. Топливозаправщик должен посетить все указанные АЗС, которым требуется топливо его типа.
2. Общий объем топлива не должен превышать вместимость цистерны топливозаправщика. Посчитай общий объем загрузки.
3. Построй эффективный маршрут. Машина стартует и заканчивает на нефтебазе (${JSON.stringify(DEPOT_COORDINATES)}).
4. Маршрут начинается действием "Загрузить ..." и заканчивается возвращением на нефтебазу.
5. Ответ строго в JSON по схеме, одному объекту на рейс.
6. В поле action указывай подробное действие, например "Разгрузить 15000л АИ-95".
7. Добавь оценку времени и стоимости рейса.

Выбранный топливозаправщик (перевозит только ${truck.fuelType}):
${JSON.stringify(truck, null, 2)}

Выбранные АЗС, которым требуется ${truck.fuelType}:
${JSON.stringify(relevantStations, null, 2)}
`;

export const handler = async (event: { httpMethod?: string; body?: string }) => {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  if (!ai) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gemini API key is not configured on the server." }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const { truck, stationsToRefuel } = payload as {
      truck: Truck;
      stationsToRefuel: { station: GasStation; fuelNeeded: { type: string; volume: number }[] }[];
    };

    if (!truck || !stationsToRefuel) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid payload" }) };
    }

    const relevantStations = stationsToRefuel
      .map((s) => {
        const relevantFuel = s.fuelNeeded.find((f) => f.type === truck.fuelType);
        if (!relevantFuel) return null;
        return {
          station: s.station,
          fuelNeeded: [relevantFuel],
        };
      })
      .filter(
        (
          item
        ): item is { station: GasStation; fuelNeeded: { type: string; volume: number }[] } =>
          item !== null
      );

    if (relevantStations.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ routePlans: null, message: "Нет подходящих АЗС для выбранного топлива." }),
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(truck, relevantStations),
      config: {
        responseMimeType: "application/json",
        responseSchema: routePlanSchema,
      },
    });

    const text = response.text.trim();
    const parsed = text ? (JSON.parse(text) as RoutePlan[]) : null;

    return {
      statusCode: 200,
      body: JSON.stringify({ routePlans: parsed }),
    };
  } catch (error) {
    console.error("Gemini function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to optimize route" }),
    };
  }
};

