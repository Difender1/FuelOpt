
import React, { useState } from 'react';
import type { GasStation, FuelLevel } from '../../types';
import { FuelType } from '../../types';
import { CloseIcon, PlusIcon, DeleteIcon } from '../ui/Icons';

interface AddStationModalProps {
  onClose: () => void;
  onAddStation: (station: GasStation) => void;
}

export const AddStationModal: React.FC<AddStationModalProps> = ({ onClose, onAddStation }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState<number | ''>('');
    const [lon, setLon] = useState<number | ''>('');
    const [fuelLevels, setFuelLevels] = useState<Partial<FuelLevel>[]>([{ type: FuelType.AI95, current: 10000, min: 5000, max: 40000 }]);
    const [error, setError] = useState('');
    
    const inputClasses = "block w-full border border-brand-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-blue-light focus:border-brand-blue-light bg-white text-brand-gray-900";


    const handleFuelLevelChange = (index: number, field: keyof FuelLevel, value: string) => {
        const newFuelLevels = [...fuelLevels];
        if (field === 'type') {
            newFuelLevels[index][field] = value as FuelType;
        } else {
            newFuelLevels[index][field] = Number(value);
        }
        setFuelLevels(newFuelLevels);
    };

    const addFuelType = () => {
        setFuelLevels([...fuelLevels, { type: FuelType.AI92, current: 0, min: 0, max: 0 }]);
    };
    
    const removeFuelType = (index: number) => {
        setFuelLevels(fuelLevels.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || lat === '' || lon === '') {
            setError('Все поля обязательны для заполнения.');
            return;
        }
        if (fuelLevels.some(f => !f.type || f.current === undefined || f.min === undefined || f.max === undefined || f.max <= f.min)) {
            setError('Все поля для типов топлива должны быть корректно заполнены (Макс > Мин).');
            return;
        }

        const newStation: GasStation = {
            id: `s${Date.now()}`,
            name,
            address,
            coordinates: [lat, lon],
            fuelLevels: fuelLevels as FuelLevel[],
        };
        onAddStation(newStation);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-gray-800">Добавить новую АЗС</h2>
                    <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-800" aria-label="Закрыть">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="station-name" className="block text-sm font-medium text-brand-gray-700">Название АЗС</label>
                        <input id="station-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${inputClasses}`} required />
                    </div>
                    <div>
                        <label htmlFor="station-address" className="block text-sm font-medium text-brand-gray-700">Адрес</label>
                        <input id="station-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={`mt-1 ${inputClasses}`} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="station-lat" className="block text-sm font-medium text-brand-gray-700">Широта</label>
                            <input id="station-lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`mt-1 ${inputClasses}`} required />
                        </div>
                        <div>
                            <label htmlFor="station-lon" className="block text-sm font-medium text-brand-gray-700">Долгота</label>
                            <input id="station-lon" type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`mt-1 ${inputClasses}`} required />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-brand-gray-700 mb-2">Уровни топлива</h3>
                        <div className="space-y-3">
                            {fuelLevels.map((fuel, index) => (
                                <div key={index} className="grid grid-cols-10 gap-2 items-center p-2 bg-brand-gray-50 rounded">
                                    <select aria-label={`Тип топлива ${index + 1}`} value={fuel.type} onChange={(e) => handleFuelLevelChange(index, 'type', e.target.value)} className={`col-span-2 ${inputClasses}`}>
                                        {Object.values(FuelType).map(ft => <option key={ft} value={ft}>{ft}</option>)}
                                    </select>
                                    <input type="number" placeholder="Текущий" aria-label={`Текущий уровень ${index + 1}`} value={fuel.current} onChange={(e) => handleFuelLevelChange(index, 'current', e.target.value)} className={`col-span-2 ${inputClasses}`} />
                                    <input type="number" placeholder="Мин." aria-label={`Минимальный уровень ${index + 1}`} value={fuel.min} onChange={(e) => handleFuelLevelChange(index, 'min', e.target.value)} className={`col-span-2 ${inputClasses}`} />
                                    <input type="number" placeholder="Макс." aria-label={`Максимальный уровень ${index + 1}`} value={fuel.max} onChange={(e) => handleFuelLevelChange(index, 'max', e.target.value)} className={`col-span-2 ${inputClasses}`} />
                                    <div className="col-span-2 flex justify-end">
                                        <button type="button" onClick={() => removeFuelType(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full" aria-label={`Удалить тип топлива ${index + 1}`}>
                                            <DeleteIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addFuelType} className="mt-2 flex items-center text-sm text-brand-blue-light hover:text-brand-blue-dark font-medium">
                            <PlusIcon className="w-4 h-4 mr-1"/>
                            Добавить тип топлива
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
                
                    <div className="p-6 border-t flex justify-end space-x-3 mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-brand-gray-200 text-brand-gray-800 rounded-lg hover:bg-brand-gray-300">
                            Отмена
                        </button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue-light text-white rounded-lg hover:bg-brand-blue-dark">
                            Добавить АЗС
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};