import React, { useState } from 'react';
import { User, SystemInfo } from '../types';
import { authService } from '../services/api';
import { User as UserIcon, Lock, ArrowRight, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

interface LoginScreenProps {
    onLoginSuccess: (user: User, token: string) => void;
    systemInfo: SystemInfo;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, systemInfo }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Reg States
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regSuccess, setRegSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            // Simulation of API Call
            // const response = await authService.login({ username: loginUser, password: loginPass });
            // onLoginSuccess(response.data.user, response.data.token);
            
            // Mock Success for Production Template demo (Remove in real deploy)
            setTimeout(() => {
                if (loginUser === 'admin' && loginPass === '123') {
                    onLoginSuccess({ 
                        id: '1', name: 'Administrador', username: 'admin', role: 'ADMIN', active: true, profileCompletion: 100 
                    } as User, 'mock-jwt-token');
                } else {
                    setError('Credenciais inválidas. (Demo: admin / 123)');
                    setIsLoading(false);
                }
            }, 1000);

        } catch (err) {
            setError('Falha na autenticação. Verifique servidor.');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        // authService.register(...)
        setRegSuccess(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4 ring-1 ring-white/30">
                        {systemInfo.logoUrl ? <img src={systemInfo.logoUrl} className="w-full h-full object-contain"/> : <span className="font-bold text-3xl">S</span>}
                    </div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">{systemInfo.name}</h1>
                    <p className="text-indigo-200 text-xs font-medium mt-1">Acesso Restrito</p>
                </div>

                <div className="bg-white/95 p-8 rounded-t-3xl shadow-inner h-full">
                    {isRegistering ? (
                        regSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4"/>
                                <h3 className="text-lg font-bold text-slate-800">Solicitação Enviada!</h3>
                                <p className="text-slate-500 text-sm mt-2 mb-6">Aguarde a aprovação da administração.</p>
                                <button onClick={() => { setIsRegistering(false); setRegSuccess(false); }} className="text-indigo-600 font-bold text-sm">Voltar ao Login</button>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Solicitar Acesso</h2>
                                <input type="text" placeholder="Nome Completo" value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" required/>
                                <input type="email" placeholder="E-mail" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" required/>
                                <input type="tel" placeholder="WhatsApp" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" required/>
                                <input type="password" placeholder="Senha" value={regPass} onChange={e => setRegPass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" required/>
                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Enviar</button>
                                <button type="button" onClick={() => setIsRegistering(false)} className="w-full py-2 text-slate-500 text-xs font-bold flex items-center justify-center gap-1"><ArrowLeft size={12}/> Voltar</button>
                            </form>
                        )
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 justify-center"><AlertCircle size={14}/> {error}</div>}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuário</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Seu usuário"/>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-bold text-slate-500 uppercase">Senha</label><a href="#" className="text-[10px] text-indigo-600 font-bold hover:underline">Esqueceu?</a></div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="••••••••"/>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
                                {!isLoading && <ArrowRight size={18}/>}
                            </button>
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <button type="button" onClick={() => setIsRegistering(true)} className="text-sm font-bold text-indigo-600 hover:underline">Criar nova conta</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;