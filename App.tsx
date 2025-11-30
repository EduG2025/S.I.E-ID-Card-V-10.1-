import React, { useState, Suspense, lazy, useEffect } from 'react';
import { MENU_ITEMS, DEFAULT_SYSTEM_INFO } from './constants';
import { SystemInfo, IdCardTemplate, User, UserRole, Alert, FinancialRecord } from './types';
import { LogOut, Bell, Menu, X, User as UserIcon, Loader2 } from 'lucide-react';
import { systemService, authService, communicationService, financialService, userService } from './services/api';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Finance = lazy(() => import('./components/Finance'));
const Communication = lazy(() => import('./components/Communication'));
const Settings = lazy(() => import('./components/Settings'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const Surveys = lazy(() => import('./components/Surveys'));
const Timeline = lazy(() => import('./components/Timeline'));
const Operations = lazy(() => import('./components/Operations'));
const DemographicAnalysis = lazy(() => import('./components/DemographicAnalysis'));
const LoginScreen = lazy(() => import('./components/LoginScreen')); // Separado para limpeza

const App: React.FC = () => {
  // Global State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State (Fetched from API)
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(DEFAULT_SYSTEM_INFO);
  const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // INITIAL LOAD
  useEffect(() => {
    const initApp = async () => {
        try {
            // 1. Check Auth
            // In a real app, validate token with backend
            const token = localStorage.getItem('sie_auth_token');
            if (token) {
                // Mocking auth validation success for this template structure
                // Real implementation: const user = await authService.me();
                setIsAuthenticated(true);
                
                // 2. Fetch Initial Data concurrently
                const [infoRes, templatesRes, alertsRes] = await Promise.all([
                    systemService.getInfo().catch(() => ({ data: DEFAULT_SYSTEM_INFO })),
                    systemService.getTemplates().catch(() => ({ data: [] })),
                    communicationService.getAlerts().catch(() => ({ data: [] }))
                ]);

                setSystemInfo(infoRes.data || DEFAULT_SYSTEM_INFO);
                setTemplates(templatesRes.data || []);
                setSystemAlerts(alertsRes.data || []);
            }
        } catch (error) {
            console.error("Initialization error", error);
            localStorage.removeItem('sie_auth_token');
        } finally {
            setIsLoading(false);
        }
    };
    initApp();
  }, []);

  // Fetch module specific data when tab changes
  useEffect(() => {
      if (!isAuthenticated) return;

      const fetchData = async () => {
          if (activeTab === 'users' && allUsers.length === 0) {
              const res = await userService.getAll().catch(() => ({ data: [] }));
              setAllUsers(res.data);
          }
          if (activeTab === 'finance' && financialRecords.length === 0) {
              const res = await financialService.getAll().catch(() => ({ data: [] }));
              setFinancialRecords(res.data);
          }
      };
      fetchData();
  }, [activeTab, isAuthenticated]);

  const handleLoginSuccess = (user: User, token: string) => {
      localStorage.setItem('sie_auth_token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      localStorage.removeItem('sie_auth_token');
      setIsAuthenticated(false);
      setCurrentUser(null);
  };

  // Render Loading
  if (isLoading) {
      return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={48}/></div>;
  }

  // Render Login
  if (!isAuthenticated) {
      return (
        <Suspense fallback={<div className="h-screen w-screen bg-slate-900"></div>}>
            <LoginScreen onLoginSuccess={handleLoginSuccess} systemInfo={systemInfo} />
        </Suspense>
      );
  }

  // Permission Logic
  const allowedMenuItems = MENU_ITEMS.filter(item => {
      if (!currentUser) return false;
      if (currentUser.role === UserRole.ADMIN) return true;
      if (item.roles.includes('ALL')) return true;
      return item.roles.includes(currentUser.role as UserRole);
  });

  const renderContent = () => (
      <Suspense fallback={<div className="flex flex-col items-center justify-center h-full text-indigo-600 gap-4"><Loader2 className="animate-spin" size={48} /><p className="font-medium text-slate-500">Carregando módulo...</p></div>}>
        {(() => {
            switch (activeTab) {
              case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
              case 'users': return <UserManagement systemInfo={systemInfo} templates={templates} transactions={financialRecords} onUpdateTransactions={setFinancialRecords} />;
              case 'demographics': return <DemographicAnalysis systemInfo={systemInfo} />;
              case 'finance': return <Finance transactions={financialRecords} onUpdateTransactions={setFinancialRecords} />;
              case 'social': return <Communication alerts={systemAlerts} onAddAlert={(a) => setSystemAlerts([a, ...systemAlerts])} />;
              case 'operations': return <Operations />;
              case 'surveys': return <Surveys />;
              case 'timeline': return <Timeline />;
              case 'settings': return <Settings systemInfo={systemInfo} onUpdateSystemInfo={setSystemInfo} templates={templates} onUpdateTemplates={setTemplates} usersList={allUsers} onUpdateUsers={setAllUsers} />;
              default: return <Dashboard onNavigate={setActiveTab} />;
            }
        })()}
      </Suspense>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/20">
                 {systemInfo.logoUrl ? <img src={systemInfo.logoUrl} className="w-full h-full object-cover rounded-xl"/> : 'S'}
             </div>
             <div>
                 <h1 className="font-bold text-white tracking-tight leading-tight">{systemInfo.name?.split(' ')[0] || 'SIE'}</h1>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Painel Gestor</p>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-500"><X size={20}/></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
             {allowedMenuItems.map(item => (
                 <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                     <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                     {item.label}
                 </button>
             ))}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-600">
                     {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon size={20}/>}
                 </div>
                 <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'Usuário'}</p>
                     <p className="text-xs text-slate-500 truncate capitalize">{currentUser?.role.toLowerCase()}</p>
                 </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold hover:bg-rose-900/30 hover:text-rose-500 transition-colors">
                 <LogOut size={14}/> Sair do Sistema
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={24}/></button>
                <h2 className="text-xl font-bold text-slate-800">{MENU_ITEMS.find(i => i.id === activeTab)?.label}</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell size={20}/>
                    {systemAlerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>}
                </button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50 relative">
             {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;