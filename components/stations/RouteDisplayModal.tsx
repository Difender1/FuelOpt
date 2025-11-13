import React from 'react';
import type { GasStation } from '../../types';
import { CloseIcon } from '../ui/Icons';
import { SingleRouteMap } from './SingleRouteMap';

interface RouteDisplayModalProps {
  station: GasStation;
  onClose: () => void;
}

export const RouteDisplayModal: React.FC<RouteDisplayModalProps> = ({ station, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-brand-gray-800">Маршрут до "{station.name}"</h2>
                        <p className="text-sm text-brand-gray-500">{station.address}</p>
                    </div>
                    <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-800" aria-label="Закрыть">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow p-4">
                    <SingleRouteMap destination={station.coordinates} />
                </div>
            </div>
        </div>
    );
};
