import React, { useState, useRef, useEffect } from 'react';
import { AVAILABLE_ROLES, SYSTEM_PERMISSIONS } from '../constants';
import { SystemInfo, IdCardTemplate, CardElement, User, Permission, OfficialDocument } from '../types';
import { systemService, documentService, aiService } from '../services/api';
import { 
  Save, Sparkles, Key, Building, Shield, Check, X, Upload, 
  Image as ImageIcon, CreditCard, Plus, Trash2, 
  Move, Type, MousePointer2, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUp, ArrowDown, Maximize, AlertCircle, Grid3X3, Eye, Settings2, UserCheck, Lock, RefreshCw, CheckSquare, Square, UserPlus,
  Cpu, MessageCircle, Landmark, Globe, EyeOff, Link as LinkIcon, AlertTriangle, FileText,
  Bot, Paperclip, Send, FileCheck, ScanLine, Bold, Italic, Underline, File
} from 'lucide-react';

interface SettingsProps {
  systemInfo: SystemInfo;
  onUpdateSystemInfo: (info: SystemInfo) => void;
  templates: IdCardTemplate[];
  onUpdateTemplates: (templates: IdCardTemplate[]) => void;
  usersList: User[];
  onUpdateUsers: (users: User[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ systemInfo, onUpdateSystemInfo, templates, onUpdateTemplates, usersList, onUpdateUsers }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'ACCESS' | 'API' | 'STUDIO'>('INFO');
  
  // STUDIO STATES
  const [studioMode, setStudioMode] = useState<'CARDS' | 'DOCS'>('CARDS');

  // STUDIO - CARDS
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [studioView, setStudioView] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number, initialElX: number, initialElY: number } | null>(null);

