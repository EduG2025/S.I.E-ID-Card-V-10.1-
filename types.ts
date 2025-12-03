
import React from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  SINDIC = 'SINDIC',
  RESIDENT = 'RESIDENT',
  CONCIERGE = 'CONCIERGE',
  MERCHANT = 'MERCHANT',
  COUNCIL = 'COUNCIL'
}

export interface SystemInfo {
  name: string;
  cnpj: string;
  address: string;
  email: string;
  phone: string;
  logoUrl?: string;
  primaryColor?: string;
  website?: string;
  registrationMode?: 'AUTOMATIC' | 'APPROVAL';
  enableMaps?: boolean;
  enableQuestionnaire?: boolean; // Nova configuração
}

export interface UserFinancialSettings {
  monthlyFee: number;
  dueDay: number;
  isDonor: boolean;
  donationAmount?: number;
  autoGenerateCharge: boolean;
}

// Interface detalhada do Questionário Social
export interface SocialQuestionnaireData {
  // 1. Domicílio
  residenceType?: 'Casa' | 'Sobrado' | 'Apartamento' | 'Barraco' | 'Outros';
  residenceOwnership?: 'Próprio' | 'Alugado' | 'Cedido' | 'Ocupação';
  residentsCount?: number;
  childrenCount?: number; // 0-12
  teenCount?: number; // 13-17
  adultCount?: number; // 18-59
  seniorCount?: number; // 60+
  hasDisabledPerson?: boolean;
  disabledPersonDetail?: string;
  animals?: string; // Cães, Gatos...

  // 2. Econômico & Infra
  incomeRange?: '0-600' | '601-1200' | '1201-2500' | '2501-5000' | '5001+';
  incomeSource?: 'Formal' | 'Informal' | 'Autônomo' | 'Benefícios' | 'Sem rendimento';
  socialBenefit?: 'Bolsa Família' | 'BPC-LOAS' | 'Auxílio Municipal' | 'Nenhum';
  waterSupply?: 'Regular' | 'Irregular' | 'Ausente';
  trashCollection?: boolean;
  sewage?: 'Rede Básica' | 'Fossa' | 'Céu Aberto';
  electricity?: 'Regular' | 'Irregular' | 'Ausente';
  internet?: 'Fibra' | 'Rádio' | 'Móvel' | 'Não possui';
  publicTransport?: boolean;

  // 3. Individual/Saúde
  educationLevel?: 'Sem escolaridade' | 'Fundamental' | 'Médio' | 'Técnico' | 'Superior' | 'Pós';
  isStudent?: boolean;
  workStatus?: 'Formal' | 'Autônomo' | 'Informal' | 'Desempregado' | 'Aposentado';
  chronicDisease?: string;
  continuousMedication?: boolean;
  
  // 4. Comércio (Se aplicável)
  isMerchant?: boolean;
  businessName?: string;
  businessType?: string;
  hasLicense?: boolean;
  businessRevenue?: '< 2k' | '2k-5k' | '5k-10k' | '10k-50k' | '50k+';
  communityInterest?: string[];

  // 5. Indicadores Sociais
  urgentNeed?: 'Alimento' | 'Saúde' | 'Habitação' | 'Emprego' | 'Nenhuma';
  socialRisk?: boolean;
  childrenOutOfSchool?: number;
  unemployedCount?: number;
  seniorsAlone?: number;
}

export interface User {
  id: string;
  name: string;
  username?: string; // For login
  password?: string; // For login (mock)
  unit?: string;
  role: UserRole | string;
  avatarUrl?: string;
  email?: string;
  cpfCnpj?: string;
  rg?: string; // RG added
  birthDate?: string; // BirthDate added
  phone?: string;
  address?: string;
  admissionDate?: string;
  notes?: string;
  documents?: { name: string; type: string; date: string }[];
  active: boolean;
  qrCodeData?: string;
  financialSettings?: UserFinancialSettings;
  financialStatus?: 'OK' | 'PENDING' | 'OVERDUE';
  profileCompletion?: number; // 0 to 100
  permissions?: string[]; // List of specific permission IDs granted to this user
  socialData?: SocialQuestionnaireData; // Dados do questionário
}

export interface Permission {
  id: string;
  label: string;
  module: string;
}

export interface RolePermission {
  role: string;
  permissions: string[]; // List of permission IDs
}

export interface FinancialRecord {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  category: string;
  userId?: string; // Link to user
  dueDate?: string;
  attachmentUrl?: string;
}

