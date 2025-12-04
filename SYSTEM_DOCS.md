
# S.I.E - Sistema Inteligente Ativo
**Documentação Técnica & Operacional**

## 1. Arquitetura
O sistema segue uma arquitetura **Monolítica Modular** (Frontend servido pelo Backend ou Nginx, com API REST acoplada).

*   **Frontend:** React 18, Vite, TailwindCSS, Recharts, Lucide Icons.
*   **Backend:** Node.js, Express, JWT Auth, Multer (Uploads).
*   **Banco de Dados:** MySQL 8.0 (Relacional).
*   **IA:** Integração Google Gemini (Proxy via Backend).

## 2. Estrutura de Pastas
```
/
├── dist/               # Build de produção do Frontend
├── src/
│   ├── components/     # Módulos (Finance, Users, Settings...)
│   ├── services/       # api.ts (Axios)
│   ├── types.ts        # Definições TypeScript
│   └── App.tsx         # Roteamento e Layout
├── uploads/            # Armazenamento de arquivos (Avatares, Docs)
├── server.js           # API Server (Express)
├── database.sql        # Schema do Banco
└── package.json        # Dependências Fullstack
```

## 3. Fluxo de Dados (Exemplo: Cadastro)
1.  **Frontend:** `UserManagement.tsx` coleta dados + foto.
2.  **API:** `POST /api/users` recebe JSON + `POST /api/upload` recebe binário.
3.  **Controller:** `server.js` valida JWT, processa imagem com `Multer`, salva caminho no DB.
4.  **Database:** Tabela `users` armazena dados textuais e URL da imagem.

## 4. Endpoints Principais
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Autenticação e emissão de JWT |
| GET | `/api/users` | Lista usuários com filtros |
| POST | `/api/ai/generate-document` | Gera texto via Gemini (Secretária Ativa) |
| GET | `/api/dashboard/stats` | KPIs financeiros e operacionais |
| POST | `/api/bills/generate` | Gera boletos em massa para o mês |

## 5. Checklist de Deploy
- [ ] MySQL rodando e schema importado?
- [ ] Arquivo `.env` configurado com `DB_PASS` e `JWT_SECRET`?
- [ ] `npm run build` executado com sucesso?
- [ ] Pasta `uploads/` criada com permissão de escrita?
- [ ] PM2 gerenciando o processo `server.js`?
