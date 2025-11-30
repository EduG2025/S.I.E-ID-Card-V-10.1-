
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_UNITS } from '../constants';
import { UnitData, SocialTag, SystemInfo } from '../types';
import { Info, MapPin, Plus, Minus, Home, HeartHandshake, AlertCircle, User, HelpCircle, Map as MapIcon, Layers, MapPinOff, Accessibility, X } from 'lucide-react';
import * as L from 'leaflet';

interface SmartMapProps {
    systemInfo?: SystemInfo;
    units?: UnitData[]; // Allow passing filtered units externally
}

const SmartMap: React.FC<SmartMapProps> = ({ systemInfo, units }) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [activeLayer, setActiveLayer] = useState<SocialTag | 'ALL'>('ALL');
  const [mapError, setMapError] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Use provided units or default to MOCK_UNITS
  const baseUnits = units || MOCK_UNITS;

  // Filter logic based on the new tags
  const filteredUnits = baseUnits.filter(u => {
      if (activeLayer === 'ALL') return true;
      return u.tags.includes(activeLayer);
  });
  
  const mapsEnabled = systemInfo?.enableMaps !== false;

  // Color helper logic matching the Tailwind classes used in UI
  const getMarkerColorHex = (unit: UnitData) => {
      if (activeLayer === 'LOW_INCOME' || (activeLayer === 'ALL' && unit.tags.includes('LOW_INCOME'))) return '#f43f5e'; // rose-500
      if (activeLayer === 'ELDERLY_ALONE' || (activeLayer === 'ALL' && unit.tags.includes('ELDERLY_ALONE'))) return '#f59e0b'; // amber-500
      if (activeLayer === 'DISABILITY' || (activeLayer === 'ALL' && unit.tags.includes('DISABILITY'))) return '#10b981'; // emerald-500
      if (activeLayer === 'HELP_REQUEST' || (activeLayer === 'ALL' && unit.tags.includes('HELP_REQUEST'))) return '#a855f7'; // purple-500
      return '#3b82f6'; // blue-500
  };

  const getMarkerIconHtml = (unit: UnitData) => {
       const color = getMarkerColorHex(unit);
       // Simple SVG marker string with dynamic color
       return `
         <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-full transform transition-all hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-lg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="white"></circle>
            </svg>
            ${unit.vulnerabilityLevel === 'HIGH' ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>' : ''}
         </div>
       `;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapsEnabled || mapError) return;
    if (!mapContainerRef.current) return;
    
    try {
        if (mapInstanceRef.current) return;

        // Center on Cacaria, Piraí based on mock coords
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([-22.6186, -43.7122], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        // Add zoom control to bottom right manually to match design
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
    } catch (error) {
        console.error("Map Init Error", error);
        setMapError(true);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [mapsEnabled]);

  // Update Markers when filter changes
  useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !mapsEnabled) return;

      try {
          // Clear existing markers
          markersRef.current.forEach(marker => marker.remove());
          markersRef.current = [];

          filteredUnits.forEach(unit => {
              const customIcon = L.divIcon({
                  className: 'leaflet-div-icon',
                  html: getMarkerIconHtml(unit),
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
              });

              const marker = L.marker([unit.coordinates.lat, unit.coordinates.lng], { icon: customIcon })
                .addTo(map)
                .on('click', () => {
                    setSelectedUnit(unit);
                    map.flyTo([unit.coordinates.lat, unit.coordinates.lng], 18, { duration: 0.5 });
                });
              
              markersRef.current.push(marker);
          });
      } catch (error) {
          console.error("Marker update error", error);
      }

  }, [filteredUnits, activeLayer, mapsEnabled, mapError]);

  // Zoom handlers for external buttons
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.flyTo([-22.6186, -43.7122], 16, { duration: 1 });


  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 group animate-fade-in">
        
        {/* HEADER OVERLAY */}
        <div className="absolute top-4 left-4 z-[400] pointer-events-none flex flex-col gap-2">
             <div className="pointer-events-auto">
                <h2 className="text-xl font-bold text-slate-800 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <MapIcon size={20} className="text-indigo-600"/> Mapa Inteligente
                </h2>
                <div className="mt-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-medium text-slate-500 flex items-center gap-2 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistema Online • Piraí/RJ
                </div>
             </div>
        </div>

        {/* MAP AREA */}
        {mapsEnabled && !mapError ? (
            <>
                <div ref={mapContainerRef} className="w-full h-full z-0"></div>

                {/* CONTROLS */}
                <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-2">
                     <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs font-medium text-slate-600">
                         <p className="mb-1 font-bold text-slate-800">Legenda</p>
                         <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Baixa Renda</div>
                         <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Idosos</div>
                         <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> PCD</div>
                         <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Ajuda</div>
                     </div>
                </div>

                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[400]">
                    <button onClick={handleZoomIn} className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><Plus size={20}/></button>
                    <button onClick={handleZoomOut} className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><Minus size={20}/></button>
                    <button onClick={handleReset} className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors tooltip" title="Resetar"><Home size={20}/></button>
                </div>
            </>
        ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <MapPinOff size={64} className="mb-4 opacity-50"/>
                <p className="font-medium text-lg">Mapa Indisponível</p>
                <p className="text-sm text-slate-500 mt-2">
                    {mapError ? 'Ocorreu um erro ao carregar o módulo de mapas.' : 'A visualização de mapas foi desativada pelo administrador.'}
                </p>
            </div>
        )}

        {/* FLOATING FILTER PANEL (LEGEND) */}
        {mapsEnabled && !mapError && (
            <div className="absolute top-24 right-6 z-[400] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-slate-200 w-64 animate-fade-in hidden md:block">
                <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Layers size={16}/> Camadas (Filtros)</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${activeLayer === 'ALL' ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}>
                            {activeLayer === 'ALL' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                        </div>
                        <input type="radio" name="layer" className="hidden" checked={activeLayer === 'ALL'} onChange={() => setActiveLayer('ALL')} />
                        <span className={`text-sm font-medium transition-colors ${activeLayer === 'ALL' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-800'}`}>População Geral</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${activeLayer === 'LOW_INCOME' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'}`}>
                            {activeLayer === 'LOW_INCOME' && <div className="w-2 h-2 rounded-full bg-rose-500"></div>}
                        </div>
                        <input type="radio" name="layer" className="hidden" checked={activeLayer === 'LOW_INCOME'} onChange={() => setActiveLayer('LOW_INCOME')} />
                        <span className={`text-sm font-medium transition-colors ${activeLayer === 'LOW_INCOME' ? 'text-rose-600' : 'text-slate-600 group-hover:text-slate-800'}`}>Baixa Renda ({'<'} 1SM)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${activeLayer === 'ELDERLY_ALONE' ? 'border-amber-500 bg-amber-50' : 'border-slate-300'}`}>
                            {activeLayer === 'ELDERLY_ALONE' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                        </div>
                        <input type="radio" name="layer" className="hidden" checked={activeLayer === 'ELDERLY_ALONE'} onChange={() => setActiveLayer('ELDERLY_ALONE')} />
                        <span className={`text-sm font-medium transition-colors ${activeLayer === 'ELDERLY_ALONE' ? 'text-amber-600' : 'text-slate-600 group-hover:text-slate-800'}`}>Idosos Sozinhos</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${activeLayer === 'DISABILITY' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                            {activeLayer === 'DISABILITY' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <input type="radio" name="layer" className="hidden" checked={activeLayer === 'DISABILITY'} onChange={() => setActiveLayer('DISABILITY')} />
                        <span className={`text-sm font-medium transition-colors ${activeLayer === 'DISABILITY' ? 'text-emerald-600' : 'text-slate-600 group-hover:text-slate-800'}`}>Pessoas c/ Deficiência</span>
                    </label>
                    
                     <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${activeLayer === 'HELP_REQUEST' ? 'border-purple-500 bg-purple-50' : 'border-slate-300'}`}>
                            {activeLayer === 'HELP_REQUEST' && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                        </div>
                        <input type="radio" name="layer" className="hidden" checked={activeLayer === 'HELP_REQUEST'} onChange={() => setActiveLayer('HELP_REQUEST')} />
                        <span className={`text-sm font-medium transition-colors ${activeLayer === 'HELP_REQUEST' ? 'text-purple-600' : 'text-slate-600 group-hover:text-slate-800'}`}>Pedidos de Ajuda</span>
                    </label>
                </div>
                {/* Stats Mini */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                     <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total na camada</p>
                     <p className="text-2xl font-bold text-slate-800">{filteredUnits.length}</p>
                     <p className="text-xs text-slate-500">unidades mapeadas</p>
                </div>
            </div>
        )}

      {/* DETAILS PANEL (SLIDE OVER) */}
      <div className={`
          absolute right-0 top-0 bottom-0 z-[1000]
          w-full md:w-96 bg-white shadow-2xl border-l border-slate-200
          transition-transform duration-300 ease-in-out transform
          ${selectedUnit ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selectedUnit && (
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-lg font-bold text-slate-800">Detalhes da Unidade</h3>
                 <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                    <X size={20}/>
                 </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* Identity Card */}
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-indigo-600`}>
                        {selectedUnit.number}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Bloco {selectedUnit.block}</p>
                        <h4 className="font-bold text-xl text-slate-800">{selectedUnit.residentName}</h4>
                        {selectedUnit.cep && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={10}/> CEP: {selectedUnit.cep}</p>}
                    </div>
                </div>

                {/* Social Tags */}
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Marcadores Sociais</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedUnit.tags.includes('LOW_INCOME') && <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-rose-200"><AlertCircle size={14}/> Baixa Renda</span>}
                        {selectedUnit.tags.includes('ELDERLY_ALONE') && <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-200"><User size={14}/> Idoso Sozinho</span>}
                        {selectedUnit.tags.includes('DISABILITY') && <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-200"><Accessibility size={14}/> PCD</span>}
                        {selectedUnit.tags.includes('HELP_REQUEST') && <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-purple-200"><HelpCircle size={14}/> Ajuda Solicitada</span>}
                        {selectedUnit.tags.includes('NONE') && <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">Sem observações</span>}
                    </div>
                </div>

                {/* Action Suggestion */}
                <div className={`p-5 rounded-xl border ${selectedUnit.vulnerabilityLevel === 'HIGH' ? 'bg-rose-50 border-rose-100' : selectedUnit.vulnerabilityLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${selectedUnit.vulnerabilityLevel === 'HIGH' ? 'text-rose-600' : selectedUnit.vulnerabilityLevel === 'MEDIUM' ? 'text-amber-600' : 'text-indigo-600'}`}>
                        <HeartHandshake size={16}/> Ação Recomendada
                    </p>
                    {selectedUnit.vulnerabilityLevel === 'HIGH' ? (
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">Prioridade para visita da assistência social. Verificar condições de saneamento e alimentação.</p>
                    ) : selectedUnit.vulnerabilityLevel === 'MEDIUM' ? (
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">Incluir em programas de monitoramento quinzenal. Verificar necessidade de remédios.</p>
                    ) : (
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">Monitoramento padrão. Nenhuma ação urgente necessária no momento.</p>
                    )}
                </div>
                
                {/* Geo Data */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-100 rounded-xl text-center bg-slate-50">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Latitude</p>
                        <p className="text-xs font-mono text-slate-700 font-medium">{selectedUnit.coordinates.lat.toFixed(6)}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl text-center bg-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Longitude</p>
                            <p className="text-xs font-mono text-slate-700 font-medium">{selectedUnit.coordinates.lng.toFixed(6)}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2 active:scale-95">
                    <Info size={18}/> Ver Ficha Completa
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMap;
