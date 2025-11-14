
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (user: string, pass: string) => void;
  onRegister: (fullName: string, user: string, pass: string) => boolean;
  error: string | null;
  message: string | null;
  onResetFeedback: () => void;
}

type AuthMode = 'login' | 'register';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, error, message, onResetFeedback }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLocalError(null);
    onResetFeedback();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username.trim(), password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setLocalError('Пароли не совпадают.');
      return;
    }
    if (!fullName.trim()) {
      setLocalError('Укажите имя и фамилию.');
      return;
    }
    const success = onRegister(fullName.trim(), regUsername.trim(), regPassword);
    if (success) {
      setLocalError(null);
      setMode('login');
      setRegPassword('');
      setRegConfirm('');
      setFullName('');
      setRegUsername('');
    }
  };

  const renderForm = () => {
    if (mode === 'login') {
      return (
        <form className="space-y-6" onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="login-username" className="text-sm font-medium text-brand-gray-700">
              Имя пользователя
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm font-medium text-brand-gray-700">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
            />
          </div>
          {(error || message) && (
            <p className={`text-sm text-center ${error ? 'text-red-500' : 'text-green-600'}`}>
              {error ?? message}
            </p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white transition-colors bg-brand-blue-light rounded-md hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark"
          >
            Войти
          </button>
        </form>
      );
    }

    return (
      <form className="space-y-4" onSubmit={handleRegisterSubmit}>
        <div>
          <label htmlFor="register-fullname" className="text-sm font-medium text-brand-gray-700">
            Имя и фамилия
          </label>
          <input
            id="register-fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
          />
        </div>
        <div>
          <label htmlFor="register-username" className="text-sm font-medium text-brand-gray-700">
            Имя пользователя
          </label>
          <input
            id="register-username"
            type="text"
            required
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="text-sm font-medium text-brand-gray-700">
            Пароль
          </label>
          <input
            id="register-password"
            type="password"
            required
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
          />
        </div>
        <div>
          <label htmlFor="register-confirm" className="text-sm font-medium text-brand-gray-700">
            Повторите пароль
          </label>
          <input
            id="register-confirm"
            type="password"
            required
            value={regConfirm}
            onChange={(e) => setRegConfirm(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-brand-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
          />
        </div>
        {(localError || error || message) && (
          <p className={`text-sm text-center ${localError || error ? 'text-red-500' : 'text-green-600'}`}>
            {localError ?? error ?? message}
          </p>
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white transition-colors bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
        >
          Зарегистрироваться
        </button>
      </form>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-blue-dark">FuelOpt</h1>
          <p className="mt-2 text-brand-gray-600">
            {mode === 'login' ? 'Войдите в систему' : 'Создайте аккаунт, чтобы начать'}
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-brand-blue-light text-white' : 'text-brand-gray-500 bg-brand-gray-100'
            }`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Вход
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-emerald-600 text-white' : 'text-brand-gray-500 bg-brand-gray-100'
            }`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Регистрация
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};