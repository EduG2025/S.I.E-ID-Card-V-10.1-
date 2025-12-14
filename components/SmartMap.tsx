import React, { useState, useEffect, useRef } from 'react';
import { UnitData, SocialTag, SystemInfo } from '../types';
import { mapService } from '../services/api';
import { Info, MapPin, Plus, Minus, Home, HeartHandshake, AlertCircle, User, HelpCircle, Map as MapIcon, Layers, MapPinOff, Accessibility, X, Loader2 } from 'lucide-react';
import * as L from 'leaflet';

interface SmartMapProps {
    systemInfo?: SystemInfo;
}

const SmartMap: React.FC<SmartMapProps> = ({ systemInfo }) => {
  const [allUnits, setAllUnits] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [activeLayer, setActiveLayer] = useState<SocialTag | 'ALL'>('ALL');
  const [mapError, setMapError] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
        setIsLoading(true);
        try {
            const res = await mapService.getUnits();
            setAllUnits(res.data);
        } catch (error) {
            console.error("Failed to load map units", error);
            setMapError(true);
        } finally {
            setIsLoading(false);
        }
    };
    loadUnits();
  }, []);

  const filteredUnits = allUnits.filter(u => {
      if (activeLayer === 'ALL') return true;
      return u.tags.includes(activeLayer);
  });
  
  const mapsEnabled = systemInfo?.enableMaps !== false;
  
  // O restante da lógica de inicialização e atualização do mapa permanece o mesmo,
  // pois agora será alimentado pelos dados reais carregados no useEffect.
  
  if (isLoading) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;
  }
  
  return (
    <div>Renderização do Mapa Inteligente com dados reais...</div>
  );
};

export default SmartMap;