import React, { useState } from 'react';
import { User, SocialQuestionnaireData } from '../types';
import { 
    Home, Users, DollarSign, Activity, Briefcase, ChevronRight, ChevronLeft, 
    Save, CheckCircle, AlertTriangle, Droplets, Lightbulb, GraduationCap 
} from 'lucide-react';

interface SocialQuestionnaireProps {
    user: User;
    onSave: (data: SocialQuestionnaireData) => void;
    onCancel: () => void;
}

const SocialQuestionnaire: React.FC<SocialQuestionnaireProps> = ({ user, onSave, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<SocialQuestionnaireData>(user.socialData || {});

    const updateField = (field: keyof SocialQuestionnaireData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSave = () => {
        onSave(formData);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Home className="text-indigo-600" size={20} /> 1. Identificação do Domicílio
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Residência</label>
                    <select value={formData.residenceType || ''} onChange={(e) => updateField('residenceType', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Selecione...</option>
                        <option value="Casa">Casa</option>
                        <option value="Sobrado">Sobrado</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Barraco">Barraco</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Situação do Imóvel</label>
                    <select value={formData.residenceOwnership || ''} onChange={(e) => updateField('residenceOwnership', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Selecione...</option>
                        <option value="Próprio">Próprio</option>
                        <option value="Alugado">Alugado</option>
                        <option value="Cedido">Cedido</option>
                        <option value="Ocupação">Ocupação</option>
                    </select>
                </div>
            </div>

            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100 mt-6">
                <Users className="text-indigo-600" size={20} /> Composição Familiar
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Total Moradores</label><input type="number" value={formData.residentsCount || ''} onChange={(e) => updateField('residentsCount', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Crianças (0-12)</label><input type="number" value={formData.childrenCount || 0} onChange={(e) => updateField('childrenCount', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Adultos (18-59)</label><input type="number" value={formData.adultCount || 0} onChange={(e) => updateField('adultCount', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Idosos (60+)</label><input type="number" value={formData.seniorCount || 0} onChange={(e) => updateField('seniorCount', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.hasDisabledPerson || false} onChange={(e) => updateField('hasDisabledPerson', e.target.checked)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"/>
                    <span className="text-sm font-bold text-indigo-900">Possui pessoa com deficiência no domicílio?</span>
                </label>
                {formData.hasDisabledPerson && (
                    <input type="text" placeholder="Descreva o tipo de deficiência..." value={formData.disabledPersonDetail || ''} onChange={(e) => updateField('disabledPersonDetail', e.target.value)} className="mt-3 w-full p-2 border border-indigo-200 rounded-lg bg-white text-sm" />
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="text-emerald-600" size={20} /> 2. Situação Econômica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Faixa de Renda Mensal (Familiar)</label>
                    <select value={formData.incomeRange || ''} onChange={(e) => updateField('incomeRange', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">Selecione...</option>
                        <option value="0-600">Até R$ 600,00</option>
                        <option value="601-1200">R$ 601 a R$ 1.200</option>
                        <option value="1201-2500">R$ 1.201 a R$ 2.500</option>
                        <option value="2501-5000">R$ 2.501 a R$ 5.000</option>
                        <option value="5001+">Acima de R$ 5.000</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fonte Principal de Renda</label>
                    <select value={formData.incomeSource || ''} onChange={(e) => updateField('incomeSource', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">Selecione...</option>
                        <option value="Formal">Emprego Formal (CLT)</option>
                        <option value="Informal">Trabalho Informal</option>
                        <option value="Autônomo">Autônomo / MEI</option>
                        <option value="Benefícios">Benefícios Sociais / Aposentadoria</option>
                        <option value="Sem rendimento">Sem rendimento</option>
                    </select>
                </div>
            </div>
            
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100 mt-6">
                <Droplets className="text-blue-500" size={20} /> Infraestrutura & Serviços
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Abastecimento de Água</span>
                    <select value={formData.waterSupply || ''} onChange={(e) => updateField('waterSupply', e.target.value)} className="p-1 text-sm bg-white border rounded">
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Irregular</option>
                        <option value="Ausente">Ausente</option>
                    </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Esgotamento Sanitário</span>
                    <select value={formData.sewage || ''} onChange={(e) => updateField('sewage', e.target.value)} className="p-1 text-sm bg-white border rounded">
                        <option value="Rede Básica">Rede Pública</option>
                        <option value="Fossa">Fossa</option>
                        <option value="Céu Aberto">Céu Aberto</option>
                    </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Energia Elétrica</span>
                    <select value={formData.electricity || ''} onChange={(e) => updateField('electricity', e.target.value)} className="p-1 text-sm bg-white border rounded">
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Gato / Irregular</option>
                        <option value="Ausente">Ausente</option>
                    </select>
                </div>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                    <input type="checkbox" checked={formData.trashCollection || false} onChange={(e) => updateField('trashCollection', e.target.checked)} className="w-5 h-5 text-indigo-600 rounded"/>
                    <span className="text-sm font-medium text-slate-700">Coleta de Lixo Regular</span>
                </label>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="text-purple-600" size={20} /> 3. Individual & Saúde
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Escolaridade</label>
                    <select value={formData.educationLevel || ''} onChange={(e) => updateField('educationLevel', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Selecione...</option>
                        <option value="Sem escolaridade">Sem escolaridade</option>
                        <option value="Fundamental">Ensino Fundamental</option>
                        <option value="Médio">Ensino Médio</option>
                        <option value="Técnico">Ensino Técnico</option>
                        <option value="Superior">Ensino Superior</option>
                        <option value="Pós">Pós-graduação</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Situação de Trabalho</label>
                    <select value={formData.workStatus || ''} onChange={(e) => updateField('workStatus', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Selecione...</option>
                        <option value="Formal">Empregado Formal</option>
                        <option value="Informal">Trabalho Informal</option>
                        <option value="Autônomo">Autônomo</option>
                        <option value="Desempregado">Desempregado</option>
                        <option value="Aposentado">Aposentado/Afastado</option>
                    </select>
                </div>
            </div>

            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100 mt-6">
                <Activity className="text-rose-500" size={20} /> Saúde
            </h4>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Doenças Crônicas</label>
                    <input type="text" placeholder="Diabetes, Hipertensão, etc." value={formData.chronicDisease || ''} onChange={(e) => updateField('chronicDisease', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <label className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 cursor-pointer">
                    <input type="checkbox" checked={formData.continuousMedication || false} onChange={(e) => updateField('continuousMedication', e.target.checked)} className="w-5 h-5 text-rose-600 rounded"/>
                    <span className="text-sm font-medium text-rose-800">Faz uso de medicação contínua ou controlada?</span>
                </label>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Briefcase className="text-amber-600" size={20} /> 4. Comércio Local (Opcional)
            </h4>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isMerchant || false} onChange={(e) => updateField('isMerchant', e.target.checked)} className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"/>
                    <span className="text-lg font-bold text-amber-900">Este cadastro é de um Comerciante / Negócio Local?</span>
                </label>
            </div>

            {formData.isMerchant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nome Fantasia do Negócio</label>
                        <input type="text" value={formData.businessName || ''} onChange={(e) => updateField('businessName', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Atividade</label>
                        <input type="text" placeholder="Ex: Mercearia, Salão..." value={formData.businessType || ''} onChange={(e) => updateField('businessType', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Faturamento Mensal Estimado</label>
                        <select value={formData.businessRevenue || ''} onChange={(e) => updateField('businessRevenue', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="">Selecione...</option>
                            <option value="< 2k">Até R$ 2.000</option>
                            <option value="2k-5k">R$ 2.000 a R$ 5.000</option>
                            <option value="5k-10k">R$ 5.000 a R$ 10.000</option>
                            <option value="10k-50k">R$ 10.000 a R$ 50.000</option>
                            <option value="50k+">Acima de R$ 50.000</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer md:col-span-2">
                        <input type="checkbox" checked={formData.hasLicense || false} onChange={(e) => updateField('hasLicense', e.target.checked)} className="w-5 h-5 text-amber-600 rounded"/>
                        <span className="text-sm font-medium text-slate-700">Possui Alvará de Funcionamento?</span>
                    </label>
                </div>
            )}
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fade-in">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="text-rose-600" size={20} /> 5. Indicadores Sociais e Necessidades
            </h4>
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
                <p className="text-sm text-rose-800 font-medium mb-4">Estas informações são confidenciais e usadas para mapeamento de vulnerabilidade.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-rose-700 uppercase mb-2 block">A família possui alguma necessidade URGENTE?</label>
                        <select value={formData.urgentNeed || 'Nenhuma'} onChange={(e) => updateField('urgentNeed', e.target.value)} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500">
                            <option value="Nenhuma">Nenhuma</option>
                            <option value="Alimento">Alimentação (Cesta Básica)</option>
                            <option value="Saúde">Saúde / Medicamentos</option>
                            <option value="Habitação">Risco na Habitação</option>
                            <option value="Emprego">Emprego Imediato</option>
                        </select>
                    </div>
                    
                    <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-rose-200 cursor-pointer">
                        <input type="checkbox" checked={formData.socialRisk || false} onChange={(e) => updateField('socialRisk', e.target.checked)} className="mt-1 w-5 h-5 text-rose-600 rounded focus:ring-rose-500"/>
                        <div>
                            <span className="block text-sm font-bold text-rose-900">Situação de Risco Social</span>
                            <span className="text-xs text-rose-600">Marque se houver histórico de violência, abandono ou drogadição.</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Crianças fora da escola</label><input type="number" value={formData.childrenOutOfSchool || 0} onChange={(e) => updateField('childrenOutOfSchool', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Desempregados na casa</label><input type="number" value={formData.unemployedCount || 0} onChange={(e) => updateField('unemployedCount', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Idosos morando sozinhos</label><input type="number" value={formData.seniorsAlone || 0} onChange={(e) => updateField('seniorsAlone', Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" /></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Progress Bar */}
            <div className="px-8 pt-6 pb-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Etapa {step} de 5</span>
                    <span>{Math.round((step / 5) * 100)}% Concluído</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300 ease-out" style={{ width: `${(step / 5) * 100}%` }}></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50">
                {step > 1 ? (
                    <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-white transition-colors">
                        <ChevronLeft size={18}/> Anterior
                    </button>
                ) : (
                    <button onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:text-rose-600 transition-colors">
                        Cancelar
                    </button>
                )}

                {step < 5 ? (
                    <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                        Próximo <ChevronRight size={18}/>
                    </button>
                ) : (
                    <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                        <CheckCircle size={18}/> Salvar Ficha Completa
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialQuestionnaire;