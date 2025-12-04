# Guia de Instalação e Deploy - S.I.E (Versão Final)

## 1. Pré-requisitos
- Servidor Ubuntu 22.04+
- Node.js 18+ (LTS)
- MySQL 8.0+

## 2. Configuração do Banco de Dados
1. Crie o banco e usuário:
   ```sql
   CREATE DATABASE sie_db;
   CREATE USER 'sie_user'@'localhost' IDENTIFIED BY 'sua_senha';
   GRANT ALL PRIVILEGES ON sie_db.* TO 'sie_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Importe o arquivo `database.sql` incluído neste pacote:
   ```bash
   mysql -u sie_user -p sie_db < database.sql
   ```

## 3. Configuração do Backend
1. Navegue para a pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo e configure:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Preencha DB_PASS, JWT_SECRET e GEMINI_API_KEY.*

3. Inicie o servidor:
   ```bash
   npm start
   # Ou para produção com PM2:
   pm2 start server.js --name "sie-backend"
   ```

## 4. Build do Frontend
1. Gere os arquivos estáticos:
   ```bash
   npm run build
   ```
   Isso criará a pasta `dist/`.

## 5. Configuração Nginx (Recomendado)
Configure o Nginx para servir a pasta `dist` na raiz `/` e fazer proxy reverso da `/api` para `http://localhost:3000`.

Exemplo de bloco `server`:
```nginx
location /api {
    proxy_pass http://localhost:3000;
}
location /uploads {
    alias /caminho/para/projeto/uploads;
}
location / {
    root /caminho/para/projeto/dist;
    try_files $uri $uri/ /index.html;
}
```
