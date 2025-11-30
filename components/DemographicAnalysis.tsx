
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Calendar, DollarSign, Briefcase, AlertTriangle, Droplets, Lightbulb, Trash2, HeartHandshake, Filter, RefreshCw, Layers, Info, FileText, Download, Map as MapIcon, X, MapPinOff, LayoutDashboard, Search, MapPin } from 'lucide-react';
import { MOCK_DEMOGRAPHICS, MOCK_UNITS, MOCK_SYSTEM_INFO } from '../constants';
import * as L from 'leaflet';
import { jsPDF } from 'jspdf';
import { SystemInfo } from '../types';
import SmartMap from './SmartMap';

interface DemographicAnalysisProps {
    systemInfo?: SystemInfo;
}

const DemographicAnalysis: React.FC<DemographicAnalysisProps> = ({ systemInfo }) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MAP'>('DASHBOARD');

    // STATE: FILTERS (Initialized from localStorage if available)
    const [ageFilter, setAgeFilter] = useState(() => localStorage.getItem('demo_ageFilter') || 'ALL');
    const [incomeFilter, setIncomeFilter] = useState(() => localStorage.getItem('demo_incomeFilter') || 'ALL');
    const [infraFilter, setInfraFilter] = useState(() => localStorage.getItem('demo_infraFilter') || 'ALL');
    const [addressSearch, setAddressSearch] = useState(() => localStorage.getItem('demo_addressSearch') || '');
    const [cepSearch, setCepSearch] = useState(() => localStorage.getItem('demo_cepSearch') || '');
    
    // STATE: UI
    const [showLegend, setShowLegend] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportConfig, setReportConfig] = useState({ format: 'PDF', period: 'CURRENT_MONTH' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [mapError, setMapError] = useState(false);

    // REFS
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    
    // Determine if map should be enabled
    const mapsEnabled = systemInfo?.enableMaps !== false;

    // EFFECT: SAVE TO LOCAL STORAGE
    useEffect(() => {
        localStorage.setItem('demo_ageFilter', ageFilter);
        localStorage.setItem('demo_incomeFilter', incomeFilter);
        localStorage.setItem('demo_infraFilter', infraFilter);
        localStorage.setItem('demo_addressSearch', addressSearch);
        localStorage.setItem('demo_cepSearch', cepSearch);
    }, [ageFilter, incomeFilter, infraFilter, addressSearch, cepSearch]);

    // FILTRAGEM DINÂMICA
    const filteredUnits = useMemo(() => {
        return MOCK_UNITS.filter(unit => {
            // Filtro de Texto (Endereço/Nome/Bloco)
            if (addressSearch) {
                const searchLower = addressSearch.toLowerCase();
                const matchesSearch = 
                    unit.block.toLowerCase().includes(searchLower) || 
                    unit.number.includes(searchLower) || 
                    unit.residentName.toLowerCase().includes(searchLower);
                
                if (!matchesSearch) return false;
            }

            // Filtro de CEP
            if (cepSearch) {
                const searchClean = cepSearch.replace(/\D/g, '');
                const unitCepClean = (unit.cep || '').replace(/\D/g, '');
                if (!unitCepClean.includes(searchClean)) return false;
            }

            // Filtro de Renda
            if (incomeFilter === 'LOW') {
                if (!unit.tags.includes('LOW_INCOME') && unit.vulnerabilityLevel !== 'HIGH') return false;
            } else if (incomeFilter === 'MEDIUM_HIGH') {
                if (unit.tags.includes('LOW_INCOME') || unit.vulnerabilityLevel === 'HIGH') return false;
            }

            // Filtro de Faixa Etária
            if (ageFilter === 'SENIORS') {
                if (!unit.tags.includes('ELDERLY_ALONE')) return false; 
            } else if (ageFilter === 'CHILDREN') {
                if (unit.tags.includes('ELDERLY_ALONE')) return false; // Mock logic: assume elderly alone excludes children
            } else if (ageFilter === 'ADULTS') {
                if (unit.tags.includes('ELDERLY_ALONE')) return false;
            }

            // Filtro de Infraestrutura
            if (infraFilter === 'CRITICAL') {
                if (unit.vulnerabilityLevel !== 'HIGH') return false;
            } else if (infraFilter === 'WARNING') {
                if (unit.vulnerabilityLevel !== 'MEDIUM') return false;
            }

            return true;
        });
    }, [ageFilter, incomeFilter, infraFilter, addressSearch, cepSearch]);

    // EFFECT: LEAFLET MAP INITIALIZATION & CLEANUP (Heatmap on Dashboard)
    useEffect(() => {
        // Only run this if we are on Dashboard tab and maps are enabled
        if (activeTab !== 'DASHBOARD' || !mapsEnabled || mapError) return;
        
        if (!mapContainerRef.current) return;

        try {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([-22.6186, -43.7122], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);

            const layerGroup = L.layerGroup().addTo(map);
            
            mapInstanceRef.current = map;
            markersLayerRef.current = layerGroup;
        } catch (error) {
            console.error("Erro ao inicializar mapa de calor:", error);
            setMapError(true);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markersLayerRef.current = null;
            }
        };
    }, [mapsEnabled, activeTab]);

    // EFFECT: UPDATE MARKERS (Heatmap on Dashboard)
    useEffect(() => {
        if (activeTab !== 'DASHBOARD' || !mapsEnabled || mapError) return;
        
        try {
            const layerGroup = markersLayerRef.current;
            if (!layerGroup) return;

            layerGroup.clearLayers();

            filteredUnits.forEach(unit => {
                const color = unit.vulnerabilityLevel === 'HIGH' ? '#e11d48' : 
                              unit.vulnerabilityLevel === 'MEDIUM' ? '#f59e0b' : 
                              '#3b82f6';
                
                L.circleMarker([unit.coordinates.lat, unit.coordinates.lng], {
                    radius: 12,
                    fillColor: color,
                    color: 'transparent',
                    weight: 0,
                    opacity: 0,
                    fillOpacity: 0.4
                })
                .addTo(layerGroup);
            });
        } catch (error) {
            console.error("Erro ao atualizar marcadores do heatmap:", error);
        }
    }, [filteredUnits, mapsEnabled, mapError, activeTab]);

    // REPORT GENERATION
    const handleGenerateReport = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const periodLabel = reportConfig.period === 'CURRENT_MONTH' ? 'Mês Atual' : reportConfig.period === 'LAST_6_MONTHS' ? 'Últimos 6 Meses' : 'Ano Corrente';

            if (reportConfig.format === 'PDF') {
                const doc = new jsPDF();
                
                // Header
                doc.setFillColor(79, 70, 229); // Indigo
                doc.rect(0, 0, 210, 20, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.text(systemInfo?.name || MOCK_SYSTEM_INFO.name, 10, 13);
                
                // Title
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(18);
                doc.text('Relatório Demográfico Detalhado', 10, 40);
                
                doc.setFontSize(10);
                doc.text(`Gerado em: ${new Date().toLocaleString()}`, 10, 50);
                doc.text(`Período de Referência: ${periodLabel}`, 10, 55);
                
                // Filters Applied
                doc.setDrawColor(200, 200, 200);
                doc.line(10, 60, 200, 60);
                doc.text('Filtros Aplicados:', 10, 70);
                doc.setFontSize(9);
                doc.text(`- Faixa Etária: ${ageFilter}`, 15, 76);
                doc.text(`- Renda: ${incomeFilter}`, 15, 81);
                doc.text(`- Infraestrutura: ${infraFilter}`, 15, 86);
                if (addressSearch) doc.text(`- Busca: "${addressSearch}"`, 15, 91);
                if (cepSearch) doc.text(`- CEP: "${cepSearch}"`, 15, 96);

                // Stats
                const statsY = 110;
                doc.setFontSize(12);
                doc.text('Resumo Estatístico:', 10, statsY);
                doc.setFontSize(10);
                doc.text(`Total de Unidades Listadas: ${totalUnits}`, 10, statsY + 10);
                doc.text(`População Estimada: ${calculatedPopulation}`, 10, statsY + 16);
                doc.text(`Taxa de Vulnerabilidade: ${vulnerabilityPercentage}%`, 10, statsY + 22);

                // List
                doc.text('Detalhamento das Unidades:', 10, statsY + 40);
                let yPos = statsY + 50;
                
                // Header of list
                doc.setFillColor(240, 240, 240);
                doc.rect(10, yPos - 5, 190, 8, 'F');
                doc.setFont(undefined, 'bold');
                doc.text('Unidade', 12, yPos);
                doc.text('Morador', 40, yPos);
                doc.text('Situação', 120, yPos);
                doc.text('CEP', 160, yPos);
                doc.setFont(undefined, 'normal');
                
                yPos += 10;

                filteredUnits.slice(0, 20).forEach((u) => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.text(`${u.block}-${u.number}`, 12, yPos);
                    doc.text(u.residentName.substring(0, 35), 40, yPos);
                    
                    const status = u.vulnerabilityLevel === 'HIGH' ? 'Vulnerável' : u.vulnerabilityLevel === 'MEDIUM' ? 'Atenção' : 'Regular';
                    doc.text(status, 120, yPos);
                    
                    doc.text(u.cep || '-', 160, yPos);
                    yPos += 8;
                });
                
                if(filteredUnits.length > 20) {
                    doc.setFont(undefined, 'italic');
                    doc.text(`... e mais ${filteredUnits.length - 20} unidades não listadas nesta página.`, 10, yPos + 5);
                }

                doc.save('relatorio-demografico-detalhado.pdf');

            } else {
                // CSV Export with BOM for Excel compatibility
                const headers = ["ID", "Bloco", "Unidade", "Morador", "Vulnerabilidade", "Marcadores", "Latitude", "Longitude", "CEP", "Periodo"];
                const rows = filteredUnits.map(u => [
                    u.id,
                    u.block,
                    u.number,
                    u.residentName,
                    u.vulnerabilityLevel || 'N/A',
                    u.tags.join('; '),
                    u.coordinates.lat,
                    u.coordinates.lng,
                    u.cep || '',
                    periodLabel
                ]);

                // Create CSV content
                const csvContent = [
                    headers.join(","),
                    ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
                ].join("\n");

                // Add BOM for proper UTF-8 handling in Excel
                const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `dados_demograficos_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            setIsGenerating(false);
            setIsReportModalOpen(false);
        }, 1500);
    };

    // RECÁLCULO DE ESTATÍSTICAS BASEADO NOS FILTROS
    const totalUnits = filteredUnits.length;
    const calculatedPopulation = totalUnits * 3; 
    
    const vulnerableUnitsCount = filteredUnits.filter(u => u.vulnerabilityLevel === 'HIGH' || u.vulnerabilityLevel === 'MEDIUM').length;
    const vulnerabilityPercentage = totalUnits > 0 ? ((vulnerableUnitsCount / totalUnits) * 100).toFixed(1) : '0.0';

    let currentAvgIncome = MOCK_DEMOGRAPHICS.averageIncome;
    if (incomeFilter === 'LOW') currentAvgIncome = 1320.00;
    if (incomeFilter === 'MEDIUM_HIGH') currentAvgIncome = 4500.00;
    if (filteredUnits.length === 0) currentAvgIncome = 0;

    const multiplier = totalUnits > 0 ? totalUnits / MOCK_UNITS.length : 0;
    
    const infraData = [
        { name: 'Saneamento', value: Math.ceil(MOCK_DEMOGRAPHICS.infrastructureNeeds.sanitation * multiplier) },
        { name: 'Água', value: Math.ceil(MOCK_DEMOGRAPHICS.infrastructureNeeds.water * multiplier) },
        { name: 'Iluminação', value: Math.ceil(MOCK_DEMOGRAPHICS.infrastructureNeeds.lighting * multiplier) },
        { name: 'Coleta de Lixo', value: Math.ceil(MOCK_DEMOGRAPHICS.infrastructureNeeds.trashCollection * multiplier) },
    ];

    const ageData = [
        { name: 'Crianças (0-14)', value: MOCK_DEMOGRAPHICS.ageDistribution.children, color: '#3b82f6' },
        { name: 'Adultos (15-64)', value: MOCK_DEMOGRAPHICS.ageDistribution.adults, color: '#10b981' },
        { name: 'Idosos (65+)', value: MOCK_DEMOGRAPHICS.ageDistribution.seniors, color: '#f59e0b' },
    ];

    const resetFilters = () => {
        setAgeFilter('ALL');
        setIncomeFilter('ALL');
        setInfraFilter('ALL');
        setAddressSearch('');
        setCepSearch('');
    };

    const KPI = ({ title, value, subtext, icon: Icon, color, bg }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <div className={`p-2 rounded-lg w-fit mb-4 ${bg}`}>
                        <Icon size={24} className={color} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
                </div>
                {subtext && <span className={`text-xs font-bold px-2 py-1 rounded-full ${title.includes('Desemprego') || title.includes('Vulnerabilidade') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{subtext}</span>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Análise Demográfica</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Indicadores sociais, densidade populacional e infraestrutura.</p>
                </div>
                <div className="flex gap-3">
                     <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                        <button 
                            onClick={() => setActiveTab('DASHBOARD')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <LayoutDashboard size={16}/> Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('MAP')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'MAP' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <MapIcon size={16}/> Mapa Geográfico
                        </button>
                     </div>
                     <button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
                     >
                         <FileText size={18} className="text-white"/> Gerar Relatório Detalhado
                     </button>
                </div>
            </div>

            {/* TAB CONTENT: MAP */}
            {activeTab === 'MAP' && (
                <div className="flex-1 min-h-[600px] animate-fade-in">
                    <SmartMap systemInfo={systemInfo} units={filteredUnits} />
                </div>
            )}

            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === 'DASHBOARD' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Painel de Filtros e Legenda */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-indigo-600"/>
                                <h3 className="font-bold text-slate-800 text-sm">Filtros de Análise</h3>
                                <span className="text-xs text-slate-400 ml-2 border-l border-slate-300 pl-2">{filteredUnits.length} unidades na seleção</span>
                            </div>
                            <button 
                                onClick={() => setShowLegend(!showLegend)} 
                                className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${showLegend ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600'}`}
                            >
                                <Info size={14}/> {showLegend ? 'Ocultar Legenda' : 'Ver Legenda'}
                            </button>
                        </div>

                        <div className="p-5">
                            {/* LEGENDA EXPANSÍVEL */}
                            {showLegend && (
                                <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                                    <div>
                                        <strong className="block text-indigo-700 mb-1">Filtro de Renda:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><span className="font-bold">Baixa Renda:</span> Famílias com renda &lt; 1 Salário Mínimo ou vulnerabilidade ALTA.</li>
                                            <li><span className="font-bold">Média/Alta:</span> Renda superior a 3 SM ou sem tag de vulnerabilidade.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong className="block text-indigo-700 mb-1">Filtro de Faixa Etária:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><span className="font-bold">Idosos (65+):</span> Unidades com residentes > 65 anos ou tag "Idoso Sozinho".</li>
                                            <li><span className="font-bold">Crianças:</span> Famílias cadastradas com dependentes &lt; 14 anos.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong className="block text-indigo-700 mb-1">Infraestrutura:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><span className="font-bold">Crítica:</span> Locais com ausência total de saneamento ou luz.</li>
                                            <li><span className="font-bold">Atenção:</span> Interrupções frequentes ou serviços parciais.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Buscar Localidade</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Bloco, Unidade..." 
                                            value={addressSearch} 
                                            onChange={(e) => setAddressSearch(e.target.value)} 
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Buscar CEP</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="00000-000" 
                                            value={cepSearch} 
                                            onChange={(e) => setCepSearch(e.target.value)} 
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Faixa Etária</label>
                                    <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                        <option value="ALL">Todas as Faixas</option>
                                        <option value="CHILDREN">Crianças (0-14)</option>
                                        <option value="ADULTS">Adultos (15-64)</option>
                                        <option value="SENIORS">Idosos (65+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nível de Renda</label>
                                    <select value={incomeFilter} onChange={(e) => setIncomeFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                        <option value="ALL">Todos os Níveis</option>
                                        <option value="LOW">Baixa Renda / Vulnerável</option>
                                        <option value="MEDIUM_HIGH">Média / Alta Renda</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Infraestrutura</label>
                                    <select value={infraFilter} onChange={(e) => setInfraFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                        <option value="ALL">Geral</option>
                                        <option value="WARNING">Atenção Necessária</option>
                                        <option value="CRITICAL">Crítica (Falta Serviços)</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button onClick={resetFilters} className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200">
                                        <RefreshCw size={16}/> Limpar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Heatmap / Density Map (Small Preview) */}
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 h-64 relative group overflow-hidden">
                        {mapsEnabled && !mapError ? (
                            <>
                                <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0"></div>
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2 z-[400]">
                                    <MapIcon size={14} className="text-indigo-600"/> Densidade (Prévia)
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                                <MapPinOff size={48} className="mb-2 opacity-50"/>
                                <p className="font-medium">Visualização de Mapa Desativada</p>
                            </div>
                        )}
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <KPI 
                            title="População (Filtro)" 
                            value={calculatedPopulation}
                            subtext="estimado"
                            icon={Users}
                            color="text-indigo-600"
                            bg="bg-indigo-50"
                        />
                        <KPI 
                            title="Vulnerabilidade Social" 
                            value={`${vulnerabilityPercentage}%`}
                            subtext={`${vulnerableUnitsCount} famílias`}
                            icon={HeartHandshake}
                            color="text-rose-600"
                            bg="bg-rose-50"
                        />
                        <KPI 
                            title="Idade Média" 
                            value={`${MOCK_DEMOGRAPHICS.averageAge} anos`}
                            icon={Calendar}
                            color="text-purple-600"
                            bg="bg-purple-50"
                        />
                        <KPI 
                            title="Renda Média (Filtro)" 
                            value={`R$ ${currentAvgIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            icon={DollarSign}
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                        />
                        <KPI 
                            title="Taxa de Desemprego" 
                            value={`${MOCK_DEMOGRAPHICS.unemploymentRate}%`}
                            subtext="Alta prioridade"
                            icon={Briefcase}
                            color="text-amber-600"
                            bg="bg-amber-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Infrastructure Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <AlertTriangle className="text-rose-500" size={20}/> Infraestrutura Faltante (Projeção)
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={infraData} layout="horizontal" margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex gap-4 justify-center text-xs text-slate-500">
                                <div className="flex items-center gap-1"><Droplets size={12}/> Saneamento</div>
                                <div className="flex items-center gap-1"><Droplets size={12}/> Água</div>
                                <div className="flex items-center gap-1"><Lightbulb size={12}/> Iluminação</div>
                                <div className="flex items-center gap-1"><Trash2 size={12}/> Coleta</div>
                            </div>
                        </div>

                        {/* Age Distribution Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição Etária (Geral)</h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-64">
                                <div className="w-48 h-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={ageData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {ageData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {ageData.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-medium text-slate-600">{item.name}</span>
                                            <span className="text-sm font-bold text-slate-800">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REPORT MODAL */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><FileText className="text-indigo-600"/> Gerar Relatório</h3>
                            <button onClick={() => setIsReportModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Formato do Arquivo</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setReportConfig({...reportConfig, format: 'PDF'})} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportConfig.format === 'PDF' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <FileText size={18}/> PDF (Documento)
                                    </button>
                                    <button onClick={() => setReportConfig({...reportConfig, format: 'CSV'})} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportConfig.format === 'CSV' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <Layers size={18}/> CSV (Dados Brutos)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Período de Análise</label>
                                <select value={reportConfig.period} onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                    <option value="CURRENT_MONTH">Mês Atual</option>
                                    <option value="LAST_6_MONTHS">Últimos 6 Meses</option>
                                    <option value="CURRENT_YEAR">Ano Atual</option>
                                </select>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 border border-slate-100">
                                <p className="font-bold mb-1 text-slate-700">Resumo da Exportação:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Filtros Atuais: {ageFilter === 'ALL' ? 'Todas Idades' : ageFilter}, {incomeFilter === 'ALL' ? 'Todas Rendas' : incomeFilter}</li>
                                    <li>Registros: {filteredUnits.length} unidades</li>
                                </ul>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setIsReportModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                            <button 
                                onClick={handleGenerateReport} 
                                disabled={isGenerating}
                                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16}/>}
                                {isGenerating ? 'Gerando...' : 'Baixar Arquivo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemographicAnalysis;
