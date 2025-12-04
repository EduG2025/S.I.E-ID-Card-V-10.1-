import React, { useState, useEffect } from 'react';
import { AgendaEvent } from '../types';
import { agendaService } from '../services/api';
import { 
    Calendar as CalendarIcon, AlertTriangle, Users, FileText, ChevronRight, X, Bell,
    ChevronLeft, List, Plus, Clock, MapPin, Loader2
} from 'lucide-react';

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({ type: 'MEETING', status: 'UPCOMING', date: new Date().toISOString().slice(0, 16), reminder: 'NONE' });

  useEffect(() => {
      const loadEvents = async () => {
          try {
              const res = await agendaService.getAll();
              setEvents(res.data);
          } catch (error) {
              console.error(error);
          } finally {
              setLoading(false);
          }
      };
      loadEvents();
  }, []);

  const handleCreateEvent = async () => {
      if (!newEvent.title || !newEvent.date) return;
      try {
          const eventToCreate = {
              ...newEvent,
              status: 'UPCOMING',
              description: newEvent.description || '',
          };
          const res = await agendaService.create(eventToCreate);
          setEvents([...events, res.data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          setIsModalOpen(false);
          setNewEvent({ type: 'MEETING', status: 'UPCOMING', date: new Date().toISOString().slice(0, 16), reminder: 'NONE' });
      } catch (error) {
          alert('Erro ao criar evento');
      }
  };

  // ... (Helper functions: getEventIcon, getEventColor, navigateCalendar, getDaysArray, renderCalendarCell remain largely the same)
  const getEventColor = (type: AgendaEvent['type']) => {
      switch(type) {
          case 'MEETING': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
          case 'MAINTENANCE': return 'bg-amber-50 border-amber-100 text-amber-700';
          case 'DEADLINE': return 'bg-rose-50 border-rose-100 text-rose-700';
          default: return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      }
  };

  const getDaysArray = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const days = [];
      if (calendarMode === 'MONTH') {
          const firstDayOfMonth = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
          for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
      } else {
          const curr = new Date(currentDate);
          const first = curr.getDate() - curr.getDay(); 
          for (let i = 0; i < 7; i++) { const day = new Date(curr.setDate(first + i)); days.push(day); }
      }
      return days;
  };

  const renderCalendarCell = (date: Date | null) => {
      if (!date) return <div className="bg-slate-50/50 min-h-[100px] border-b border-r border-slate-100"></div>;
      const dateStr = date.toISOString().slice(0, 10);
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      return (
          <div className={`min-h-[100px] p-2 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors`}>
              <div className="flex justify-between items-start mb-2"><span className="text-sm font-bold text-slate-700">{date.getDate()}</span></div>
              <div className="space-y-1">{dayEvents.map(ev => (<div key={ev.id} className={`text-[10px] px-1.5 py-1 rounded border truncate font-bold ${getEventColor(ev.type)}`}>{ev.title}</div>))}</div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h2 className="text-2xl font-bold text-slate-800">Agenda & Timeline</h2><p className="text-sm text-slate-500 mt-1 font-medium">Calendário de eventos, manutenções e prazos.</p></div>
            <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"><Plus size={18}/> Novo Evento</button>
            </div>
        </div>

        {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline-block text-indigo-600"/></div> : (
            view === 'CALENDAR' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800 capitalize">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex gap-2"><button onClick={() => setView('LIST')} className="p-2 border rounded">Lista</button></div>
                    </div>
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (<div key={day} className="p-3 text-center text-xs font-bold text-slate-400 uppercase">{day}</div>))}</div>
                    <div className="grid grid-cols-7 bg-white">{getDaysArray().map((date, idx) => (<React.Fragment key={idx}>{renderCalendarCell(date)}</React.Fragment>))}</div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Próximos Eventos</h3><button onClick={() => setView('CALENDAR')} className="text-indigo-600 font-bold text-sm">Ver Calendário</button></div>
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className={`p-4 rounded-xl border ${getEventColor(event.type)}`}>
                                <div className="flex justify-between">
                                    <h4 className="font-bold">{event.title}</h4>
                                    <span className="text-xs font-bold opacity-70">{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm opacity-80 mt-1">{event.description}</p>
                            </div>
                        ))}
                        {events.length === 0 && <p className="text-slate-400 text-center">Nenhum evento agendado.</p>}
                    </div>
                </div>
            )
        )}

        {/* Modal Simplificado */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                    <h3 className="font-bold text-lg">Novo Evento</h3>
                    <input className="w-full p-2 border rounded" placeholder="Título" value={newEvent.title || ''} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                    <input className="w-full p-2 border rounded" type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}>
                        <option value="MEETING">Reunião</option>
                        <option value="MAINTENANCE">Manutenção</option>
                        <option value="EVENT">Evento</option>
                    </select>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                        <button onClick={handleCreateEvent} className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Timeline;
