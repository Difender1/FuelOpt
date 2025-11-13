import React, { useEffect, useRef, useState } from 'react';
import { DEPOT_COORDINATES } from '../../constants';

// Declare Leaflet and its routing machine plugin to TypeScript
declare const L: any;

export const SingleRouteMap: React.FC<{ destination: [number, number] }> = ({ destination }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const routingControl = useRef<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const createDepotIcon = () => {
        return L.divIcon({
            html: `<div class="relative flex items-center justify-center w-10 h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e40af" class="w-10 h-10 drop-shadow-lg">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                   </div>`,
            className: 'bg-transparent border-0',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    };

    const createStationIcon = () => {
        return L.divIcon({
            html: `<div class="relative flex items-center justify-center w-8 h-8">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" class="w-8 h-8 drop-shadow-lg">
                       <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.16-4.212c1.558-2.22 1.986-4.634 1.986-7.157C20.563 5.424 16.742 2 12 2S3.437 5.424 3.437 10.938c0 2.523.428 4.937 1.986 7.157 1.564 2.22 3.599 3.99 5.16 4.211zM12 12.188a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clip-rule="evenodd" />
                     </svg>
                   </div>`,
            className: 'bg-transparent border-0',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
    };

    useEffect(() => {
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            setError("Библиотека карт (Leaflet) не загрузилась. Проверьте интернет-соединение.");
            return;
        }

        // Initialize map only once
        if (mapRef.current && !mapInstance.current) {
            try {
                mapInstance.current = L.map(mapRef.current).setView(DEPOT_COORDINATES, 11);
    
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstance.current);

            } catch (e) {
                console.error("Failed to initialize Leaflet map:", e);
                setError("Не удалось инициализировать карту.");
            }
        }
    }, []);
    
    useEffect(() => {
        if (!mapInstance.current || !destination) return;
        
        // Remove previous route if it exists
        if (routingControl.current) {
            mapInstance.current.removeControl(routingControl.current);
        }

        try {
            routingControl.current = L.Routing.control({
                waypoints: [
                    L.latLng(DEPOT_COORDINATES[0], DEPOT_COORDINATES[1]),
                    L.latLng(destination[0], destination[1])
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                lineOptions: {
                    styles: [{ color: '#1e40af', opacity: 0.8, weight: 5 }]
                },
                createMarker: function(i: number, waypoint: any, n: number) {
                    const icon = i === 0 ? createDepotIcon() : createStationIcon();
                    const label = i === 0 ? 'Нефтебаза' : 'АЗС';
                    return L.marker(waypoint.latLng, { icon }).bindPopup(`<b>${label}</b>`);
                },
                show: false, // Hide the itinerary panel
            }).addTo(mapInstance.current);

        } catch (e) {
            console.error("Failed to create routing control:", e);
            setError("Не удалось построить маршрут. Возможно, сервис маршрутизации недоступен.");
        }

    }, [destination]); // Rerun when map is ready or destination changes

    return (
        <div className="w-full h-full bg-brand-gray-200 rounded-lg relative">
            {error && <div className="absolute top-2 left-2 z-[1000] bg-red-100 text-red-700 p-2 rounded-md shadow-lg"><p>{error}</p></div>}
            <div ref={mapRef} className="w-full h-full rounded-lg" />
        </div>
    );
};