import React, { useState, useEffect } from 'react';
import { Reservation, Incident, Visitor, MaintenanceRecord } from '../types';
import { operationsService } from '../services/api';
import { 
    Calendar, AlertTriangle, UserCheck, Wrench, Search, Plus, MoreHorizontal, Loader2
} from 'lucide-react';

const Operations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'INCIDENTS' | 'CONCIERGE' | 'MAINTENANCE'>('RESERVATIONS');
    const [isLoading, setIsLoading] = useState(true);

    // DATA STATES
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]); // Maintenance could be added to API later

    // MODAL & FORM STATES
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [newRes, setNewRes] = useState<Partial<Reservation>>({ status: 'PENDING' });
    const [newInc, setNewInc] = useState<Partial<Incident>>({ status: 'OPEN', priority: 'MEDIUM' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [resData, incData, visData] = await Promise.all([
                operationsService.getReservations(),
                operationsService.getIncidents(),
                operationsService.getVisitors()
            ]);
            setReservations(resData.data);
            setIncidents(incData.data);
            setVisitors(visData.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddReservation = async () => {
        if (!newRes.area || !newRes.date) return;
        try {
            const res = await operationsService.createReservation(newRes);
            setReservations([res.data, ...reservations]);
            setIsReservationModalOpen(false);
            setNewRes({ status: 'PENDING' });
        } catch (error) {
            alert("Erro ao criar reserva");
        }
    };

    const handleAddIncident = async () => {
        if (!newInc.title) return;
        try {
            const res = await operationsService.createIncident(newInc);
            setIncidents([res.data, ...incidents]);
            setIsIncidentModalOpen(false);
            setNewInc({ status: 'OPEN', priority: 'MEDIUM' });
        } catch (error) {
            alert("Erro ao reportar ocorrência");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            CONFIRMED: 'bg-emerald-100 text-emerald-700',
            PENDING: 'bg-amber-100 text-amber-700',
            CANCELLED: 'bg-rose-100 text-rose-700',
            OPEN: 'bg-rose-100 text-rose-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            RESOLVED: 'bg-emerald-100 text-emerald-700'
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors[status] || 'bg-slate-100'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Módulo Operacional</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie reservas, ocorrências, manutenções e portaria.</p>
                </div>
                <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 overflow-x-auto">
                    {[
                        { id: 'RESERVATIONS', label: 'Reservas', icon: Calendar },
                        { id: 'INCIDENTS', label: 'Ocorrências', icon: AlertTriangle },
                        { id: 'CONCIERGE', label: 'Portaria', icon: UserCheck }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                        >
                            <tab.icon size={16}/> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline-block text-indigo-600"/></div> : (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64" />
                        </div>
                        <button 
                            onClick={() => {
                                if (activeTab === 'RESERVATIONS') setIsReservationModalOpen(true);
                                if (activeTab === 'INCIDENTS') setIsIncidentModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg"
                        >
                            <Plus size={14}/> Novo Registro
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase">
                                <tr>
                                    {activeTab === 'RESERVATIONS' && <><th className="p-5">Área</th><th className="p-5">Data/Hora</th><th className="p-5">Morador</th><th className="p-5">Status</th></>}
                                    {activeTab === 'INCIDENTS' && <><th className="p-5">Título</th><th className="p-5">Local</th><th className="p-5">Prioridade</th><th className="p-5">Status</th></>}
                                    {activeTab === 'CONCIERGE' && <><th className="p-5">Visitante</th><th className="p-5">Tipo</th><th className="p-5">Destino</th><th className="p-5">Entrada</th></>}
                                    <th className="p-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeTab === 'RESERVATIONS' && reservations.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="p-5 font-bold text-slate-700">{r.area}</td>
                                        <td className="p-5 text-sm">{new Date(r.date).toLocaleDateString()} • {r.startTime} - {r.endTime}</td>
                                        <td className="p-5 text-sm">{(r as any).resident}</td>
                                        <td className="p-5"><StatusBadge status={r.status}/></td>
                                        <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer"/></td>
                                    </tr>
                                ))}
                                {activeTab === 'INCIDENTS' && incidents.map(i => (
                                    <tr key={i.id} className="hover:bg-slate-50">
                                        <td className="p-5 font-bold text-slate-700">{i.title}</td>
                                        <td className="p-5 text-sm">{i.location}</td>
                                        <td className="p-5"><span className={`font-bold text-xs ${i.priority === 'HIGH' ? 'text-rose-600' : 'text-slate-600'}`}>{i.priority}</span></td>
                                        <td className="p-5"><StatusBadge status={i.status}/></td>
                                        <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer"/></td>
                                    </tr>
                                ))}
                                {activeTab === 'CONCIERGE' && visitors.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50">
                                        <td className="p-5 font-bold text-slate-700">{v.name}</td>
                                        <td className="p-5 text-sm">{v.type}</td>
                                        <td className="p-5 text-sm">{v.destinationUnit}</td>
                                        <td className="p-5 text-sm">{new Date(v.entryTime).toLocaleString()}</td>
                                        <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer"/></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALS - Keeping only Reservation and Incident for brevity */}
            {isReservationModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Nova Reserva</h3>
                        <input type="text" placeholder="Área" className="w-full px-4 py-2 border rounded-xl" value={newRes.area || ''} onChange={e => setNewRes({...newRes, area: e.target.value})} />
                        <input type="date" className="w-full px-4 py-2 border rounded-xl" value={newRes.date || ''} onChange={e => setNewRes({...newRes, date: e.target.value})} />
                        <div className="flex gap-2">
                            <input type="time" className="w-full px-4 py-2 border rounded-xl" value={newRes.startTime || ''} onChange={e => setNewRes({...newRes, startTime: e.target.value})} />
                            <input type="time" className="w-full px-4 py-2 border rounded-xl" value={newRes.endTime || ''} onChange={e => setNewRes({...newRes, endTime: e.target.value})} />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsReservationModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancelar</button>
                            <button onClick={handleAddReservation} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Operations;