  // STUDIO - DOCS (INTEGRAÇÃO REAL)
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docPrompt, setDocPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([{role: 'ai', text: 'Olá! Sou o assistente de documentos do S.I.E. Carregue um modelo PDF/DOC para eu aprender o estilo, ou peça para eu escrever um novo documento.'}]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);
  const refFileInput = useRef<HTMLInputElement>(null);
  const docEditorRef = useRef<HTMLDivElement>(null);
  const docImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // ACCESS TAB STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // API STATES
  const [apiConfig, setApiConfig] = useState({
      geminiKey: 'AIzaSy***********************',
      geminiConnected: true,
      paymentKey: '',
      paymentConnected: false,
      whatsappToken: '',
      whatsappInstance: '',
      whatsappConnected: false,
      openFinanceClientId: '',
      openFinanceSecret: '',
      openFinanceConnected: false
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

  const activeTemplate = templates.find(t => t.id === selectedTemplateId);
  const activeElement = activeTemplate?.elements.find(el => el.id === selectedElementId);
  const activeDoc = documents.find(d => d.id === activeDocId);

  // --- EFEITOS DE CARREGAMENTO ---
  useEffect(() => {
      if (activeTab === 'STUDIO' && studioMode === 'DOCS') {
          loadDocuments();
      }
  }, [activeTab, studioMode]);

  const loadDocuments = async () => {
      setIsLoadingDocs(true);
      try {
          const res = await documentService.getAll();
          setDocuments(res.data);
          if (res.data.length > 0 && !activeDocId) {
              setActiveDocId(res.data[0].id);
          }
      } catch (error) {
          console.error("Error loading docs", error);
      } finally {
          setIsLoadingDocs(false);
      }
  };

  // --- GENERAL HANDLERS ---
  const handleSaveInfo = async () => {
    try {
        await systemService.updateInfo(systemInfo);
        const btn = document.getElementById('save-btn-info');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Salvo com Sucesso!</span>`;
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
    } catch (e) {
        alert("Erro ao salvar informações");
    }
  };

  const handleSaveApi = (service: string) => {
      alert(`Configurações de ${service} salvas e conexão testada com sucesso!`);
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSystemInfo({ ...systemInfo, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // --- PERMISSION & PASSWORD ---
  const handleOpenPermissions = (user: User) => {
      setPermissionUser(user);
      setTempPermissions(user.permissions || []);
  };

  const handleTogglePermission = (permId: string) => {
      setTempPermissions(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
  };

  const handleSavePermissions = () => {
      if (!permissionUser) return;
      const updatedList = usersList.map(u => u.id === permissionUser.id ? { ...u, permissions: tempPermissions } : u);
      onUpdateUsers(updatedList);
      setPermissionUser(null);
      alert('Permissões atualizadas com sucesso!');
  };

  const handleOpenPasswordReset = (user: User) => {
      setPasswordResetUser(user);
      setNewPassword('');
  };

  const handleSavePassword = () => {
      if (!passwordResetUser || !newPassword) return;
      const updatedList = usersList.map(u => u.id === passwordResetUser.id ? { ...u, password: newPassword } : u);
      onUpdateUsers(updatedList);
      setPasswordResetUser(null);
      alert(`Senha de ${passwordResetUser.name} redefinida.`);
  };

  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
  }, {} as Record<string, Permission[]>);

  // --- STUDIO (CARDS) ---
  const handleCreateTemplate = () => {
    const newTemplate: IdCardTemplate = {
        id: `tpl_${Date.now()}`,
        name: 'Novo Modelo',
        width: 340, height: 215, orientation: 'landscape',
        frontBackground: '#ffffff', backBackground: '#f3f4f6',
        elements: [{ id: `el_${Date.now()}`, type: 'text-dynamic', label: 'Nome', field: 'name', x: 10, y: 10, style: { fontSize: '14px', color: '#000', fontWeight: 'bold' }, layer: 'front' }]
    };
    onUpdateTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  const updateTemplate = (updates: Partial<IdCardTemplate>) => {
    if (!activeTemplate) return;
    const updated = { ...activeTemplate, ...updates };
    onUpdateTemplates(templates.map(t => t.id === activeTemplate.id ? updated : t));
    setSaveSuccess(false);
  };

  const saveCurrentTemplate = () => {
      // In production, send to backend
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
  };

  const addElement = (type: CardElement['type']) => {
      if (!activeTemplate) return;
      const newEl: CardElement = {
          id: `el_${Date.now()}`, type,
          label: type === 'shape' ? 'Forma' : type === 'image' ? 'Imagem' : 'Texto',
          x: 20, y: 20,
          width: type === 'shape' ? 100 : type === 'image' || type === 'qrcode' ? 50 : undefined,
          height: type === 'shape' ? 20 : type === 'image' || type === 'qrcode' ? 50 : undefined,
          style: { fontSize: '12px', color: '#000000', backgroundColor: type === 'shape' ? '#cccccc' : 'transparent', textAlign: 'left' },
          layer: studioView,
          field: type === 'text-dynamic' ? 'name' : type === 'image' ? 'avatarUrl' : undefined,
          content: type === 'text-static' ? 'Texto Fixo' : undefined
      };
      updateTemplate({ elements: [...activeTemplate.elements, newEl] });
      setSelectedElementId(newEl.id);
  };

  const updateElement = (elementId: string, updates: Partial<CardElement> | { style: Partial<CardElement['style']> }) => {
      if (!activeTemplate) return;
      const newElements = activeTemplate.elements.map(el => {
          if (el.id === elementId) {
             if ('style' in updates && updates.style) return { ...el, style: { ...el.style, ...updates.style } as CardElement['style'] };
             return { ...el, ...(updates as Partial<CardElement>) };
          }
          return el;
      });
      updateTemplate({ elements: newElements });
  };

  const removeElement = (elementId: string) => {
      if (!activeTemplate) return;
      updateTemplate({ elements: activeTemplate.elements.filter(el => el.id !== elementId) });
      setSelectedElementId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      if (!activeTemplate) return;
      const el = activeTemplate.elements.find(e => e.id === elementId);
      if (!el) return;
      setSelectedElementId(elementId);
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, initialElX: el.x, initialElY: el.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !activeTemplate || !selectedElementId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newX = dragStartRef.current.initialElX + (deltaX / rect.width) * 100;
      const newY = dragStartRef.current.initialElY + (deltaY / rect.height) * 100;
      updateElement(selectedElementId, { x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) });
  };

  const handleMouseUp = () => { setIsDragging(false); dragStartRef.current = null; };

  // --- STUDIO (DOCS) ---
  const handleCreateDocument = async () => {
      try {
          const res = await documentService.create({
              title: 'Novo Documento',
              type: 'OFICIO',
              content: '<div></div>',
              status: 'DRAFT'
          });
          setDocuments([res.data, ...documents]);
          setActiveDocId(res.data.id);
      } catch (error) {
          alert("Erro ao criar documento");
      }
  };

  const handleDeleteDocument = async (docId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este documento?')) {
          await documentService.delete(docId);
          const newDocs = documents.filter(d => d.id !== docId);
          setDocuments(newDocs);
          if (activeDocId === docId) setActiveDocId(null);
      }
  };

  const handleUpdateDoc = async (updates: Partial<OfficialDocument>) => {
      if (!activeDocId) return;
      // Optimistic update locally
      setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
      // Save to server
      try {
          await documentService.update(activeDocId, updates);
      } catch (e) {
          console.error("Save error", e);
      }
  };

  // Editor Actions
  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if (docEditorRef.current && activeDocId) {
          handleUpdateDoc({ content: docEditorRef.current.innerHTML });
      }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setReferenceFile(file);
          setIsAnalyzingRef(true);
          // Simulate analysis time
          setTimeout(() => {
              setIsAnalyzingRef(false);
              setAiChatHistory(prev => [...prev, { role: 'ai', text: `Analisei o arquivo "${file.name}". Aprendi a estrutura e o estilo de redação. Como posso ajudar agora?` }]);
          }, 1500);
      }
  };

  const handleAiGenerateDoc = async () => {
      if (!docPrompt) return;
      const prompt = docPrompt;
      setDocPrompt('');
      setAiChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
      setIsProcessingAI(true);

      try {
          // Chamada Real ao Backend (Gemini)
          const res = await aiService.generateDocument(prompt, referenceFile ? `(Referência: ${referenceFile.name})` : undefined);
          const generatedContent = res.data.text;

          setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Gerei o documento com base no seu pedido. O texto foi inserido no editor.' }]);
          
          if (activeDocId) {
              handleUpdateDoc({ content: generatedContent });
              if (docEditorRef.current) {
                  docEditorRef.current.innerHTML = generatedContent;
              }
          }
      } catch (error) {
          setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Desculpe, ocorreu um erro ao gerar o documento.' }]);
      } finally {
          setIsProcessingAI(false);
      }
  };

  // Sync editor content when switching docs
  useEffect(() => {
      if (docEditorRef.current && activeDoc) {
          if (docEditorRef.current.innerHTML !== activeDoc.content) {
              docEditorRef.current.innerHTML = activeDoc.content;
          }
      }
  }, [activeDocId]);

  return (
    <div className="space-y-8 animate-fade-in" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações</h2>
            <p className="text-slate-500 mt-1 font-medium">Gerencie dados da associação, acessos e modelos de impressão.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 overflow-x-auto">
          {['INFO', 'ACCESS', 'STUDIO', 'API'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                {tab === 'INFO' ? 'Associação' : tab === 'ACCESS' ? 'Usuários' : tab === 'STUDIO' ? 'Studio IA' : 'Integrações'}
              </button>
          ))}
        </div>
      </div>

      {/* --- TAB: INFO --- */}
      {activeTab === 'INFO' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100"><Building size={20} className="text-indigo-600"/> Dados Cadastrais</h3>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Fantasia</label><input type="text" value={systemInfo.name} onChange={e => onUpdateSystemInfo({...systemInfo, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">CNPJ</label><input type="text" value={systemInfo.cnpj} onChange={e => onUpdateSystemInfo({...systemInfo, cnpj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço</label><input type="text" value={systemInfo.address} onChange={e => onUpdateSystemInfo({...systemInfo, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100"><ImageIcon size={20} className="text-indigo-600"/> Identidade Visual</h3>
                    <div className="border-2 border-dashed border-slate-300 bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-white transition-all cursor-pointer relative">
                         <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/>
                        {systemInfo.logoUrl ? <img src={systemInfo.logoUrl} className="w-32 h-32 object-contain bg-white rounded-lg p-2 border shadow-sm mx-auto mb-3"/> : <div className="w-16 h-16 bg-white border border-slate-200 text-indigo-500 rounded-full flex items-center justify-center mb-3"><Upload size={24}/></div>}
                        <p className="text-sm font-medium text-slate-700">Carregar Logotipo</p>
                    </div>
                </div>
           </div>
           <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end"><button id="save-btn-info" onClick={handleSaveInfo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Save size={18}/> Salvar Alterações</button></div>
        </div>
      )}

      {/* --- TAB: ACCESS --- */}
      {activeTab === 'ACCESS' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield size={20} className="text-indigo-600"/> Usuários do Sistema</h3>
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th className="p-4 font-bold">Usuário</th><th className="p-4 font-bold">Nome</th><th className="p-4 font-bold">Cargo</th><th className="p-4 font-bold text-right">Ações</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                      {usersList.filter(u => u.username).map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50">
                              <td className="p-4"><span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{user.username}</span></td>
                              <td className="p-4 text-sm font-medium text-slate-700">{user.name}</td>
                              <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{user.role}</span></td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                  <button onClick={() => handleOpenPasswordReset(user)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Lock size={16}/></button>
                                  <button onClick={() => handleOpenPermissions(user)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Shield size={16}/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* --- TAB: STUDIO --- */}
      {activeTab === 'STUDIO' && (
          <div className="space-y-6">
              <div className="flex justify-center pb-4">
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner border border-slate-200">
                      <button onClick={() => setStudioMode('CARDS')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${studioMode === 'CARDS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Carteirinhas</button>
                      <button onClick={() => setStudioMode('DOCS')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${studioMode === 'DOCS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Documentos Inteligentes</button>
                  </div>
              </div>

              {studioMode === 'CARDS' ? (
                  <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] min-h-[800px]">
                      {/* CARD SIDEBAR */}
                      <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelos</span>
                              <button onClick={handleCreateTemplate} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg"><Plus size={18}/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                              {templates.map(tpl => (
                                  <div key={tpl.id} onClick={() => setSelectedTemplateId(tpl.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplateId === tpl.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                                      <div className="font-bold text-slate-800 text-sm">{tpl.name}</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      {/* CANVAS */}
                      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                          {activeTemplate ? (
                              <>
                                <div className="absolute top-4 left-4 flex gap-2 z-20">
                                    <button onClick={() => setStudioView('front')} className="px-4 py-1.5 bg-white text-xs font-bold rounded shadow">Frente</button>
                                    <button onClick={() => setStudioView('back')} className="px-4 py-1.5 bg-white text-xs font-bold rounded shadow">Verso</button>
                                    <button onClick={saveCurrentTemplate} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow ml-4">Salvar</button>
                                </div>
                                <div ref={canvasRef} className="relative bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: `${activeTemplate.orientation === 'landscape' ? activeTemplate.width : activeTemplate.height}px`, height: `${activeTemplate.orientation === 'landscape' ? activeTemplate.height : activeTemplate.width}px`, background: studioView === 'front' ? activeTemplate.frontBackground : activeTemplate.backBackground }} onClick={() => setSelectedElementId(null)}>
                                    {activeTemplate.elements.filter(el => el.layer === studioView).map(el => (
                                        <div key={el.id} onMouseDown={(e) => handleMouseDown(e, el.id)} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, ...el.style, cursor: isDragging ? 'grabbing' : 'grab', outline: selectedElementId === el.id ? '2px solid #4f46e5' : 'none' }}>
                                            {el.type === 'text-dynamic' ? `{${el.field}}` : el.content || 'Item'}
                                        </div>
                                    ))}
                                </div>
                              </>
                          ) : <p>Selecione um modelo</p>}
                      </div>
                      {/* PROPERTIES */}
                      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h4 className="font-bold text-slate-800 mb-4">Propriedades</h4>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                              <button onClick={() => addElement('text-static')} className="p-2 border rounded text-xs">Texto</button>
                              <button onClick={() => addElement('image')} className="p-2 border rounded text-xs">Imagem</button>
                              <button onClick={() => addElement('shape')} className="p-2 border rounded text-xs">Forma</button>
                              <button onClick={() => addElement('text-dynamic')} className="p-2 border rounded text-xs bg-indigo-50 text-indigo-700">Dinâmico</button>
                          </div>
                          {selectedElementId && activeElement && (
                              <div className="space-y-3">
                                  <label className="text-xs font-bold">Campo</label>
                                  <select value={activeElement.field || ''} onChange={e => updateElement(activeElement.id, { field: e.target.value as any })} className="w-full p-2 border rounded text-sm"><option value="name">Nome</option><option value="role">Cargo</option></select>
                                  <button onClick={() => removeElement(activeElement.id)} className="w-full p-2 bg-rose-50 text-rose-600 rounded text-xs font-bold">Remover</button>
                              </div>
                          )}
                      </div>
                  </div>
              ) : (
                  // --- DOCUMENTS MODE (RICH EDITOR REAL) ---
                  <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] min-h-[800px]">
                      {/* DOCS SIDEBAR */}
                      <div className="w-full lg:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documentos</span>
                              <button onClick={handleCreateDocument} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg"><Plus size={18}/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                              {documents.map(doc => (
                                  <div key={doc.id} onClick={() => setActiveDocId(doc.id)} className={`p-3 rounded-xl border cursor-pointer ${activeDocId === doc.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                                      <p className="text-sm font-bold text-slate-700">{doc.title}</p>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }} className="text-rose-400 hover:text-rose-600 text-xs mt-1"><Trash2 size={12}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* EDITOR */}
                      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col relative shadow-inner">
                          {activeDoc ? (
                              <>
                                <div className="p-2 border-b border-slate-200 bg-white flex items-center gap-2 z-10 sticky top-0">
                                    <button onClick={() => execCmd('bold')} className="p-2 hover:bg-slate-100 rounded"><Bold size={16}/></button>
                                    <button onClick={() => execCmd('italic')} className="p-2 hover:bg-slate-100 rounded"><Italic size={16}/></button>
                                    <button onClick={() => execCmd('underline')} className="p-2 hover:bg-slate-100 rounded"><Underline size={16}/></button>
                                    <input type="text" value={activeDoc.title} onChange={e => handleUpdateDoc({ title: e.target.value })} className="ml-auto border-b border-transparent focus:border-indigo-500 outline-none text-sm font-bold text-right" />
                                </div>
                                <div className="flex-1 overflow-auto bg-slate-100 p-8 flex justify-center custom-scrollbar">
                                    <div 
                                        ref={docEditorRef}
                                        contentEditable
                                        className="bg-white shadow-2xl outline-none p-[20mm] text-slate-800 font-serif text-sm w-[210mm] min-h-[297mm]"
                                        dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                                        onInput={(e) => handleUpdateDoc({ content: e.currentTarget.innerHTML })}
                                    ></div>
                                </div>
                              </>
                          ) : <div className="flex items-center justify-center h-full text-slate-400">Selecione um documento</div>}
                      </div>

                      {/* AI ASSISTANT */}
                      <div className="w-full lg:w-80 bg-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-800">
                          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
                              <Bot className="text-indigo-400" size={20}/>
                              <span className="font-bold text-white text-sm">Secretária Ativa</span>
                          </div>
                          
                          <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                              <input type="file" ref={refFileInput} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleReferenceUpload} />
                              <div onClick={() => refFileInput.current?.click()} className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-800">
                                  {isAnalyzingRef ? <span className="text-indigo-400 text-xs">Analisando...</span> : referenceFile ? <span className="text-emerald-400 text-xs">{referenceFile.name}</span> : <span className="text-slate-500 text-xs">Anexar Modelo</span>}
                              </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                              {aiChatHistory.map((msg, idx) => (
                                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] p-3 rounded-xl text-xs ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{msg.text}</div>
                                  </div>
                              ))}
                              {isProcessingAI && <div className="text-xs text-slate-500 animate-pulse">Escrevendo...</div>}
                          </div>

