import React, { useState, useEffect } from 'react';
import { Alert, Notice, Poll } from '../types';
import { communicationService } from '../services/api';
import { 
    FileText, MessageSquare, PieChart, Download, Clock, Send, 
    Bell, Users, Smartphone, Mail, AlertTriangle, CheckCircle, 
    History, Megaphone, Trash2, Plus, Info, Check, X, Loader2
} from 'lucide-react';

interface CommunicationProps {
    alerts?: Alert[];
}

const Communication: React.FC<CommunicationProps> = () => {
  const [activeTab, setActiveTab] = useState<'BOARD' | 'ALERTS' | 'POLLS'>('BOARD');
  
  // REAL DATA STATES
  const [notices, setNotices] = useState<Notice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE: POLLS (Still Mocked as Survey component handles real surveys now, keeping for UI demo)
  const [polls, setPolls] = useState<Poll[]>([]);

  // UI STATES
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({ urgency: 'LOW', title: '', content: '' });
  
  // ALERT WIZARD STATES
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<Alert['type']>('INFO');
  const [alertTarget, setAlertTarget] = useState<Alert['target']>('ALL');
  const [selectedChannels, setSelectedChannels] = useState<Alert['channels']>(['APP']);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
      try {
          setIsLoading(true);
          const [noticesRes, alertsRes] = await Promise.all([
              communicationService.getNotices(),
              communicationService.getAlerts()
          ]);
          setNotices(noticesRes.data);
          setAlerts(alertsRes.data);
      } catch (error) {
          console.error("Error loading communication data", error);
      } finally {
          setIsLoading(false);
      }
  };

  const toggleChannel = (channel: 'APP' | 'EMAIL' | 'WHATSAPP') => {
      if (selectedChannels.includes(channel)) {
          setSelectedChannels(selectedChannels.filter(c => c !== channel));
      } else {
          setSelectedChannels([...selectedChannels, channel]);
      }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      
      try {
          const newAlert = {
              title: alertTitle,
              message: alertMsg,
              type: alertType,
              target: alertTarget,
              channels: selectedChannels
          };
          const res = await communicationService.sendAlert(newAlert);
          setAlerts([res.data, ...alerts]);
          
          setSendSuccess(true);
          setTimeout(() => {
              setSendSuccess(false);
              setAlertTitle('');
              setAlertMsg('');
              setAlertType('INFO');
          }, 3000);
      } catch (error) {
          alert('Erro ao enviar alerta');
      } finally {
          setIsSending(false);
      }
  };

  const handleCreateNotice = async () => {
      if (!newNotice.title || !newNotice.content) return;
      try {
          const res = await communicationService.sendNotice(newNotice); // Assuming api.ts has sendNotice which points to POST /notices
          setNotices([res.data, ...notices]);
          setIsNoticeModalOpen(false);
          setNewNotice({ urgency: 'LOW', title: '', content: '' });
      } catch (error) {
          alert('Erro ao publicar aviso');
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 w-fit">
            {[
                { id: 'BOARD', label: 'Mural Digital', icon: MessageSquare },
                { id: 'ALERTS', label: 'Central de Disparos', icon: Megaphone },
                { id: 'POLLS', label: 'Votações', icon: PieChart }
            ].map(tab => (
                <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
                >
                <tab.icon size={18}/> {tab.label}
                </button>
            ))}
        </div>

      {isLoading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline-block text-indigo-600"/></div> : (
        <>
          {activeTab === 'BOARD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" /> Comunicados Fixados
                        </h2>
                        <button onClick={() => setIsNoticeModalOpen(true)} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1">
                            <Plus size={16} /> Novo Aviso
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {notices.map(notice => (
                        <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-all">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            notice.urgency === 'HIGH' ? 'bg-rose-500' : 
                            notice.urgency === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500'
                            }`} />
                            <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">{notice.title}</h3>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
                                <Clock size={12} />
                                {new Date(notice.date).toLocaleDateString('pt-BR')}
                            </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{notice.content}</p>
                        </div>
                        ))}
                        {notices.length === 0 && <p className="text-slate-400 text-center py-4">Nenhum aviso no mural.</p>}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'ALERTS' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
                  <div className="xl:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                               <Send className="text-indigo-600" size={20}/> Criar Novo Alerta
                           </h3>
                           
                           {sendSuccess ? (
                               <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-fade-in">
                                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32}/></div>
                                   <h4 className="text-xl font-bold text-emerald-800">Alerta Enviado!</h4>
                               </div>
                           ) : (
                               <form onSubmit={handleSendAlert} className="space-y-6">
                                   {/* Form Fields as previously defined but connected to state */}
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <input type="text" required value={alertTitle} onChange={e => setAlertTitle(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" placeholder="Título"/>
                                       <select value={alertType} onChange={e => setAlertType(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50">
                                           <option value="INFO">Informativo</option>
                                           <option value="WARNING">Aviso</option>
                                           <option value="EMERGENCY">Emergência</option>
                                       </select>
                                   </div>
                                   <textarea required rows={4} value={alertMsg} onChange={e => setAlertMsg(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" placeholder="Mensagem..."></textarea>
                                   <button disabled={isSending} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">{isSending ? 'Enviando...' : 'Disparar'}</button>
                               </form>
                           )}
                      </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico</h3>
                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                          {alerts.map(alert => (
                              <div key={alert.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                  <h4 className="font-bold text-slate-800 text-sm">{alert.title}</h4>
                                  <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}
        </>
      )}

      {/* NEW NOTICE MODAL */}
      {isNoticeModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">Novo Comunicado</h3>
                      <button onClick={() => setIsNoticeModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <input type="text" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Título"/>
                      <textarea rows={4} value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Conteúdo"></textarea>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setIsNoticeModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold border rounded-xl">Cancelar</button>
                      <button onClick={handleCreateNotice} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">Publicar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Communication;