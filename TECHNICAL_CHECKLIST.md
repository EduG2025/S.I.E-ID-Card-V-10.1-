# Checklist Técnico Obrigatório - S.I.E (Deploy Final)

## 1. Código & Dependências
- [x] **Repositório Git Limpo:** Branch `main` estável e sem commits quebrados.
- [x] **Dependências Auditadas:** `package.json` contém TODAS as dependências (frontend e backend). Não há conflitos de versão.
- [x] **Build sem Erros:** `npm run build` executa sem falhas de TypeScript ou de empacotamento.
- [x] **Remoção Completa de Mocks:** Nenhum componente utiliza dados fictícios (`MOCK_DATA`) para renderização. Todos os dados são carregados da API.
- [x] **Variáveis de Ambiente:** O código não contém chaves de API "hardcoded". Utiliza `.env` no backend. O arquivo `.env.example` existe.

## 2. Backend & API
- [x] **Conexão com Banco de Dados:** A API consegue se conectar ao MySQL usando as credenciais do `.env`.
- [x] **Endpoints Completos:** Todas as rotas (`/api/*`) esperadas pelo frontend estão implementadas e funcionais no `server.js`.
- [x] **Autenticação (JWT):** Rotas protegidas retornam `401 Unauthorized` sem token válido. O bypass de login foi removido.
- [x] **Upload de Arquivos:** A rota de upload (`/api/upload`) salva arquivos na pasta `uploads/`.
- [x] **Proxy de IA Seguro:** A chave do Google Gemini é usada apenas no backend, protegendo-a do navegador.
- [x] **Gerenciador de Processos:** PM2 está configurado para reiniciar a API em caso de falha.
- [x] **Segurança:** Inputs são sanitizados no backend usando consultas parametrizadas para prevenir SQL Injection.

## 3. Banco de Dados
- [x] **Schema Canônico:** O arquivo `schemaBD.md` está completo, validado e representa a estrutura real da aplicação.
- [x] **Relações (FKs):** Chaves estrangeiras estão definidas para garantir a integridade dos dados.
- [x] **Seed Inicial:** O banco possui o usuário `admin` e as configurações iniciais necessárias para o primeiro login.
- [x] **Performance:** Índices (`INDEX`) foram criados em colunas frequentemente consultadas.

## 4. Servidor & Infraestrutura (VPS)
- [x] **Ambiente Preparado:** Node.js, MySQL e Nginx instalados e configurados.
- [x] **Nginx como Proxy Reverso:** Configurado para servir o frontend estático (`dist/`) e redirecionar `/api` para a aplicação Node.js.
- [x] **HTTPS (SSL):** Certificado SSL (Let's Encrypt / Certbot) está ativo e configurado para renovação automática.
- [x] **Firewall:** Portas desnecessárias estão fechadas.

## 5. Testes e Validação
- [x] **Validação de Configuração:** `config-checker.ts` confirma que todas as variáveis de ambiente essenciais estão presentes.
- [x] **Saúde da API:** `api-checker.js` confirma que a API está no ar e respondendo.
- [x] **Fluxo de Login:** O login com o usuário `admin` funciona e depende da senha correta.
- [x] **Fluxo de Cadastro:** Um novo usuário é salvo no banco de dados.
- [x] **Fluxo de Upload:** O upload de avatar de um usuário funciona.
- [x] **Fluxo de Dados Reais:** Módulos de Demografia e Mapa Inteligente carregam dados do banco.

---
**Status:** ✅ **Pronto para Deploy.**