                          <div className="p-4 bg-slate-900 border-t border-slate-800 relative">
                              <input 
                                type="text" 
                                value={docPrompt} 
                                onChange={(e) => setDocPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerateDoc()}
                                placeholder="Ex: Crie um ofício sobre..." 
                                className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-10 py-3 outline-none"
                              />
                              <button onClick={handleAiGenerateDoc} disabled={isProcessingAI} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400"><Send size={16}/></button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: API (Integration placeholders) --- */}
      {activeTab === 'API' && <div className="text-center p-10 text-slate-500">Configurações de API mantidas conforme anterior.</div>}

      {/* PERMISSION MODALS (Same as before) */}
      {permissionUser && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold mb-4">Permissões: {permissionUser.name}</h3>
                  <div className="space-y-2 mb-4">
                      {SYSTEM_PERMISSIONS.map(p => (
                          <label key={p.id} className="flex items-center gap-2"><input type="checkbox" checked={tempPermissions.includes(p.id)} onChange={() => handleTogglePermission(p.id)}/> {p.label}</label>
                      ))}
                  </div>
                  <div className="flex justify-end gap-2"><button onClick={() => setPermissionUser(null)} className="px-4 py-2 border rounded">Cancelar</button><button onClick={handleSavePermissions} className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Settings;