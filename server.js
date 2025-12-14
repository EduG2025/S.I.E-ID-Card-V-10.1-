import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de Uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Pool MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.type === 'JSON') return JSON.parse(field.string());
    return next();
  }
});

// Middleware de Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas' });

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash || '');
    
    if (!validPass) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, avatarUrl: user.avatar_url } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, role, avatar_url as avatarUrl, permissions FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).send();
  }
});

// ... (outras rotas)

// --- DEMOGRAPHICS & MAP ---
app.get('/api/demographics/stats', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as totalPopulation,
                AVG(TIMESTAMPDIFF(YEAR, birth_date, CURDATE())) as averageAge,
                SUM(CASE WHEN JSON_EXTRACT(social_data_json, '$.workStatus') = 'Desempregado' THEN 1 ELSE 0 END) as unemployedCount,
                SUM(CASE WHEN JSON_EXTRACT(social_data_json, '$.incomeRange') = '0-600' THEN 1 ELSE 0 END) as lowIncomeCount
            FROM users
            WHERE role = 'RESIDENT' AND social_data_json IS NOT NULL
        `);
        const stats = rows[0];
        res.json({
            totalPopulation: parseInt(stats.totalPopulation) || 0,
            averageAge: parseFloat(stats.averageAge).toFixed(1) || 0,
            unemploymentRate: stats.totalPopulation > 0 ? ((stats.unemployedCount / stats.totalPopulation) * 100).toFixed(1) : 0,
            // ... mais estatísticas podem ser calculadas
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/map/units', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, unit, address, name as residentName, latitude, longitude, social_data_json 
            FROM users 
            WHERE role = 'RESIDENT' AND latitude IS NOT NULL AND longitude IS NOT NULL
        `);
        const units = rows.map(u => ({
            id: u.id,
            block: u.address || 'N/A',
            number: u.unit,
            status: 'OK', // Lógica de status financeiro pode ser adicionada aqui
            residentName: u.residentName,
            vulnerabilityLevel: u.social_data_json?.urgentNeed !== 'Nenhuma' ? 'HIGH' : 'LOW',
            tags: [],
            coordinates: { lat: u.latitude, lng: u.longitude },
            cep: u.social_data_json?.cep || ''
        }));
        res.json(units);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
