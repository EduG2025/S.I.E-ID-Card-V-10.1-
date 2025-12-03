
import { UserRole, SystemInfo, Permission, FinancialRecord, Incident, Notice, UnitData, Bill, Poll, User, Survey, AgendaEvent, Reservation, Visitor, MaintenanceRecord, DemographicStats, IdCardTemplate } from './types';
import { LayoutDashboard, Wallet, Users, Bell, ShieldAlert, CalendarClock, Settings, ClipboardList, BarChart3 } from 'lucide-react';

// Informações Padrão do Sistema (Fallback)
export const DEFAULT_SYSTEM_INFO: SystemInfo = {
  name: 'ASSOCIAÇÃO DE MORADORES DE CACARIA',
  cnpj: '05.648.299/0001-63',
  address: 'Rua Vitorino Tavares, Lt 15 - Piraí/RJ',
  email: 'contato@associacao.com.br',
  phone: '(24) 99999-9999',
  website: 'www.cacaria.org.br',
  primaryColor: '#15803d', // Green-700
  registrationMode: 'APPROVAL',
  enableMaps: true,
  enableQuestionnaire: true
};

export const MOCK_SYSTEM_INFO = DEFAULT_SYSTEM_INFO;

// MODELO DE CARTEIRINHA PADRÃO (VERDE/AMARELO)
export const DEFAULT_ID_CARD_TEMPLATE: IdCardTemplate = {
    id: 'tpl_default_green',
    name: 'Padrão Associação Verde',
    width: 600,
    height: 375, // Proporção CR80 (Cartão de Crédito)
    orientation: 'landscape',
    frontBackground: '#ffffff',
    backBackground: '#f3f4f6',
    elements: [
        // --- CABEÇALHO VERDE ---
        {
            id: 'header_bg', type: 'shape', label: 'Fundo Cabeçalho',
            x: 0, y: 0, width: 600, height: 80,
            style: { backgroundColor: '#15803d' }, // Green-700
            layer: 'front'
        },
        {
            id: 'header_logo_placeholder', type: 'image', label: 'Logo Pequeno',
            field: 'system.logo',
            x: 5, y: 3, width: 60, height: 60,
            style: { borderRadius: '50%', border: '2px solid white', backgroundColor: 'white' },
            layer: 'front'
        },
        {
            id: 'header_title', type: 'text-dynamic', label: 'Nome Associação',
            field: 'system.name',
            x: 95, y: 7,
            style: { fontSize: '22px', fontWeight: '900', color: '#ffffff', textAlign: 'right', fontFamily: 'Arial', textTransform: 'uppercase', width: 'auto', transform: 'translateX(-100%)' },
            layer: 'front'
        },
        {
            id: 'header_city', type: 'text-static', label: 'Cidade UF',
            content: 'PIRAÍ - RJ',
            x: 95, y: 15,
            style: { fontSize: '14px', fontWeight: 'bold', color: '#86efac', textAlign: 'right', width: 'auto', transform: 'translateX(-100%)' }, // Green-200
            layer: 'front'
        },

        // --- FOTO DO USUÁRIO ---
        {
            id: 'user_photo', type: 'image', label: 'Foto 3x4',
            field: 'avatarUrl',
            x: 5, y: 28, width: 130, height: 160,
            style: { border: '4px solid #15803d', borderRadius: '12px', objectFit: 'cover' },
            layer: 'front'
        },

        // --- DADOS PESSOAIS ---
        // NOME
        {
            id: 'label_name', type: 'text-static', label: 'Label Nome',
            content: 'NOME COMPLETO',
            x: 30, y: 28,
            style: { fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' },
            layer: 'front'
        },
        {
            id: 'user_name', type: 'text-dynamic', label: 'Nome Usuário',
            field: 'name',
            x: 30, y: 32,
            style: { fontSize: '24px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', width: '380px' }, // Slate-600
            layer: 'front'
        },

        // RG e NASCIMENTO (Mesma Linha)
        {
            id: 'label_rg', type: 'text-static', label: 'Label RG',
            content: 'RG',
            x: 30, y: 46,
            style: { fontSize: '10px', fontWeight: 'bold', color: '#9ca3af' },
            layer: 'front'
        },
        {
            id: 'user_rg', type: 'text-dynamic', label: 'RG Valor',
            field: 'rg', 
            x: 30, y: 50,
            style: { fontSize: '16px', fontWeight: '500', color: '#6b7280' },
            layer: 'front'
        },
        {
            id: 'label_birth', type: 'text-static', label: 'Label Nasc',
            content: 'NASCIMENTO',
            x: 65, y: 46,
            style: { fontSize: '10px', fontWeight: 'bold', color: '#9ca3af' },
            layer: 'front'
        },
        {
            id: 'user_birth', type: 'text-dynamic', label: 'Nasc Valor',
            field: 'birthDate',
            x: 65, y: 50,
            style: { fontSize: '16px', fontWeight: '500', color: '#6b7280' },
            layer: 'front'
        },

        // CPF
        {
            id: 'label_cpf', type: 'text-static', label: 'Label CPF',
            content: 'CPF',
            x: 30, y: 60,
            style: { fontSize: '10px', fontWeight: 'bold', color: '#9ca3af' },
            layer: 'front'
        },
        {
            id: 'user_cpf', type: 'text-dynamic', label: 'CPF Valor',
            field: 'cpfCnpj',
            x: 30, y: 64,
            style: { fontSize: '18px', fontWeight: 'bold', color: '#374151' },
            layer: 'front'
        },

        // --- BADGE DE CARGO (Abaixo da foto) ---
        {
            id: 'role_bg', type: 'shape', label: 'Fundo Cargo',
            x: 5, y: 75, width: 130, height: 30,
            style: { backgroundColor: '#15803d', borderRadius: '20px' },
            layer: 'front'
        },
        {
            id: 'user_role', type: 'text-dynamic', label: 'Cargo',
            field: 'role',
            x: 16, y: 77,
            style: { fontSize: '14px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', width: '130px', textTransform: 'uppercase', transform: 'translateX(-50%)' },
            layer: 'front'
        },

        // --- RODAPÉ DE INFORMAÇÕES EXTRAS ---
        {
            id: 'member_since', type: 'text-static', label: 'Membro Desde',
            content: 'Membro desde 26/11/2025',
            x: 95, y: 78,
            style: { fontSize: '10px', fontStyle: 'italic', color: '#9ca3af', textAlign: 'right', transform: 'translateX(-100%)' },
            layer: 'front'
        },
        {
            id: 'mandate', type: 'text-static', label: 'Mandato',
            content: 'MANDATO: NOV DE 2025 A NOV DE 2027',
            x: 95, y: 82,
            style: { fontSize: '11px', fontWeight: 'bold', color: '#15803d', textAlign: 'right', transform: 'translateX(-100%)' },
            layer: 'front'
        },

        // --- RODAPÉ AMARELO ---
        {
            id: 'footer_bg', type: 'shape', label: 'Fundo Rodapé',
            x: 0, y: 88, width: 600, height: 45,
            style: { backgroundColor: '#facc15' }, // Yellow-400
            layer: 'front'
        },
        {
            id: 'footer_text', type: 'text-static', label: 'Endereço Rodapé',
            content: 'RUA VITORINO TAVARES | CACARIA, LT 15 - PIRAÍ/RJ - CNPJ: 05.648.299/0001-63',
            x: 50, y: 91,
            style: { fontSize: '10px', fontWeight: 'bold', color: '#000000', textAlign: 'center', width: '100%', transform: 'translateX(-50%)' },
            layer: 'front'
        },
        {
            id: 'footer_sub', type: 'text-static', label: 'CNPJ Extra',
            content: 'CNPJ: 05.648.299/0001-63',
            x: 50, y: 95,
            style: { fontSize: '9px', fontWeight: 'normal', color: '#000000', textAlign: 'center', width: '100%', transform: 'translateX(-50%)' },
            layer: 'front'
        },

        // --- VERSO (QR CODE) ---
        {
            id: 'qr_code', type: 'qrcode', label: 'QR Acesso',
            x: 35, y: 20, width: 180, height: 180,
            style: {},
            layer: 'back'
        },
        {
            id: 'back_text', type: 'text-static', label: 'Texto Verso',
            content: 'Este cartão é pessoal e intransferível. O uso indevido sujeita o portador às sanções previstas no estatuto.',
            x: 50, y: 70,
            style: { fontSize: '12px', color: '#6b7280', textAlign: 'center', width: '80%', transform: 'translateX(-50%)' },
            layer: 'back'
        }
    ]
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['ALL'] },
  { id: 'users', label: 'Cadastros & Famílias', icon: Users, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'demographics', label: 'Análise Demográfica', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC] },
  { id: 'surveys', label: 'Censo & Pesquisas', icon: ClipboardList, roles: ['ALL'] },
  { id: 'finance', label: 'Financeiro', icon: Wallet, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.RESIDENT] },
  { id: 'social', label: 'Comunicação', icon: Bell, roles: ['ALL'] },
  { id: 'operations', label: 'Operacional', icon: ShieldAlert, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'timeline', label: 'Agenda & Timeline', icon: CalendarClock, roles: ['ALL'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: [UserRole.ADMIN, UserRole.PRESIDENT] },
];

