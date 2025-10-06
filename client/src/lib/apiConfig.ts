// Configuração da API baseada no ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://mamacarenew.onrender.com' 
    : 'http://localhost:5000');

// Forçar URL do Render em produção se a variável não estiver definida
const FINAL_API_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL 
  ? 'https://mamacarenew.onrender.com' 
  : API_BASE_URL;

console.log('🔧 API Config:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  PROD: import.meta.env.PROD,
  API_BASE_URL,
  FINAL_API_URL
});

export const API_CONFIG = {
  BASE_URL: FINAL_API_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${FINAL_API_URL}/api/auth/login`,
      REGISTER: `${FINAL_API_URL}/api/auth/register`,
      LOGOUT: `${FINAL_API_URL}/api/auth/logout`,
      ME: `${FINAL_API_URL}/api/auth/me`,
      FORGOT_PASSWORD: `${FINAL_API_URL}/api/auth/forgot-password`,
      RESET_PASSWORD: `${FINAL_API_URL}/api/auth/reset-password`,
      VERIFY_TOKEN: `${FINAL_API_URL}/api/auth/verify-reset-token`,
    },
    PREGNANCY: {
      GET: `${FINAL_API_URL}/api/pregnancy`,
      CREATE: `${FINAL_API_URL}/api/pregnancy`,
      UPDATE: `${FINAL_API_URL}/api/pregnancy`,
    },
    WEIGHT: {
      GET: `${FINAL_API_URL}/api/weight`,
      CREATE: `${FINAL_API_URL}/api/weight`,
      UPDATE: `${FINAL_API_URL}/api/weight`,
      DELETE: `${FINAL_API_URL}/api/weight`,
    },
    DIARY: {
      GET: `${FINAL_API_URL}/api/diary`,
      CREATE: `${FINAL_API_URL}/api/diary`,
      UPDATE: `${FINAL_API_URL}/api/diary`,
      DELETE: `${FINAL_API_URL}/api/diary`,
    },
    CONSULTATIONS: {
      GET: `${FINAL_API_URL}/api/consultations`,
      CREATE: `${FINAL_API_URL}/api/consultations`,
      UPDATE: `${FINAL_API_URL}/api/consultations`,
      DELETE: `${FINAL_API_URL}/api/consultations`,
    },
    BIRTH_PLAN: {
      GET: `${FINAL_API_URL}/api/birth-plan`,
      CREATE: `${FINAL_API_URL}/api/birth-plan`,
      UPDATE: `${FINAL_API_URL}/api/birth-plan`,
    },
    SHOPPING: {
      GET: `${FINAL_API_URL}/api/shopping`,
      CREATE: `${FINAL_API_URL}/api/shopping`,
      UPDATE: `${FINAL_API_URL}/api/shopping`,
      DELETE: `${FINAL_API_URL}/api/shopping`,
    },
    ARTICLES: {
      GET: `${FINAL_API_URL}/api/articles`,
    },
  }
};

export default API_CONFIG;
