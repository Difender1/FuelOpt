
import React, { useEffect, useRef, useState } from 'react';
import type { RoutePlan, RouteStep } from '../../types';
import { TruckIcon } from '../ui/Icons';

// Declare Leaflet and its routing machine plugin to TypeScript
declare const L: any;

interface RouteMapProps {
    routePlans: RoutePlan[] | null;
    isLoading: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({ routePlans, isLoading }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const routingControl = useRef<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Function to create a custom icon for stations
    const createNumberedIcon = (number: number) =>
        L.divIcon({
            html: `
                <div class="flex items-center justify-center w-9 h-9 rounded-full bg-white border-2 border-blue-500 text-blue-700 font-semibold shadow-md">
                    ${number}
                </div>
            `,
            className: 'bg-transparent border-0',
            iconSize: [36, 36],
            iconAnchor: [18, 34],
        });
    
    const createDepotIcon = () =>
        L.divIcon({
            html: `
                <div class="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg">
                    <span>DEP</span>
                </div>
            `,
            className: 'bg-transparent border-0',
            iconSize: [40, 40],
            iconAnchor: [20, 38],
        });

    const invalidateSize = () => {
        if (mapInstance.current) {
            setTimeout(() => {
                mapInstance.current.invalidateSize();
            }, 50);
        }
    };

    useEffect(() => {
        if (typeof L === 'undefined') {
            setError("Библиотека карт (Leaflet) не загрузилась.");
            return;
        }

        if (mapRef.current && !mapInstance.current) {
            try {
                mapInstance.current = L.map(mapRef.current).setView([54.3330, 29.1331], 11);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstance.current);
                invalidateSize();
            } catch (e) {
                console.error("Failed to initialize Leaflet map:", e);
                setError("Не удалось инициализировать карту.");
            }
        }
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;

        // Remove previous route
        if (routingControl.current) {
            mapInstance.current.removeControl(routingControl.current);
            routingControl.current = null;
        }

        if (!routePlans || routePlans.length === 0) {
            // If no route, just show depot
             if(mapInstance.current.markers) { // Simple check to avoid adding multiple depot markers
                mapInstance.current.markers.forEach((m: any) => m.remove());
             }
             const depotMarker = L.marker([54.3330, 29.1331], { icon: createDepotIcon() }).addTo(mapInstance.current);
             mapInstance.current.markers = [depotMarker];
             mapInstance.current.setView([54.3330, 29.1331], 11);
             invalidateSize();
            return;
        }

        const plan = routePlans[0]; // Assuming one plan for now
        if (plan.route.length < 2) return;

        const waypoints = plan.route.map(step => L.latLng(step.coordinates[0], step.coordinates[1]));
        
        try {
            routingControl.current = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                lineOptions: {
                    styles: [{ color: '#1e40af', opacity: 0.8, weight: 6 }]
                },
                createMarker: function(i: number, waypoint: any, n: number) {
                    const step: RouteStep = plan.route[i];
                    let icon;
                    if (step.type === 'depot') {
                        icon = createDepotIcon();
                    } else {
                        // Find station index (excluding depot)
                        const stationIndex = plan.route.filter(r => r.type === 'station').findIndex(s => s.name === step.name);
                        icon = createNumberedIcon(stationIndex + 1);
                    }
                    const marker = L.marker(waypoint.latLng, { icon });
                    marker.bindPopup(`<b>${step.name}</b><br>${step.action}`);
                    return marker;
                },
                show: false,
            });

            routingControl.current.on('routesfound', (e: any) => {
                if (e.routes && e.routes.length > 0) {
                    const bounds = e.routes[0].bounds;
                    if (mapInstance.current && bounds) {
                        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
                    }
                }
            });

            routingControl.current.addTo(mapInstance.current);
            invalidateSize();

        } catch(e) {
            console.error("Failed to create routing control:", e);
            setError("Не удалось построить маршрут. Возможно, сервис маршрутизации недоступен.");
        }

    }, [routePlans]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><p className="text-lg">Идет расчет маршрута...</p></div>;
        }
        if (!routePlans || routePlans.length === 0) {
            return <div className="flex justify-center items-center h-full"><p className="text-lg text-brand-gray-500">Маршрут не рассчитан. Выберите грузовик и АЗС.</p></div>;
        }
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {routePlans?.map(plan => (
                    <div key={plan.truckId} className="p-3 border rounded-lg bg-brand-gray-50">
                        <div className="flex items-center font-bold text-brand-gray-800">
                           <TruckIcon className="w-5 h-5 mr-2 text-brand-blue-light" />
                           Рейс: {plan.truckId} ({plan.driver})
                        </div>
                        <p className="text-sm">Топливо: <span className="font-semibold">{plan.fuelType}</span></p>
                        <p className="text-sm">Объем: <span className="font-semibold">{plan.totalVolumeLoaded.toLocaleString('ru-RU')} л</span></p>
                        <p className="text-sm">Время: <span className="font-semibold">{plan.estimatedTime}</span></p>
                        <p className="text-sm">Стоимость: <span className="font-semibold">{plan.estimatedCost.toLocaleString('ru-RU')} руб.</span></p>
                    </div>
                ))}
            </div>
            <div className="flex-grow bg-brand-gray-200 rounded-lg relative">
                 {error && <div className="absolute top-2 left-2 z-[1000] bg-red-100 text-red-700 p-2 rounded-md shadow-lg"><p>{error}</p></div>}
                <div ref={mapRef} className="w-full h-full rounded-lg" />
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