export interface Bill {
  id: string;
  userId: string;
  userName: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  barcode: string;
  month: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
  author: string;
  attachments?: string[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY' | 'SUCCESS';
  target: 'ALL' | 'BLOCK_A' | 'BLOCK_B' | 'STAFF' | 'RESIDENTS';
  channels: ('APP' | 'EMAIL' | 'WHATSAPP')[];
  date: string;
  sentBy: string;
  readCount?: number;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  location: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedBy: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  photoUrl?: string;
}

export type SocialTag = 'LOW_INCOME' | 'ELDERLY_ALONE' | 'DISABILITY' | 'HELP_REQUEST' | 'NONE';

export interface UnitData {
  id: string;
  block: string;
  number: string;
  status: 'OK' | 'DEBT' | 'WARNING';
  residentName: string;
  vulnerabilityLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; 
  tags: SocialTag[]; // Array of social markers
  coordinates: { lat: number; lng: number }; // Geographic coordinates
  cep?: string; // Added CEP property
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  status: 'ACTIVE' | 'CLOSED';
  endDate: string;
  externalLink?: string;
}

export interface Reservation {
  id: string;
  area: string;
  date: string;
  startTime: string;
  endTime: string;
  resident: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface Visitor {
    id: string;
    name: string;
    document: string;
    type: 'VISITOR' | 'DELIVERY' | 'SERVICE';
    destinationUnit: string;
    entryTime: string;
    exitTime?: string;
    registeredBy: string;
    photoUrl?: string;
}

export interface MaintenanceRecord {
    id: string;
    title: string;
    type: 'PREVENTIVE' | 'CORRECTIVE';
    status: 'SCHEDULED' | 'COMPLETED' | 'OVERDUE';
    date: string;
    cost?: number;
    assignedTo: string;
}

// --- AGENDA / TIMELINE TYPES ---
export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  type: 'MEETING' | 'MAINTENANCE' | 'EVENT' | 'DEADLINE';
  location?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  reminder?: 'NONE' | '1_HOUR' | '24_HOURS'; // New field for reminders
}

// --- SURVEYS & CENSUS TYPES ---

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'text' | 'choice' | 'multiple' | 'rating';
    options?: string[];
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    type: 'CENSUS' | 'SATISFACTION' | 'VOTING';
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    startDate: string;
    endDate: string;
    questions: SurveyQuestion[];
    responseCount: number;
    externalAccess: boolean;
    externalLink?: string;
}

// --- ID CARD STUDIO TYPES ---

export type CardElementType = 'text-static' | 'text-dynamic' | 'image' | 'qrcode' | 'shape';

export interface CardElement {
  id: string;
  type: CardElementType;
  label: string; // Internal label for the editor
  field?: keyof User | 'system.name' | 'system.logo' | 'system.address' | 'system.cnpj'; // For dynamic data
  content?: string; // For static text
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width?: number; // px or % (if shape)
  height?: number; // px or % (if shape)
  style: React.CSSProperties & {
      textAlign?: 'left' | 'center' | 'right';
  };
  layer: 'front' | 'back';
}

export interface IdCardTemplate {
  id: string;
  name: string;
  width: number; // usually in mm or px ratio
  height: number;
  orientation: 'landscape' | 'portrait';
  frontBackground: string; // Color or Image URL
  backBackground: string; // Color or Image URL
  elements: CardElement[];
}

// --- DEMOGRAPHIC ANALYSIS TYPES ---
export interface DemographicStats {
    totalPopulation: number;
    averageAge: number;
    averageIncome: number;
    unemploymentRate: number;
    ageDistribution: {
        children: number; // 0-14
        adults: number; // 15-64
        seniors: number; // 65+
    };
    infrastructureNeeds: {
        sanitation: number;
        water: number;
        lighting: number;
        trashCollection: number;
    };
}

// --- OFFICIAL DOCUMENTS (NEW) ---
export interface OfficialDocument {
    id: string;
    title: string;
    type: 'OFICIO' | 'ATA' | 'MEMORANDO' | 'CIRCULAR' | 'DECLARACAO';
    content: string; // HTML Content
    createdAt: string;
    updatedAt: string;
    referenceFile?: string; // Name of the uploaded reference model
    status: 'DRAFT' | 'FINAL';
    pageSize?: 'A4' | 'LETTER'; // Configuração de Tamanho
    orientation?: 'PORTRAIT' | 'LANDSCAPE'; // Configuração de Orientação
}
