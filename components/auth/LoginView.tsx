
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (user: string, pass: string) => void;
  error: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('logist');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-blue-dark">FuelOpt</h1>
          <p className="mt-2 text-brand-gray-600">Вход для оптимизации маршрутов</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-brand-gray-700">
              Имя пользователя
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-brand-gray-700">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white transition-colors bg-brand-blue-light rounded-md hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark"
            >
              Войти
            </button>
          </div>
        </form>
        <p className="text-xs text-center text-brand-gray-500">
            Используйте логин: <span className="font-mono">logist</span> и пароль: <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
};