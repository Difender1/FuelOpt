
import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FuelType } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ReportsView: React.FC = () => {
    const { logs, fuelPrices } = useAppContext();

    const reportData = useMemo(() => {
        return logs.map(log => {
            const pricePerLiter = fuelPrices[log.fuelType] || 0;
            const revenue = log.volume * pricePerLiter;
            return {
                ...log,
                pricePerLiter,
                revenue,
            };
        });
    }, [logs, fuelPrices]);

    const totalRevenue = useMemo(() => {
        return reportData.reduce((acc, item) => acc + item.revenue, 0);
    }, [reportData]);

    const revenueByFuelType = useMemo(() => {
        const data = Object.values(FuelType).map(type => ({
            name: type,
            Выручка: reportData
                .filter(log => log.fuelType === type)
                .reduce((acc, log) => acc + log.revenue, 0),
        }));
        return data.filter(item => item.Выручка > 0);
    }, [reportData]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-brand-gray-800 mb-4">Финансовый отчет</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-brand-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-brand-gray-500">Всего доставок</p>
                        <p className="text-3xl font-bold text-brand-blue-dark">{logs.length}</p>
                    </div>
                    <div className="bg-brand-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-brand-gray-500">Общий объем, л</p>
                        <p className="text-3xl font-bold text-brand-blue-dark">{logs.reduce((acc, log) => acc + log.volume, 0).toLocaleString('ru-RU')}</p>
                    </div>
                    <div className="bg-brand-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-brand-gray-500">Общая выручка, руб.</p>
                        <p className="text-3xl font-bold text-brand-blue-dark">{totalRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {revenueByFuelType.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-brand-gray-700 mb-4">Выручка по типу топлива</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueByFuelType} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${(value as number / 1000)}k`} />
                                <Tooltip formatter={(value) => `${(value as number).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} руб.`} />
                                <Legend />
                                <Bar dataKey="Выручка" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-gray-800 mb-6">Детализация доставок</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-gray-100 border-b">
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Дата</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Грузовик</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Водитель</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider">Тип топлива</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider text-right">Объём, л</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider text-right">Цена, руб/л</th>
                                <th className="p-4 font-semibold text-sm text-brand-gray-600 uppercase tracking-wider text-right">Выручка, руб.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map(log => (
                                <tr key={log.id} className="border-b hover:bg-brand-gray-50">
                                    <td className="p-4 text-brand-gray-900">{new Date(log.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-4 text-brand-gray-900 font-mono text-sm">{log.truckId}</td>
                                    <td className="p-4 text-brand-gray-900">{log.driver}</td>
                                    <td className="p-4 text-brand-gray-900">{log.fuelType}</td>
                                    <td className="p-4 text-brand-gray-900 text-right">{log.volume.toLocaleString('ru-RU')}</td>
                                    <td className="p-4 text-brand-gray-900 text-right">{log.pricePerLiter.toFixed(2)}</td>
                                    <td className="p-4 text-brand-gray-900 font-semibold text-right">{log.revenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
