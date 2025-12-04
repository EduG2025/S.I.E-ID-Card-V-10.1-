import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function checkHealth() {
    console.log(`🔍 Verificando API em ${API_URL}...`);
    
    try {
        await axios.get(`${API_URL}/users`)
            .catch(err => {
                // Expecting 401 or 403 if auth is working, meaning API is up
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    console.log("✅ API respondendo (Auth Middleware Ativo)");
                } else if (err.code === 'ECONNREFUSED') {
                    throw new Error("Conexão recusada");
                } else {
                    console.log(`⚠️ API respondeu com status ${err.response?.status}`);
                }
            });

        console.log("✅ Servidor está acessível.");
    } catch (error) {
        console.error("❌ API fora do ar ou com erro crítico:", error.message);
        process.exit(1);
    }
}

checkHealth();