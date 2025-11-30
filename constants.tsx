import { UserRole, SystemInfo, Permission, FinancialRecord, Incident, Notice, UnitData, Bill, Poll, User, Survey, AgendaEvent, Reservation, Visitor, MaintenanceRecord, DemographicStats } from './types';
import { LayoutDashboard, Wallet, Users, Bell, ShieldAlert, CalendarClock, Settings, ClipboardList, BarChart3 } from 'lucide-react';

// Informações Padrão do Sistema (Fallback)
export const DEFAULT_SYSTEM_INFO: SystemInfo = {
  name: 'S.I.E - SISTEMA INTELIGENTE',
  cnpj: '00.000.000/0000-00',
  address: 'Configurar no Painel Admin',
  email: 'admin@sistema.com',
  phone: '(00) 0000-0000',
  website: 'www.sistema.com.br',
  primaryColor: '#4f46e5',
  registrationMode: 'APPROVAL',
  enableMaps: true,
  enableQuestionnaire: true
};

export const MOCK_SYSTEM_INFO = DEFAULT_SYSTEM_INFO;

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

// Dados vazios para inicialização - Serão populados pela API
export const INITIAL_USER_STATE = null;
export const INITIAL_ALERTS = [];
export const INITIAL_FINANCIALS = [];
export const INITIAL_UNITS = [];

// --- MOCK DATA FOR DEMO PURPOSES ---

export const MOCK_FINANCIALS: FinancialRecord[] = [
    { id: '1', description: 'Mensalidade - Bloco A-101', amount: 350.00, type: 'INCOME', status: 'PAID', date: '2023-10-10', category: 'Mensalidade' },
    { id: '2', description: 'Mensalidade - Bloco B-202', amount: 350.00, type: 'INCOME', status: 'PENDING', date: '2023-10-10', category: 'Mensalidade', dueDate: '2023-10-15' },
    { id: '3', description: 'Manutenção Elevador', amount: 1200.00, type: 'EXPENSE', status: 'PAID', date: '2023-10-05', category: 'Manutenção' },
    { id: '4', description: 'Conta de Luz (Área Comum)', amount: 450.00, type: 'EXPENSE', status: 'PENDING', date: '2023-10-12', category: 'Utilidades' },
    { id: '5', description: 'Reserva Salão de Festas', amount: 100.00, type: 'INCOME', status: 'PAID', date: '2023-10-08', category: 'Reservas' },
];

export const MOCK_INCIDENTS: Incident[] = [
    { id: '1', title: 'Lâmpada queimada no corredor', description: 'Corredor do 2º andar, Bloco A', location: 'Bloco A', status: 'OPEN', reportedBy: 'João Silva', date: '2023-10-12', priority: 'LOW' },
    { id: '2', title: 'Vazamento na garagem', description: 'Próximo à vaga 12', location: 'Garagem', status: 'IN_PROGRESS', reportedBy: 'Portaria', date: '2023-10-10', priority: 'HIGH' },
];

export const MOCK_NOTICES: Notice[] = [
    { id: '1', title: 'Manutenção da Piscina', content: 'A piscina estará fechada para manutenção nesta terça-feira.', urgency: 'MEDIUM', date: '2023-10-11', author: 'Síndico' },
    { id: '2', title: 'Reunião de Condomínio', content: 'Assembleia extraordinária dia 20/10 às 19h no salão de festas.', urgency: 'HIGH', date: '2023-10-05', author: 'Administração' },
    { id: '3', title: 'Coleta de Lixo Reciclável', content: 'Lembre-se de separar o lixo reciclável às quartas-feiras.', urgency: 'LOW', date: '2023-10-01', author: 'Zeladoria' },
];

export const MOCK_UNITS: UnitData[] = [
    { id: '1', block: 'A', number: '101', status: 'OK', residentName: 'Carlos Oliveira', tags: ['LOW_INCOME'], coordinates: { lat: -22.6186, lng: -43.7122 }, vulnerabilityLevel: 'MEDIUM', cep: '27175-000' },
    { id: '2', block: 'A', number: '102', status: 'DEBT', residentName: 'Maria Santos', tags: ['ELDERLY_ALONE'], coordinates: { lat: -22.6188, lng: -43.7125 }, vulnerabilityLevel: 'HIGH', cep: '27175-000' },
    { id: '3', block: 'B', number: '201', status: 'OK', residentName: 'João Ferreira', tags: ['NONE'], coordinates: { lat: -22.6185, lng: -43.7120 }, vulnerabilityLevel: 'LOW', cep: '27175-000' },
    { id: '4', block: 'B', number: '202', status: 'WARNING', residentName: 'Ana Lima', tags: ['DISABILITY', 'HELP_REQUEST'], coordinates: { lat: -22.6189, lng: -43.7123 }, vulnerabilityLevel: 'MEDIUM', cep: '27175-000' },
];

export const MOCK_BILLS: Bill[] = [
    { id: '1', userId: 'u1', userName: 'Carlos Oliveira', unit: 'A-101', amount: 350.00, dueDate: '2023-10-10', status: 'PAID', barcode: '123456789', month: '10/2023' },
    { id: '2', userId: 'u2', userName: 'Maria Santos', unit: 'A-102', amount: 350.00, dueDate: '2023-10-10', status: 'OVERDUE', barcode: '987654321', month: '10/2023' },
    { id: '3', userId: 'u3', userName: 'João Ferreira', unit: 'B-201', amount: 350.00, dueDate: '2023-11-10', status: 'PENDING', barcode: '456123789', month: '11/2023' },
];

