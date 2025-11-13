
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export const LogView: React.FC = () => {
    const { logs } = useAppContext();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-gray-800 mb-6">Журнал операций</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-gray-100 border-b">
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Дата и время</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Грузовик ID</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Водитель</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Тип топлива</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Объём, л</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Стоимость, руб.</th>
                            <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Маршрут</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b hover:bg-brand-gray-50">
                                <td className="p-4 text-brand-gray-900">{new Date(log.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="p-4 text-brand-gray-900 font-mono text-sm">{log.truckId}</td>
                                <td className="p-4 text-brand-gray-900">{log.driver}</td>
                                <td className="p-4 text-brand-gray-900">{log.fuelType}</td>
                                <td className="p-4 text-brand-gray-900">{log.volume.toLocaleString('ru-RU')}</td>
                                <td className="p-4 text-brand-gray-900">{log.cost.toLocaleString('ru-RU')}</td>
                                <td className="p-4 text-xs text-brand-gray-600">{log.route.join(' -> ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
