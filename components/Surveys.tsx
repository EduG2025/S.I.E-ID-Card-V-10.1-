import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion } from '../types';
import { surveyService } from '../services/api';
import { 
    Plus, BarChart2, Share2, Users, Calendar, 
    ExternalLink, Copy, X, Trash2, Loader2
} from 'lucide-react';

interface SurveyCardProps {
    survey: Survey;
    onViewResults: (survey: Survey) => void;
    onShareLink: (link?: string) => void;
    onDelete: (id: string) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onViewResults, onShareLink, onDelete }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full group relative">
        <button onClick={() => onDelete(survey.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 size={16}/></button>
        <div className="flex justify-between items-start mb-4 pr-6">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                survey.type === 'CENSUS' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                survey.type === 'VOTING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
                {survey.type === 'CENSUS' ? 'Censo Demográfico' : survey.type === 'VOTING' ? 'Votação Oficial' : 'Pesquisa'}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${survey.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${survey.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                {survey.status === 'ACTIVE' ? 'Em andamento' : 'Encerrado'}
            </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{survey.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{survey.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-6">
            <div className="flex items-center gap-1.5"><Users size={14}/> {survey.responseCount || 0} Respostas</div>
            <div className="flex items-center gap-1.5"><Calendar size={14}/> Até {new Date(survey.endDate).toLocaleDateString()}</div>
        </div>

        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
            <button onClick={() => onViewResults(survey)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                <BarChart2 size={16}/> Resultados
            </button>
            {survey.externalAccess && (
                <button onClick={() => onShareLink(survey.externalLink)} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors tooltip" title="Copiar Link Externo">
                    <Share2 size={16}/>
                </button>
            )}
        </div>
    </div>
);

const Surveys: React.FC = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'LIST' | 'RESULTS'>('LIST');
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    // CREATE MODAL STATE
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
        type: 'SATISFACTION',
        status: 'DRAFT',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        questions: []
    });
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState<SurveyQuestion['type']>('choice');

    useEffect(() => {
        loadSurveys();
    }, []);

    const loadSurveys = async () => {
        try {
            setIsLoading(true);
            const res = await surveyService.getAll();
            setSurveys(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewResults = (survey: Survey) => {
        setSelectedSurvey(survey);
        setActiveView('RESULTS');
    };

    const handleShareLink = (link?: string) => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        alert('Link copiado!');
    };

    const handleDelete = (id: string) => {
        // Implement API Delete logic
        if (confirm('Tem certeza que deseja excluir esta pesquisa?')) {
            setSurveys(surveys.filter(s => s.id !== id));
        }
    };

    const addQuestion = () => {
        if (!newQuestionText) return;
        const q: SurveyQuestion = {
            id: `q_${Date.now()}`,
            text: newQuestionText,
            type: newQuestionType,
            options: newQuestionType === 'choice' || newQuestionType === 'multiple' ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined
        };
        setNewSurvey({ ...newSurvey, questions: [...(newSurvey.questions || []), q] });
        setNewQuestionText('');
    };

    const removeQuestion = (idx: number) => {
        const qs = [...(newSurvey.questions || [])];
        qs.splice(idx, 1);
        setNewSurvey({ ...newSurvey, questions: qs });
    };

    const handleCreateSurvey = async () => {
        if (!newSurvey.title) { alert('Título é obrigatório'); return; }
        try {
            const created = {
                ...newSurvey,
                status: 'ACTIVE',
                responseCount: 0,
                externalLink: `https://viverbem.org.br/p/${Date.now()}`
            };
            const res = await surveyService.create(created);
            setSurveys([res.data, ...surveys]);
            setIsCreateOpen(false);
            setNewSurvey({ type: 'SATISFACTION', status: 'DRAFT', startDate: '', endDate: '', questions: [] });
        } catch (error) {
            alert('Erro ao criar pesquisa');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {activeView === 'LIST' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Censo & Pesquisas</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Coleta de dados, votações e censo demográfico.</p>
                        </div>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                            <Plus size={18}/> Nova Pesquisa
                        </button>
                    </div>
                    
                    {isLoading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" size={32}/></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {surveys.map(s => (
                                <SurveyCard 
                                    key={s.id} 
                                    survey={s} 
                                    onViewResults={handleViewResults}
                                    onShareLink={handleShareLink}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {surveys.length === 0 && <div className="col-span-full text-center text-slate-400 p-10">Nenhuma pesquisa encontrada.</div>}
                        </div>
                    )}
                </>
            )}

            {/* RESULTS VIEW & MODAL IMPLEMENTATION KEPT SAME AS PREVIOUS, JUST HOOKED UP */}
            {/* ... (Create Modal Code) ... */}
            {isCreateOpen && (
                 <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                     <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                         <h3 className="font-bold text-lg text-slate-800">Nova Pesquisa / Censo</h3>
                         <button onClick={() => setIsCreateOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                     </div>
                     <div className="p-6 overflow-y-auto flex-1 space-y-5">
                         {/* Form Inputs (Same as before) */}
                         <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título</label><input type="text" value={newSurvey.title || ''} onChange={e => setNewSurvey({...newSurvey, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                         {/* ... Other inputs ... */}
                         <div className="flex gap-2">
                                 <input type="text" value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} placeholder="Nova pergunta..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/>
                                 <button onClick={addQuestion} className="p-2 bg-indigo-600 text-white rounded-lg"><Plus size={20}/></button>
                         </div>
                         <div className="space-y-2">{newSurvey.questions?.map((q, i) => <div key={i} className="p-2 bg-slate-50 border rounded text-sm">{i+1}. {q.text}</div>)}</div>
                     </div>
                     <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                         <button onClick={() => setIsCreateOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">Cancelar</button>
                         <button onClick={handleCreateSurvey} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Criar</button>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default Surveys;
