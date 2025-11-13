import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FUEL_TYPE_COLORS } from '../../constants';
import { AddStationModal } from './AddStationModal';
import { RouteDisplayModal } from './RouteDisplayModal';
import { PlusIcon, MapPinIcon } from '../ui/Icons';
import type { GasStation } from '../../types';

const FuelLevelBar: React.FC<{ level: { current: number; min: number; max: number } }> = ({ level }) => {
    const percentage = (level.current / level.max) * 100;
    const minPercentage = (level.min / level.max) * 100;

    let barColor = 'bg-green-500';
    if (percentage < (minPercentage + 10)) barColor = 'bg-yellow-500';
    if (percentage < minPercentage) barColor = 'bg-red-500';

    return (
        <div className="w-full bg-brand-gray-200 rounded-full h-5 relative">
            <div
                className={`h-5 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentage}%` }}
            ></div>
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-brand-gray-700/70"
                style={{ left: `${minPercentage}%` }}
                title={`Минимальный уровень: ${level.min.toLocaleString('ru-RU')} л`}
            >
                <div className="absolute -top-4 -translate-x-1/2 text-[10px] text-brand-gray-600 font-semibold">min</div>
            </div>
            <span className="absolute w-full text-center text-xs text-white font-bold inset-0 flex items-center justify-center z-10 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {level.current.toLocaleString('ru-RU')} / {level.max.toLocaleString('ru-RU')} л
            </span>
        </div>
    );
};

export const StationsView: React.FC = () => {
    const { stations, setStations } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [stationForRoute, setStationForRoute] = useState<GasStation | null>(null);

    const handleAddStation = (newStation: GasStation) => {
        setStations(prevStations => [...prevStations, newStation]);
    };

    return (
        <>
            {isAddModalOpen && <AddStationModal onClose={() => setIsAddModalOpen(false)} onAddStation={handleAddStation} />}
            {stationForRoute && <RouteDisplayModal station={stationForRoute} onClose={() => setStationForRoute(null)} />}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-gray-800">Состояние АЗС</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-brand-blue-light text-white px-4 py-2 rounded-lg hover:bg-brand-blue-dark transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Добавить АЗС
                    </button>
                </div>
                <div className="space-y-6">
                    {stations.map(station => (
                        <div key={station.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                               <div>
                                    <h3 className="text-lg font-bold text-brand-gray-900">{station.name}</h3>
                                    <p className="text-sm text-brand-gray-500">{station.address}</p>
                               </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <div className="text-xs text-brand-gray-400">
                                        {`Координаты: ${station.coordinates[0]}, ${station.coordinates[1]}`}
                                    </div>
                                    <button
                                        onClick={() => setStationForRoute(station)}
                                        className="flex items-center text-sm text-brand-blue-light hover:text-brand-blue-dark font-medium px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        <MapPinIcon className="w-4 h-4 mr-1.5"/>
                                        Показать маршрут
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {station.fuelLevels.map(fuel => (
                                    <div key={fuel.type} className="grid grid-cols-5 items-center gap-4">
                                        <div className="col-span-1 flex items-center">
                                             <span className={`w-3 h-3 rounded-full mr-2 ${FUEL_TYPE_COLORS[fuel.type]}`}></span>
                                             <span className="font-medium">{fuel.type}</span>
                                        </div>
                                        <div className="col-span-4">
                                            <FuelLevelBar level={fuel} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};