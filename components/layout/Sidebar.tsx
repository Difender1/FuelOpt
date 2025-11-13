
import React from 'react';
import { DashboardIcon, TruckIcon, GasStationIcon, RouteIcon, LogIcon, ReportIcon } from '../ui/Icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-3 w-full text-left text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-brand-blue-dark text-white'
        : 'text-gray-300 hover:bg-brand-blue-light hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Панель управления', icon: <DashboardIcon className="w-6 h-6" /> },
    { id: 'fleet', label: 'Автопарк', icon: <TruckIcon className="w-6 h-6" /> },
    { id: 'stations', label: 'АЗС', icon: <GasStationIcon className="w-6 h-6" /> },
    { id: 'planner', label: 'Планировщик', icon: <RouteIcon className="w-6 h-6" /> },
    { id: 'logs', label: 'Журнал операций', icon: <LogIcon className="w-6 h-6" /> },
    { id: 'reports', label: 'Отчеты', icon: <ReportIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-blue-dark flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 bg-brand-blue-dark border-b border-brand-blue-dark">
        <h1 className="text-white text-xl font-bold">FuelOpt</h1>
      </div>
      <nav className="flex-1 mt-4">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};
