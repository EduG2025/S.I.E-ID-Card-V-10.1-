import { SystemInfo, Permission, IdCardTemplate } from './types';
import { LayoutDashboard, Wallet, Users, Bell, ShieldAlert, CalendarClock, Settings, ClipboardList, BarChart3, Map as MapIcon } from 'lucide-react';

export const DEFAULT_SYSTEM_INFO: SystemInfo = {
  name: 'S.I.E',
  cnpj: '00.000.000/0001-00',
  address: 'Endereço não configurado',
  email: 'contato@sistema.com',
  phone: '(00) 00000-0000',
  website: 'www.sistema.com.br',
  primaryColor: '#4f46e5',
  registrationMode: 'APPROVAL',
  enableMaps: true,
  enableQuestionnaire: true
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE', 'MERCHANT', 'COUNCIL'] },
  { id: 'users', label: 'Cadastros & Famílias', icon: Users, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'CONCIERGE'] },
  { id: 'demographics', label: 'Análise Demográfica', icon: BarChart3, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC'] },
  { id: 'map', label: 'Mapa Inteligente', icon: MapIcon, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'CONCIERGE'] },
  { id: 'surveys', label: 'Censo & Pesquisas', icon: ClipboardList, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT'] },
  { id: 'finance', label: 'Financeiro', icon: Wallet, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT'] },
  { id: 'communication', label: 'Comunicação', icon: Bell, roles: ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE'] },
  { id: 'operations', label: 'Operacional', icon: ShieldAlert, roles: ['ADMIN', 'PRESIDENT', 'SINDIC', 'CONCIERGE'] },
  { id: 'timeline', label: 'Agenda & Timeline', icon: CalendarClock, roles: ['ADMIN', 'PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: ['ADMIN', 'PRESIDENT'] },
];

export const AVAILABLE_ROLES = [
  'ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SINDIC', 'RESIDENT', 'CONCIERGE', 'MERCHANT', 'COUNCIL'
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

export const DEFAULT_ID_CARD_TEMPLATE: IdCardTemplate = {
  id: 'tpl_default',
  name: 'Modelo Padrão',
  width: 340,
  height: 215,
  orientation: 'landscape',
  frontBackground: '#ffffff',
  backBackground: '#f3f4f6',
  elements: [
      { id: 'el_name_front', type: 'text-dynamic', label: 'Nome Completo', field: 'name', x: 25, y: 40, style: { fontSize: '18px', color: '#1e293b', fontWeight: 'bold' }, layer: 'front' },
      { id: 'el_role_front', type: 'text-dynamic', label: 'Cargo/Função', field: 'role', x: 25, y: 55, style: { fontSize: '12px', color: '#475569', fontWeight: 'bold' }, layer: 'front' },
      { id: 'el_avatar', type: 'image', label: 'Foto do Usuário', field: 'avatarUrl', x: 5, y: 30, width: 80, height: 100, style: { objectFit: 'cover' }, layer: 'front' },
      { id: 'el_logo', type: 'image', label: 'Logo do Sistema', field: 'system.logo', x: 75, y: 5, width: 60, height: 60, style: { objectFit: 'contain' }, layer: 'front' },
      { id: 'el_system_name', type: 'text-dynamic', label: 'Nome do Sistema', field: 'system.name', x: 5, y: 90, style: { fontSize: '10px', color: '#64748b' }, layer: 'back' },
  ]
};
