
import React, { useState, useEffect } from 'react';
import type { Truck } from '../../types';
import { FuelType } from '../../types';
import { CloseIcon } from '../ui/Icons';

interface EditTruckModalProps {
  truck: Truck;
  onSave: (truck: Truck) => void;
  onClose: () => void;
}

export const EditTruckModal: React.FC<EditTruckModalProps> = ({ truck, onSave, onClose }) => {
    const [formData, setFormData] = useState<Truck>(truck);

    useEffect(() => {
        setFormData(truck);
    }, [truck]);

    const handleChange = (field: keyof Truck, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClasses = "mt-1 block w-full border border-brand-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-gray-800">Редактировать грузовик</h2>
                    <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-800" aria-label="Закрыть">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="truck-number" className="block text-sm font-medium text-brand-gray-700">Номер</label>
                            <input id="truck-number" type="text" value={formData.number} onChange={(e) => handleChange('number', e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="truck-driver" className="block text-sm font-medium text-brand-gray-700">Водитель</label>
                            <input id="truck-driver" type="text" value={formData.driver} onChange={(e) => handleChange('driver', e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="fuel-type" className="block text-sm font-medium text-brand-gray-700">Тип топлива</label>
                            <select id="fuel-type" value={formData.fuelType} onChange={(e) => handleChange('fuelType', e.target.value)} className={inputClasses}>
                                {Object.values(FuelType).map(ft => <option key={ft} value={ft}>{ft}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="truck-volume" className="block text-sm font-medium text-brand-gray-700">Объем, л</label>
                            <input id="truck-volume" type="number" value={formData.volume} onChange={(e) => handleChange('volume', Number(e.target.value))} className={inputClasses} required />
                        </div>
                    </div>
                    <div className="p-6 border-t flex justify-end space-x-3 bg-brand-gray-50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-brand-gray-200 text-brand-gray-800 rounded-lg hover:bg-brand-gray-300">
                            Отмена
                        </button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue-light text-white rounded-lg hover:bg-brand-blue-dark">
                            Сохранить изменения
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
