
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
const USERS_STORAGE_KEY = 'fuelopt_users';
const CURRENT_USER_STORAGE_KEY = 'fuelopt_current_user';

interface StoredUser {
  username: string;
  password: string;
  fullName: string;
}

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
  const [users, setUsers] = useState<StoredUser[]>(() => readStoredData(USERS_STORAGE_KEY, []));
  const initialStoredUser = readStoredData<StoredUser | null>(CURRENT_USER_STORAGE_KEY, null);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(initialStoredUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(initialStoredUser));
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

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

  useEffect(() => {
    persistData(USERS_STORAGE_KEY, users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      persistData(CURRENT_USER_STORAGE_KEY, currentUser);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const handleLogin = (username: string, password: string) => {
    setAuthMessage(null);
    const existingUser = users.find(u => u.username === username);
    if (!existingUser || existingUser.password !== password) {
      setAuthError('Неверное имя пользователя или пароль.');
      return;
    }

    setCurrentUser(existingUser);
    setIsLoggedIn(true);
    setAuthError(null);
  };

  const handleRegister = (fullName: string, username: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);

    if (users.some(u => u.username === username)) {
      setAuthError('Пользователь с таким именем уже существует.');
      return false;
    }

    const newUser: StoredUser = { fullName, username, password };
    setUsers(prev => [...prev, newUser]);
    setAuthMessage('Регистрация прошла успешно. Теперь войдите с этими данными.');
    return true;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const resetAuthFeedback = () => {
    setAuthError(null);
    setAuthMessage(null);
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
    return (
      <LoginView
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        message={authMessage}
        onResetFeedback={resetAuthFeedback}
      />
    );
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex h-screen bg-brand-gray-100 text-brand-gray-800">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onLogout={handleLogout} userName={currentUser?.fullName ?? 'Пользователь'} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-100 p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