export const AVAILABLE_ROLES = [
  'Administrador', 'Presidente', 'Vice-Presidente', 'Diretor Financeiro', 'Síndico', 'Morador', 'Porteiro', 'Conselheiro', 'Zelador', 'Comerciante', 'Visitante Frequente'
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  { id: 'view_dashboard', label: 'Visualizar Dashboard', module: 'Geral' },
  { id: 'manage_users', label: 'Gerenciar Cadastros', module: 'Cadastros' },
  { id: 'financial_view', label: 'Visualizar Financeiro', module: 'Financeiro' },
  { id: 'financial_edit', label: 'Editar Financeiro', module: 'Financeiro' },
  { id: 'send_notices', label: 'Enviar Comunicados', module: 'Comunicação' },
  { id: 'manage_settings', label: 'Acessar Configurações', module: 'Sistema' },
  { id: 'studio_ia', label: 'Acessar Studio IA', module: 'Studio IA' },
];

// INITIAL EMPTY STATES (Production Ready)
export const INITIAL_USER_STATE = null;
export const INITIAL_ALERTS = [];
export const INITIAL_FINANCIALS = [];
export const INITIAL_UNITS = [];

// Empty exports to satisfy imports in legacy components
// In production, these components should fetch data from API, but we provide empty arrays to prevent build errors.
export const MOCK_FINANCIALS: FinancialRecord[] = [];
export const MOCK_INCIDENTS: Incident[] = [];
export const MOCK_NOTICES: Notice[] = [];
export const MOCK_UNITS: UnitData[] = [];
export const MOCK_BILLS: Bill[] = [];
export const MOCK_POLLS: Poll[] = [];
export const MOCK_USERS_LIST: User[] = [];
export const MOCK_SURVEYS: Survey[] = [];
export const MOCK_AGENDA: AgendaEvent[] = [];
export const MOCK_RESERVATIONS: Reservation[] = [];
export const MOCK_VISITORS: Visitor[] = [];
export const MOCK_MAINTENANCE: MaintenanceRecord[] = [];
export const MOCK_DEMOGRAPHICS: DemographicStats = {
    totalPopulation: 0,
    averageAge: 0,
    averageIncome: 0,
    unemploymentRate: 0,
    ageDistribution: { children: 0, adults: 0, seniors: 0 },
    infrastructureNeeds: { sanitation: 0, water: 0, lighting: 0, trashCollection: 0 }
};
