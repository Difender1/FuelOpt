
export enum FuelType {
  AI92 = 'АИ-92',
  AI95 = 'АИ-95',
  AI98 = 'АИ-98',
  DIESEL = 'ДТ',
}

export enum TruckStatus {
  IDLE = 'Простаивает',
  LOADING = 'На загрузке',
  UNLOADING = 'На разгрузке',
  EN_ROUTE = 'В пути',
}

export interface Truck {
  id: string;
  number: string;
  fuelType: FuelType;
  volume: number;
  driver: string;
  status: TruckStatus;
}

export interface FuelLevel {
  type: FuelType;
  current: number;
  min: number;
  max: number;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  fuelLevels: FuelLevel[];
}

export interface DeliveryLog {
  id: string;
  date: string;
  truckId: string;
  driver: string;
  route: string[];
  volume: number;
  fuelType: FuelType;
  cost: number;
}

export interface RouteStep {
    type: 'depot' | 'station';
    action: string;
    name: string;
    address?: string;
    coordinates: [number, number];
}

export interface RoutePlan {
    truckId: string;
    driver: string;
    fuelType: FuelType;
    totalVolumeLoaded: number;
    estimatedTime: string;
    estimatedCost: number;
    route: RouteStep[];
}
   