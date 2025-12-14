import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Criar Pool de Conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sie_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.type === 'JSON') {
        try {
            return JSON.parse(field.string());
        } catch(e) {
            return null;
        }
    }
    return next();
  }
});

// Teste de conexão ao iniciar
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado ao MySQL com sucesso! ID da Thread:', connection.threadId);
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err.code, err.message);
    });


export default pool;