export const MOCK_POLLS: Poll[] = [
    { id: '1', question: 'Aprovação da pintura da fachada', options: [{ id: 'opt1', text: 'Sim', votes: 15 }, { id: 'opt2', text: 'Não', votes: 5 }], totalVotes: 20, status: 'ACTIVE', endDate: '2023-10-25' },
    { id: '2', question: 'Instalação de câmeras no corredor', options: [{ id: 'opt1', text: 'A favor', votes: 30 }, { id: 'opt2', text: 'Contra', votes: 2 }], totalVotes: 32, status: 'CLOSED', endDate: '2023-09-30' },
];

export const MOCK_USERS_LIST: User[] = [
    { id: 'u1', name: 'Carlos Oliveira', username: 'carlos.o', role: 'Morador', active: true, unit: 'A-101', financialStatus: 'OK', profileCompletion: 80, phone: '(21) 99999-1111', financialSettings: { monthlyFee: 350, dueDay: 10, isDonor: false, autoGenerateCharge: true } },
    { id: 'u2', name: 'Maria Santos', username: 'maria.s', role: 'Morador', active: true, unit: 'A-102', financialStatus: 'OVERDUE', profileCompletion: 40, phone: '(21) 99999-2222', financialSettings: { monthlyFee: 350, dueDay: 10, isDonor: false, autoGenerateCharge: true } },
    { id: 'u3', name: 'Admin System', username: 'admin', role: 'ADMIN', active: true, profileCompletion: 100, phone: '(21) 90000-0000', financialSettings: { monthlyFee: 0, dueDay: 1, isDonor: false, autoGenerateCharge: false } },
];

export const MOCK_SURVEYS: Survey[] = [
    { id: 's1', title: 'Censo Demográfico 2023', description: 'Levantamento de dados socioeconômicos dos moradores.', type: 'CENSUS', status: 'ACTIVE', startDate: '2023-09-01', endDate: '2023-12-31', responseCount: 45, externalAccess: true, externalLink: 'https://viverbem.org.br/p/census2023', questions: [{id: 'q1', text: 'Quantas pessoas moram na residência?', type: 'choice', options: ['1', '2', '3', '4+']}] },
    { id: 's2', title: 'Pesquisa de Satisfação - Áreas Comuns', description: 'Avalie a limpeza e manutenção das áreas comuns.', type: 'SATISFACTION', status: 'CLOSED', startDate: '2023-08-01', endDate: '2023-08-31', responseCount: 30, externalAccess: false, questions: [] },
];

export const MOCK_AGENDA: AgendaEvent[] = [
    { id: 'evt1', title: 'Assembleia Geral', description: 'Aprovação de contas e eleição de síndico.', date: '2023-10-20T19:00:00', type: 'MEETING', status: 'UPCOMING', createdBy: 'Admin', location: 'Salão de Festas' },
    { id: 'evt2', title: 'Manutenção Preventiva - Elevadores', description: 'Técnico da empresa X fará vistoria.', date: '2023-10-18T09:00:00', type: 'MAINTENANCE', status: 'UPCOMING', createdBy: 'Zelador', location: 'Blocos A e B' },
    { id: 'evt3', title: 'Vencimento Boleto Outubro', description: 'Prazo final para pagamento sem multa.', date: '2023-10-10T23:59:59', type: 'DEADLINE', status: 'COMPLETED', createdBy: 'Sistema' },
];

export const MOCK_RESERVATIONS: Reservation[] = [
    { id: 'r1', area: 'Churrasqueira', date: '2023-10-21', startTime: '12:00', endTime: '18:00', resident: 'Carlos Oliveira (A-101)', status: 'CONFIRMED' },
    { id: 'r2', area: 'Salão de Festas', date: '2023-10-28', startTime: '18:00', endTime: '23:00', resident: 'João Ferreira (B-201)', status: 'PENDING' },
];

export const MOCK_VISITORS: Visitor[] = [
    { id: 'v1', name: 'Roberto Lima', document: '123.456.789-00', type: 'VISITOR', destinationUnit: 'A-102', entryTime: '2023-10-12T14:30:00', registeredBy: 'Portaria' },
    { id: 'v2', name: 'Entregas Já', document: 'N/A', type: 'DELIVERY', destinationUnit: 'B-202', entryTime: '2023-10-12T15:00:00', registeredBy: 'Portaria' },
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
    { id: 'm1', title: 'Troca de Lâmpadas Hall', type: 'CORRECTIVE', status: 'COMPLETED', date: '2023-10-01', assignedTo: 'José (Zelador)' },
    { id: 'm2', title: 'Limpeza Caixa d\'Água', type: 'PREVENTIVE', status: 'SCHEDULED', date: '2023-11-01', assignedTo: 'Empresa Externa' },
];

export const MOCK_DEMOGRAPHICS: DemographicStats = {
    totalPopulation: 150,
    averageAge: 38,
    averageIncome: 3500,
    unemploymentRate: 8.5,
    ageDistribution: {
        children: 25,
        adults: 65,
        seniors: 10
    },
    infrastructureNeeds: {
        sanitation: 5,
        water: 2,
        lighting: 15,
        trashCollection: 0
    }
};
