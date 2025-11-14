
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { FleetView } from './components/fleet/FleetView';
import { StationsView } from './components/stations/StationsView';
import { RoutePlannerView } from './components/planner/RoutePlannerView';
import { LogView } from './components/log/LogView';
import { ReportsView } from './components/reports/ReportsView';
import { LoginView } from './components/auth/LoginView';
import { AppContext } from './hooks/useAppContext';
import { MOCK_TRUCKS, MOCK_STATIONS, MOCK_LOGS, MOCK_FUEL_PRICES } from './constants';
import type { Truck, GasStation, DeliveryLog, RoutePlan, FuelType } from './types';

const STATIONS_STORAGE_KEY = 'fuelopt_stations';
const LOGS_STORAGE_KEY = 'fuelopt_logs';

const readStoredData = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const persistData = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/serialization errors
  }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  
  const [trucks, setTrucks] = useState<Truck[]>(MOCK_TRUCKS);
  const [stations, setStations] = useState<GasStation[]>(() => readStoredData(STATIONS_STORAGE_KEY, MOCK_STATIONS));
  const [logs, setLogs] = useState<DeliveryLog[]>(() => readStoredData(LOGS_STORAGE_KEY, MOCK_LOGS));
  const [optimizedRoute, setOptimizedRoute] = useState<RoutePlan[] | null>(null);
  const [fuelPrices, setFuelPrices] = useState<Record<FuelType, number>>(MOCK_FUEL_PRICES);

  // State for planner selections to persist across views
  const [selectedTruckIdForPlanner, setSelectedTruckIdForPlanner] = useState<string | null>(null);
  const [selectedStationIdsForPlanner, setSelectedStationIdsForPlanner] = useState<string[]>([]);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fuel consumption simulation
  useEffect(() => {
    const consumptionInterval = setInterval(() => {
      setStations(prevStations =>
        prevStations.map(station => ({
          ...station,
          fuelLevels: station.fuelLevels.map(fuelLevel => ({
            ...fuelLevel,
            // Subtract 500L, but not less than 0
            current: Math.max(0, fuelLevel.current - 500),
          })),
        }))
      );
    }, 10000); // 10 seconds

    // Clear interval on component unmount
    return () => clearInterval(consumptionInterval);
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    persistData(STATIONS_STORAGE_KEY, stations);
  }, [stations]);

  useEffect(() => {
    persistData(LOGS_STORAGE_KEY, logs);
  }, [logs]);

  const handleLogin = (user: string, pass: string) => {
    // Mock authentication
    if (user === 'logist' && pass === 'password123') {
      setIsLoggedIn(true);
      setAuthError(null);
    } else {
      setAuthError('Неверное имя пользователя или пароль.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const appContextValue = useMemo(() => ({
    trucks,
    setTrucks,
    stations,
    setStations,
    logs,
    setLogs,
    optimizedRoute,
    setOptimizedRoute,
    fuelPrices,
    setFuelPrices,
    selectedTruckIdForPlanner,
    setSelectedTruckIdForPlanner,
    selectedStationIdsForPlanner,
    setSelectedStationIdsForPlanner,
  }), [trucks, stations, logs, optimizedRoute, fuelPrices, selectedTruckIdForPlanner, selectedStationIdsForPlanner]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'fleet':
        return <FleetView />;
      case 'stations':
        return <StationsView />;
      case 'planner':
        return <RoutePlannerView />;
      case 'logs':
        return <LogView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} error={authError} />;
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex h-screen bg-brand-gray-100 text-brand-gray-800">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onLogout={handleLogout} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-100 p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
