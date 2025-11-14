
import React from 'react';

interface HeaderProps {
    onLogout: () => void;
    userName: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, userName }) => {
  const initials = userName.trim().charAt(0).toUpperCase() || 'Л';
  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-brand-gray-700">Оптимизатор маршрутов доставки топлива</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
            <span className="text-sm font-medium text-brand-gray-600">{userName}</span>
            <div className="ml-3 w-10 h-10 bg-brand-blue-light rounded-full flex items-center justify-center text-white font-bold">
            {initials}
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-brand-gray-700 bg-brand-gray-100 rounded-md hover:bg-brand-gray-200 transition-colors"
        >
            Выйти
        </button>
      </div>
    </header>
  );
};
