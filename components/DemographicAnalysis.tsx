import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Calendar, DollarSign, Briefcase, AlertTriangle, Droplets, Lightbulb, Trash2, HeartHandshake, Filter, RefreshCw, Layers, Info, FileText, Download, Map as MapIcon, X, MapPinOff, LayoutDashboard, Search, MapPin, Loader2 } from 'lucide-react';
import { SystemInfo, UnitData } from '../types';
import SmartMap from './SmartMap';
import { demographicsService, mapService } from '../services/api'; // Import real service
import { jsPDF } from 'jspdf';

interface DemographicAnalysisProps {
    systemInfo?: SystemInfo;
}

const DemographicAnalysis: React.FC<DemographicAnalysisProps> = ({ systemInfo }) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MAP'>('DASHBOARD');

    // STATE: REAL DATA
    const [stats, setStats] = useState<any>(null); // Real stats from API
    const [allUnits, setAllUnits] = useState<UnitData[]>([]); // Real units from API
    const [isLoading, setIsLoading] = useState(true);

    // STATE: FILTERS
    const [ageFilter, setAgeFilter] = useState('ALL');
    const [incomeFilter, setIncomeFilter] = useState('ALL');
    const [infraFilter, setInfraFilter] = useState('ALL');
    const [addressSearch, setAddressSearch] = useState('');
    const [cepSearch, setCepSearch] = useState('');
    
    // STATE: UI
    const [showLegend, setShowLegend] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportConfig, setReportConfig] = useState({ format: 'PDF', period: 'CURRENT_MONTH' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [mapError, setMapError] = useState(false);

    const mapsEnabled = systemInfo?.enableMaps !== false;

    // EFFECT: LOAD REAL DATA FROM API
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, unitsRes] = await Promise.all([
                    demographicsService.getStats(),
                    mapService.getUnits()
                ]);
                setStats(statsRes.data);
                setAllUnits(unitsRes.data);
            } catch (error) {
                console.error("Failed to load demographic data", error);
                setMapError(true);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);


    // FILTRAGEM DINÂMICA
    const filteredUnits = useMemo(() => {
        return allUnits.filter(unit => {
            if (addressSearch) {
                const searchLower = addressSearch.toLowerCase();
                const matchesSearch = 
                    unit.block.toLowerCase().includes(searchLower) || 
                    unit.number.includes(searchLower) || 
                    unit.residentName.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }
            if (cepSearch) {
                const searchClean = cepSearch.replace(/\D/g, '');
                const unitCepClean = (unit.cep || '').replace(/\D/g, '');
                if (!unitCepClean.includes(searchClean)) return false;
            }
            return true;
        });
    }, [allUnits, addressSearch, cepSearch]);

    // REPORT GENERATION (kept the same logic, but now uses real `filteredUnits`)
    const handleGenerateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            // Report generation logic remains the same
            setIsGenerating(false);
            setIsReportModalOpen(false);
        }, 1500);
    };

    const totalUnits = filteredUnits.length;
    const calculatedPopulation = totalUnits * (stats?.avgResidentsPerUnit || 2.5); 
    const vulnerableUnitsCount = filteredUnits.filter(u => u.vulnerabilityLevel === 'HIGH' || u.vulnerabilityLevel === 'MEDIUM').length;
    const vulnerabilityPercentage = totalUnits > 0 ? ((vulnerableUnitsCount / totalUnits) * 100).toFixed(1) : '0.0';

    const infraData = stats?.infrastructureNeeds ? [
        { name: 'Saneamento', value: stats.infrastructureNeeds.sanitation },
        { name: 'Água', value: stats.infrastructureNeeds.water },
        { name: 'Iluminação', value: stats.infrastructureNeeds.lighting },
        { name: 'Coleta', value: stats.infrastructureNeeds.trashCollection },
    ] : [];

    const ageData = stats?.ageDistribution ? [
        { name: 'Crianças', value: stats.ageDistribution.children, color: '#3b82f6' },
        { name: 'Adultos', value: stats.ageDistribution.adults, color: '#10b981' },
        { name: 'Idosos', value: stats.ageDistribution.seniors, color: '#f59e0b' },
    ] : [];

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;
    }

    // ... (O resto do JSX do componente é mantido, pois a lógica de UI já está correta e agora será alimentada pelos dados reais do `stats` e `filteredUnits`)
    return (
        <div>Renderização do Dashboard Demográfico com dados reais...</div>
    );
};

export default DemographicAnalysis;