
import type { Truck, GasStation, DeliveryLog } from './types';
import { FuelType, TruckStatus } from './types';

export const MOCK_TRUCKS: Truck[] = [
  { id: 't001', number: 'А123БВ 77', fuelType: FuelType.AI95, volume: 30000, driver: 'Иванов И.И.', status: TruckStatus.IDLE },
  { id: 't002', number: 'С456ДЕ 77', fuelType: FuelType.DIESEL, volume: 40000, driver: 'Петров П.П.', status: TruckStatus.IDLE },
  { id: 't003', number: 'Е789ЖЗ 99', fuelType: FuelType.AI92, volume: 25000, driver: 'Сидоров С.С.', status: TruckStatus.IDLE },
  { id: 't004', number: 'И012КЛ 50', fuelType: FuelType.AI98, volume: 20000, driver: 'Кузнецов К.К.', status: TruckStatus.IDLE },
  { id: 't005', number: 'М345НО 50', fuelType: FuelType.DIESEL, volume: 40000, driver: 'Васильев В.В.', status: TruckStatus.IDLE },
];

export const MOCK_STATIONS: GasStation[] = [
  {
    id: 's001',
    name: 'Белоруснефть АЗС №15',
    address: 'г. Крупки, ул. Московская, 107',
    coordinates: [54.3215, 29.1553],
    fuelLevels: [
      { type: FuelType.AI95, current: 8000, min: 10000, max: 40000 },
      { type: FuelType.DIESEL, current: 18000, min: 15000, max: 50000 },
      { type: FuelType.AI92, current: 4000, min: 8000, max: 30000 },
    ],
  },
  {
    id: 's002',
    name: 'Белоруснефть АЗС №14',
    address: 'г. Крупки, ул. Черняховского, 1',
    coordinates: [54.3168, 29.1351],
    fuelLevels: [
      { type: FuelType.AI92, current: 15000, min: 8000, max: 30000 },
      { type: FuelType.AI95, current: 22000, min: 10000, max: 40000 },
    ],
  },
  {
    id: 's003',
    name: 'Газпромнефть АЗС №53',
    address: 'Трасса М1/Е30, 462-й км',
    coordinates: [54.2985, 29.2311],
    fuelLevels: [
      { type: FuelType.AI95, current: 9000, min: 12000, max: 45000 },
      { type: FuelType.DIESEL, current: 35000, min: 15000, max: 60000 },
      { type: FuelType.AI98, current: 6000, min: 5000, max: 20000 },
    ],
  },
  {
    id: 's004',
    name: 'United Company АЗС №3',
    address: 'г. Борисов, ул. Гагарина, 105а',
    coordinates: [54.2435, 28.5033],
    fuelLevels: [
        { type: FuelType.AI92, current: 11000, min: 8000, max: 30000 },
        { type: FuelType.AI95, current: 18000, min: 10000, max: 40000 },
        { type: FuelType.DIESEL, current: 9000, min: 10000, max: 50000 },
    ],
  },
];

export const MOCK_LOGS: DeliveryLog[] = [];

export const MOCK_FUEL_PRICES: Record<FuelType, number> = {
  [FuelType.AI92]: 2.35,
  [FuelType.AI95]: 2.45,
  [FuelType.AI98]: 2.67,
  [FuelType.DIESEL]: 2.45,
};


export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
    [FuelType.AI92]: 'bg-yellow-400',
    [FuelType.AI95]: 'bg-green-400',
    [FuelType.AI98]: 'bg-blue-400',
    [FuelType.DIESEL]: 'bg-gray-500',
};

export const TRUCK_STATUS_COLORS: Record<TruckStatus, string> = {
    [TruckStatus.IDLE]: 'bg-green-500',
    [TruckStatus.LOADING]: 'bg-blue-500',
    [TruckStatus.UNLOADING]: 'bg-indigo-500',
    [TruckStatus.EN_ROUTE]: 'bg-yellow-500',
};

export const DEPOT_COORDINATES: [number, number] = [54.3330, 29.1331];
