import React, { useState, useEffect } from 'react';
import { financialService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Users, Calendar, UserPlus, FileText, Send, Loader2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadStats = async () => {
          try {
              const res = await financialService.getDashboardStats();
              setStats(res.data);
          } catch (error) {
              console.error(error);
          } finally {
              setLoading(false);
          }
      };
      loadStats();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600"/></div>;

  const balance = stats?.balance || 0;
  
  const StatCard = ({ title, value, trend, icon: Icon, colorClass, borderClass }: any) => (
      <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 ${borderClass} hover:shadow-md transition-shadow`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
              <h3 className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('900', '100')} ${colorClass}`}>
              <Icon size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium">{trend}</p>
      </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            title="Saldo Atual" 
            value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend="Atualizado agora"
            icon={balance >= 0 ? ArrowUpRight : ArrowDownRight}
            colorClass={balance >= 0 ? "text-emerald-600" : "text-rose-600"}
            borderClass="border-b-4 border-b-emerald-500"
        />
        <StatCard 
            title="Ocorrências" 
            value={stats?.openIncidents || 0}
            trend="Em aberto"
            icon={AlertTriangle}
            colorClass="text-amber-500"
            borderClass="border-b-4 border-b-amber-500"
        />
        <StatCard 
            title="Ocupação" 
            value={`${stats?.occupancyRate || 0}%`}
            trend="Estável"
            icon={Users}
            colorClass="text-indigo-600"
            borderClass="border-b-4 border-b-indigo-500"
        />
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => onNavigate('users')} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-left">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><UserPlus size={24} /></div>
              <div className="ml-4"><h4 className="font-bold text-slate-800">Novo Morador</h4></div>
          </button>
          <button onClick={() => onNavigate('finance')} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-left">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><FileText size={24} /></div>
              <div className="ml-4"><h4 className="font-bold text-slate-800">Relatórios</h4></div>
          </button>
          <button onClick={() => onNavigate('social')} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-left">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors"><Send size={24} /></div>
              <div className="ml-4"><h4 className="font-bold text-slate-800">Comunicar</h4></div>
          </button>
      </div>
    </div>
  );
};

export default Dashboard;