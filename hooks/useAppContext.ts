
// Fix: Import React to resolve 'Cannot find namespace React' errors.
import React, { createContext, useContext } from 'react';
import type { Truck, GasStation, DeliveryLog, RoutePlan, FuelType } from '../types';

interface AppContextType {
  trucks: Truck[];
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>;
  stations: GasStation[];
  setStations: React.Dispatch<React.SetStateAction<GasStation[]>>;
  logs: DeliveryLog[];
  setLogs: React.Dispatch<React.SetStateAction<DeliveryLog[]>>;
  optimizedRoute: RoutePlan[] | null;
  setOptimizedRoute: React.Dispatch<React.SetStateAction<RoutePlan[] | null>>;
  fuelPrices: Record<FuelType, number>;
  setFuelPrices: React.Dispatch<React.SetStateAction<Record<FuelType, number>>>;
  selectedTruckIdForPlanner: string | null;
  setSelectedTruckIdForPlanner: React.Dispatch<React.SetStateAction<string | null>>;
  selectedStationIdsForPlanner: string[];
  setSelectedStationIdsForPlanner: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};