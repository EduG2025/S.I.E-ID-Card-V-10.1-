import axios from 'axios';

// Configuração base do Axios
// Em produção, a URL base é relativa (o Nginx faz o proxy para o backend)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar Token JWT (se existir)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sie_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviços por Módulo
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const userService = {
  getAll: () => api.get('/users'),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  create: (data: any) => api.post('/users', data),
  uploadAvatar: (formData: FormData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const financialService = {
  getAll: () => api.get('/financials'),
  create: (data: any) => api.post('/financials', data),
  getSummary: () => api.get('/financials/summary'),
};

export const systemService = {
  getInfo: () => api.get('/settings/system'),
  updateInfo: (data: any) => api.put('/settings/system', data),
  getTemplates: () => api.get('/settings/templates'),
};

export const communicationService = {
  getAlerts: () => api.get('/alerts'),
  sendAlert: (data: any) => api.post('/alerts', data),
  getNotices: () => api.get('/notices'),
};

export default api;
