import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Truck } from '../../types';
import { TruckStatus, FuelType } from '../../types';
import { TRUCK_STATUS_COLORS } from '../../constants';
import { EditIcon, DeleteIcon, PlusIcon } from '../ui/Icons';
import { EditTruckModal } from './EditTruckModal';

export const FleetView: React.FC = () => {
    const { trucks, setTrucks } = useAppContext();
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
    
    // In a real app, this would be a modal with a form
    const handleAddTruck = () => {
      const newTruck: Truck = {
        id: `t${Date.now()}`,
        number: `Н${Math.floor(Math.random()*900)+100}ОВ 77`,
        fuelType: FuelType.AI95,
        volume: 30000,
        driver: 'Новый Водитель',
        status: TruckStatus.IDLE,
      };
      setTrucks([...trucks, newTruck]);
    };

    const handleDeleteTruck = (id: string) => {
        setTrucks(trucks.filter(truck => truck.id !== id));
    };

    const handleUpdateTruck = (updatedTruck: Truck) => {
        setTrucks(trucks.map(t => t.id === updatedTruck.id ? updatedTruck : t));
        setEditingTruck(null); // Close modal on save
    };

    return (
        <>
            {editingTruck && <EditTruckModal truck={editingTruck} onSave={handleUpdateTruck} onClose={() => setEditingTruck(null)} />}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-gray-800">Управление автопарком</h2>
                    <button onClick={handleAddTruck} className="flex items-center bg-brand-blue-light text-white px-4 py-2 rounded-lg hover:bg-brand-blue-dark transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Добавить грузовик
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-gray-100 border-b">
                                <th className="p-4 font-semibold text-brand-gray-600">Номер</th>
                                <th className="p-4 font-semibold text-brand-gray-600">Тип топлива</th>
                                <th className="p-4 font-semibold text-brand-gray-600">Объём, л</th>
                                <th className="p-4 font-semibold text-brand-gray-600">Водитель</th>
                                <th className="p-4 font-semibold text-brand-gray-600">Статус</th>
                                <th className="p-4 font-semibold text-brand-gray-600">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trucks.map(truck => (
                                <tr key={truck.id} className="border-b hover:bg-brand-gray-50">
                                    <td className="p-4 text-brand-gray-900">{truck.number}</td>
                                    <td className="p-4 text-brand-gray-900">{truck.fuelType}</td>
                                    <td className="p-4 text-brand-gray-900">{truck.volume.toLocaleString('ru-RU')}</td>
                                    <td className="p-4 text-brand-gray-900">{truck.driver}</td>
                                    <td className="p-4 text-brand-gray-900">
                                        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${TRUCK_STATUS_COLORS[truck.status]}`}>
                                            {truck.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex items-center space-x-2">
                                        <button onClick={() => setEditingTruck(truck)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteTruck(truck.id)} className="text-red-600 hover:text-red-800"><DeleteIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};