import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 
    'JWT_SECRET'
];

const checkConfig = () => {
    console.log("🔍 Verificando variáveis de ambiente...");
    let hasError = false;

    requiredEnvVars.forEach(v => {
        if (!process.env[v]) {
            console.error(`❌ Erro: Variável ${v} não definida.`);
            hasError = true;
        } else {
            console.log(`✅ ${v} OK`);
        }
    });

    if (!process.env.API_KEY) {
        console.warn("⚠️ Aviso: API_KEY (Gemini) não definida. Funcionalidades de IA serão desativadas.");
    }

    if (hasError) {
        console.error("⚠️ Configuração incompleta. Verifique o arquivo .env");
        process.exit(1);
    } else {
        console.log("🚀 Configuração validada com sucesso!");
    }
};

checkConfig();