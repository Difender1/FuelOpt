
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { optimizeRoute } from '../../services/geminiService';
import { TruckStatus, FuelType } from '../../types';
import type { DeliveryLog, GasStation } from '../../types';
import { OptimizeIcon, TruckIcon } from '../ui/Icons';
import { RouteMap } from './RouteMap';

export const RoutePlannerView: React.FC = () => {
    const { 
        stations, setStations, trucks, setTrucks, logs, setLogs, 
        optimizedRoute, setOptimizedRoute,
        selectedTruckIdForPlanner: selectedTruckId, 
        setSelectedTruckIdForPlanner: setSelectedTruckId,
        selectedStationIdsForPlanner: selectedStationIds,
        setSelectedStationIdsForPlanner: setSelectedStationIds,
    } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedTruck = useMemo(() => trucks.find(t => t.id === selectedTruckId), [trucks, selectedTruckId]);

    // Show all stations that need any type of fuel
    const stationsToRefuel = useMemo(() => {
        return stations
            .map(station => {
                const fuelNeeded = station.fuelLevels
                    .filter(f => f.current < f.min)
                    .map(f => ({ type: f.type, volume: f.max - f.current }));
                return { station, fuelNeeded };
            })
            .filter(item => item.fuelNeeded.length > 0);
    }, [stations]);
    
    const availableTrucks = useMemo(() => {
        return trucks.filter(truck => truck.status === TruckStatus.IDLE);
    }, [trucks]);

    const handleTruckSelect = (truckId: string) => {
        setSelectedTruckId(truckId);
        setSelectedStationIds([]); // Reset station selection when truck changes
    };

    const handleStationSelect = (stationId: string) => {
        setSelectedStationIds(prev =>
            prev.includes(stationId)
                ? prev.filter(id => id !== stationId)
                : [...prev, stationId]
        );
    };

    const handleOptimize = async () => {
        if (!selectedTruckId || selectedStationIds.length === 0) {
            setError("Пожалуйста, выберите грузовик и хотя бы одну АЗС.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setOptimizedRoute(null);

        const truckToDispatch = availableTrucks.find(t => t.id === selectedTruckId);
        // Pass all selected stations, service will filter them
        const stationsForDispatch = stationsToRefuel.filter(s => selectedStationIds.includes(s.station.id));

        if (!truckToDispatch) {
            setError("Выбранный грузовик не найден.");
            setIsLoading(false);
            return;
        }
        
        // Add a check here for better UX
        const relevantStationsForTruck = stationsForDispatch.filter(s => s.fuelNeeded.some(f => f.type === truckToDispatch.fuelType));
        if (relevantStationsForTruck.length === 0) {
            setError(`Выбранные АЗС не требуют топлива типа ${truckToDispatch.fuelType}.`);
            setIsLoading(false);
            return;
        }


        try {
            // The service will handle filtering, but we send all selected
            const result = await optimizeRoute(truckToDispatch, stationsForDispatch);
            if (result && result.length > 0) {
                setOptimizedRoute(result);
            } else {
                 setError("Не удалось построить маршрут. Возможно, выбранные АЗС не требуют топлива, которое может доставить этот грузовик.");
            }
        } catch (err) {
            setError("Произошла ошибка при связи с сервисом оптимизации.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const DRIVE_TIME = 5000;
    const UNLOAD_TIME = 3000;
    const RETURN_TIME = 5000;
    const LOAD_TIME = 3000;

    const handleDispatch = () => {
        if (!optimizedRoute || optimizedRoute.length === 0) return;

        const plan = optimizedRoute[0];
        const { truckId, driver, route, totalVolumeLoaded, fuelType, estimatedCost } = plan;

        const truck = trucks.find(t => t.id === truckId);
        if (!truck || truck.status !== TruckStatus.IDLE) {
            alert('Этот грузовик сейчас занят. Дождитесь, пока он снова будет простаивать.');
            return;
        }

        const updateTruckStatus = (status: TruckStatus) => {
            setTrucks(prevTrucks =>
                prevTrucks.map(t =>
                    t.id === truckId ? { ...t, status } : t
                )
            );
        };

        updateTruckStatus(TruckStatus.EN_ROUTE);

        setOptimizedRoute(null);
        setSelectedTruckId(null);
        setSelectedStationIds([]);

        setTimeout(() => {
            updateTruckStatus(TruckStatus.UNLOADING);

            setTimeout(() => {
                setStations(prevStations => {
                    let updatedStations = [...prevStations];
                    route.forEach(step => {
                        if (step.type === 'station' && step.action.startsWith('Разгрузить')) {
                            const match = step.action.match(/Разгрузить\s+([\d\s]+)л\s+(.+)/);
                            if (match) {
                                const volumeDelivered = parseInt(match[1].replace(/\s/g, ''), 10);
                                const fuelTypeDelivered = match[2] as FuelType;

                                updatedStations = updatedStations.map(station => {
                                    if (station.name === step.name) {
                                        const newFuelLevels = station.fuelLevels.map(fl => {
                                            if (fl.type === fuelTypeDelivered) {
                                                const newLevel = Math.min(fl.max, fl.current + volumeDelivered);
                                                return { ...fl, current: newLevel };
                                            }
                                            return fl;
                                        });
                                        return { ...station, fuelLevels: newFuelLevels };
                                    }
                                    return station;
                                });
                            }
                        }
                    });
                    return updatedStations;
                });

                const newLog: DeliveryLog = {
                    id: `l${Date.now()}`,
                    date: new Date().toISOString(),
                    truckId: truckId,
                    driver: driver,
                    route: route.map(step => step.name),
                    volume: totalVolumeLoaded,
                    fuelType: fuelType,
                    cost: estimatedCost,
                };
                setLogs(prevLogs => [newLog, ...prevLogs]);

                updateTruckStatus(TruckStatus.EN_ROUTE);

                setTimeout(() => {
                    updateTruckStatus(TruckStatus.LOADING);

                    setTimeout(() => {
                        updateTruckStatus(TruckStatus.IDLE);
                    }, LOAD_TIME);
                }, RETURN_TIME);

            }, UNLOAD_TIME);

        }, DRIVE_TIME);
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
                <h2 className="text-2xl font-bold text-brand-gray-800 mb-4 flex-shrink-0">Планировщик маршрутов</h2>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-brand-gray-700 mb-2 sticky top-0 bg-white py-2">1. Выберите грузовик</h3>
                        {availableTrucks.length > 0 ? (
                            <ul className="space-y-2">
                                {availableTrucks.map(truck => (
                                    <li key={truck.id}>
                                        <label className={`flex items-center text-sm p-3 rounded-lg border-2 transition-all ${selectedTruckId === truck.id ? 'border-brand-blue-light bg-blue-50' : 'border-transparent bg-brand-gray-100 hover:bg-brand-gray-200'}`}>
                                            <input type="radio" name="truck-selection" checked={selectedTruckId === truck.id} onChange={() => handleTruckSelect(truck.id)} className="mr-3 h-4 w-4 text-brand-blue-light focus:ring-brand-blue-dark"/>
                                            <TruckIcon className="w-5 h-5 mr-2 text-brand-gray-600"/> 
                                            <span className="font-semibold">{truck.number}</span>
                                            <span className="ml-auto text-brand-gray-500">{truck.fuelType}, {truck.volume.toLocaleString('ru-RU')} л</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-brand-gray-500 p-3 bg-brand-gray-100 rounded-lg">Нет свободных грузовиков.</p>
                        )}
                    </div>

                    <div className={`${!selectedTruckId ? 'opacity-50' : ''}`}>
                         <h3 className="text-lg font-semibold text-brand-gray-700 mb-2 sticky top-0 bg-white py-2">2. Выберите АЗС</h3>
                         {!selectedTruckId ? <p className="text-brand-gray-500 p-3 bg-brand-gray-100 rounded-lg">Сначала выберите грузовик.</p> :
                            stationsToRefuel.length > 0 ? (
                            <ul className="space-y-2">
                                {stationsToRefuel.map(({ station, fuelNeeded }) => {
                                    return (
                                     <li key={station.id}>
                                        <label className={`block text-sm p-3 rounded-lg border-2 transition-all ${selectedStationIds.includes(station.id) ? 'border-brand-blue-light bg-blue-50' : 'border-transparent bg-brand-gray-100 hover:bg-brand-gray-200'}`}>
                                            <div className="flex items-center">
                                                <input type="checkbox" checked={selectedStationIds.includes(station.id)} onChange={() => handleStationSelect(station.id)} className="mr-3 h-4 w-4 text-brand-blue-light focus:ring-brand-blue-dark rounded"/>
                                                <p className="font-bold">{station.name}</p>
                                            </div>
                                            <div className="ml-7 space-y-1 mt-1">
                                                {fuelNeeded.map(fuel => (
                                                     <p key={fuel.type} className="text-red-700 text-xs">Требуется {fuel.type}: {fuel.volume.toLocaleString('ru-RU')} л</p>
                                                ))}
                                            </div>
                                        </label>
                                     </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-brand-gray-500 p-3 bg-brand-gray-100 rounded-lg">Нет АЗС, которым требуется топливо.</p>
                        )}
                    </div>
                </div>
                
                <div className="mt-6 flex-shrink-0">
                    <button 
                        onClick={handleOptimize} 
                        disabled={isLoading || !selectedTruckId || selectedStationIds.length === 0}
                        className="w-full flex items-center justify-center bg-brand-blue-light text-white px-6 py-3 rounded-lg hover:bg-brand-blue-dark transition-colors disabled:bg-brand-gray-300 disabled:cursor-not-allowed font-semibold"
                    >
                        {isLoading ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Оптимизация...
                            </>
                        ) : (
                            <>
                                <OptimizeIcon className="w-5 h-5 mr-2"/>
                                Рассчитать маршрут
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                    
                    {optimizedRoute && !isLoading && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <h3 className="font-bold text-lg text-green-800">Маршрут готов!</h3>
                            <p className="text-sm text-green-700 mt-2">
                                План для грузовика {optimizedRoute[0].truckId} ({optimizedRoute[0].driver}) создан.
                            </p>
                            <button
                                onClick={handleDispatch}
                                className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                            >
                                Отправить в рейс
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
                 <h2 className="text-2xl font-bold text-brand-gray-800 mb-4 flex-shrink-0">Карта маршрута</h2>
                <RouteMap routePlans={optimizedRoute} isLoading={isLoading} />
            </div>
        </div>
    );
};
