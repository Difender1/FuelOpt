
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TruckIcon, GasStationIcon, LogIcon } from '../ui/Icons';
import { TruckStatus, FuelType } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-brand-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-gray-800">{value}</p>
        </div>
    </div>
);

const FuelPriceEditor: React.FC = () => {
    const { fuelPrices, setFuelPrices } = useAppContext();

    const handlePriceChange = (fuelType: FuelType, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (!isNaN(price) && price >= 0) {
            setFuelPrices(prevPrices => ({
                ...prevPrices,
                [fuelType]: price,
            }));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-gray-700 mb-4">Управление ценами на топливо</h3>
            <div className="space-y-3">
                {Object.entries(fuelPrices).map(([type, price]) => (
                    <div key={type} className="flex items-center justify-between">
                        <label htmlFor={`price-${type}`} className="font-medium text-brand-gray-600">{type}</label>
                        <div className="relative">
                            <input
                                id={`price-${type}`}
                                type="number"
                                value={price}
                                onChange={(e) => handlePriceChange(type as FuelType, e.target.value)}
                                step="0.01"
                                min="0"
                                className="w-32 pl-3 pr-8 py-1.5 border border-brand-gray-300 rounded-md shadow-sm text-right focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900"
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-gray-500">
                                руб.
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DashboardView: React.FC = () => {
    const { trucks, stations, logs } = useAppContext();

    const idleTrucks = trucks.filter(t => t.status === TruckStatus.IDLE).length;
    const stationsNeedingFuel = stations.filter(s => s.fuelLevels.some(f => f.current < f.min)).length;
    const deliveriesToday = logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length;

    const fleetUtilizationData = Object.values(TruckStatus).map(status => ({
        name: status,
        count: trucks.filter(t => t.status === status).length,
    }));

    const fuelDeliveryData = Object.values(FuelType).map(type => ({
        name: type,
        volume: logs.reduce((acc, log) => log.fuelType === type ? acc + log.volume : acc, 0),
    }));

    const PIE_COLORS = ['#4ade80', '#fbbf24', '#60a5fa', '#a78bfa'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Всего грузовиков" value={trucks.length} icon={<TruckIcon className="w-6 h-6 text-white" />} color="bg-blue-500" />
                <StatCard title="Свободно" value={`${idleTrucks}`} icon={<TruckIcon className="w-6 h-6 text-white" />} color="bg-green-500" />
                <StatCard title="АЗС требуют топлива" value={stationsNeedingFuel} icon={<GasStationIcon className="w-6 h-6 text-white" />} color="bg-red-500" />
                <StatCard title="Доставок сегодня" value={deliveriesToday} icon={<LogIcon className="w-6 h-6 text-white" />} color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-brand-gray-700 mb-4">Загруженность автопарка</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={fleetUtilizationData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {fleetUtilizationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-brand-gray-700 mb-4">Объём доставленного топлива (л)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={fuelDeliveryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="volume" name="Объем" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="xl:col-span-1">
                    <FuelPriceEditor />
                </div>
            </div>
        </div>
    );
};