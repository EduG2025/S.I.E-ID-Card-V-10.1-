# Guia de Deploy - S.I.E (Ubuntu 24.04 VPS)

## 1. Estrutura de Pastas na VPS
Recomendamos a seguinte estrutura em `/var/www/sie-app`:

```bash
/var/www/sie-app
├── dist/          # (Arquivos do Frontend compilado)
├── server/        # (Arquivos do Backend Node.js)
├── uploads/       # (Pasta para imagens e documentos)
└── .env           # (Variáveis de ambiente)
```

## 2. Preparação e Permissões
Acesse sua VPS e execute:

```bash
# Criar diretório
sudo mkdir -p /var/www/sie-app/uploads

# Definir permissões para o Nginx e Node.js escreverem em uploads
sudo chown -R www-data:www-data /var/www/sie-app
sudo chmod -R 755 /var/www/sie-app
sudo chmod -R 775 /var/www/sie-app/uploads
```

## 3. Banco de Dados (MySQL)
1. Instale o MySQL Server.
2. Crie o banco `sie_db`.
3. Importe o arquivo `sql.md` (copie apenas os comandos SQL):
   ```bash
   mysql -u root -p sie_db < database_schema.sql
   ```

## 4. Backend (Node.js)
Certifique-se de que seu `server.js` aponte para a pasta de uploads correta e sirva os arquivos estáticos:

```javascript
// Exemplo no Express
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## 5. Nginx (Configuração de Proxy)
Edite `/etc/nginx/sites-available/sie-app`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Tamanho máximo de upload (importante para imagens/PDFs)
    client_max_body_size 10M;

    # Frontend
    location / {
        root /var/www/sie-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads (Acesso direto a imagens)
    location /uploads {
        alias /var/www/sie-app/uploads;
        access_log off;
        expires max;
    }
}
```

## 6. Build e Deploy
Localmente:
1. `npm install`
2. `npm run build`
3. Envie a pasta `dist` para `/var/www/sie-app/dist` na VPS via SCP ou FTP.

## 7. Variáveis de Ambiente (.env) na VPS
Crie o arquivo `.env` na raiz:

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=sie_db
JWT_SECRET=sua_chave_secreta_super_segura
PORT=3000
UPLOAD_DIR=/var/www/sie-app/uploads
```
