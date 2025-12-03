import axios from 'axios';

// Configuração base do Axios
// O Vite (vite.config.ts) faz o proxy de /api para http://localhost:3000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos (aumentado para uploads/IA)
});

// Interceptor para adicionar Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sie_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento de Erros Global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('sie_auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  // Upload de Foto/Documento
  uploadFile: (formData: FormData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Alias for avatar specific uploads if needed
  uploadAvatar: (formData: FormData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const systemService = {
  getInfo: () => api.get('/settings/system'),
  updateInfo: (data: any) => api.put('/settings/system', data),
  getTemplates: () => api.get('/settings/templates'),
  saveTemplate: (data: any) => api.post('/settings/templates', data),
  updateTemplate: (id: string, data: any) => api.put(`/settings/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/settings/templates/${id}`),
};

export const aiService = {
  // Envia imagem/texto para o backend processar com Gemini (Seguro)
  analyzeDocument: (formData: FormData) => api.post('/ai/analyze-doc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateText: (prompt: string, context?: string) => api.post('/ai/generate-text', { prompt, context })
};

export const financialService = {
  getAll: () => api.get('/financials'),
  create: (data: any) => api.post('/financials', data),
  update: (id: string, data: any) => api.put(`/financials/${id}`, data),
  delete: (id: string) => api.delete(`/financials/${id}`),
  getSummary: () => api.get('/financials/summary'),
};

export const communicationService = {
  getAlerts: () => api.get('/alerts'),
  sendAlert: (data: any) => api.post('/alerts', data),
  getNotices: () => api.get('/notices'),
};

export default api;