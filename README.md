# S.I.E - Sistema Integrado de Gestão

Sistema completo para gestão de associações, condomínios e comunidades, com foco em dados sociais, demográficos e financeiros.

## Estrutura do Projeto

- **/src**: Código fonte do Frontend (React + Vite)
- **/components**: Componentes React modulares
- **/services**: Integração com API (Axios)
- **/server.js**: Backend Node.js (Express + MySQL)
- **/dist**: Build de produção do frontend

## Requisitos

- Node.js 18+
- MySQL 8.0+
- Variáveis de ambiente configuradas em `.env`

## Instalação

1. Clone o repositório
2. Execute `npm install`
3. Configure o banco de dados usando `schemaBD.mb`
4. Crie o arquivo `.env` com as credenciais
5. Inicie o desenvolvimento: `npm run dev` (Frontend) e `node server.js` (Backend)

## Scripts

- `npm run dev`: Inicia servidor de desenvolvimento Vite
- `npm run build`: Gera build de produção
- `node server.js`: Inicia API Backend
- `node api-checker.js`: Verifica saúde da API

## Funcionalidades Principais

- **Gestão de Usuários**: Cadastro completo, OCR de documentos via IA.
- **Financeiro**: Controle de caixa, geração de boletos, relatórios.
- **Demográfico**: Mapa de calor, filtros de vulnerabilidade social.
- **Operacional**: Reservas, ocorrências, portaria.
- **Comunicação**: Mural de avisos, alertas multicanal.
- **Carteirinha Digital**: Editor visual de carteirinhas com QR Code.
