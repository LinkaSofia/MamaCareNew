// Configuração da API baseada no ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://mamacarenew.onrender.com' 
    : 'http://localhost:5000');

console.log('🔧 API Config:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  PROD: import.meta.env.PROD,
  API_BASE_URL
});

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      REGISTER: `${API_BASE_URL}/api/auth/register`,
      LOGOUT: `${API_BASE_URL}/api/auth/logout`,
      ME: `${API_BASE_URL}/api/auth/me`,
      FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
      RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
      VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify-reset-token`,
    },
    PREGNANCY: {
      GET: `${API_BASE_URL}/api/pregnancy`,
      CREATE: `${API_BASE_URL}/api/pregnancy`,
      UPDATE: `${API_BASE_URL}/api/pregnancy`,
    },
    WEIGHT: {
      GET: `${API_BASE_URL}/api/weight`,
      CREATE: `${API_BASE_URL}/api/weight`,
      UPDATE: `${API_BASE_URL}/api/weight`,
      DELETE: `${API_BASE_URL}/api/weight`,
    },
    DIARY: {
      GET: `${API_BASE_URL}/api/diary`,
      CREATE: `${API_BASE_URL}/api/diary`,
      UPDATE: `${API_BASE_URL}/api/diary`,
      DELETE: `${API_BASE_URL}/api/diary`,
    },
    CONSULTATIONS: {
      GET: `${API_BASE_URL}/api/consultations`,
      CREATE: `${API_BASE_URL}/api/consultations`,
      UPDATE: `${API_BASE_URL}/api/consultations`,
      DELETE: `${API_BASE_URL}/api/consultations`,
    },
    BIRTH_PLAN: {
      GET: `${API_BASE_URL}/api/birth-plan`,
      CREATE: `${API_BASE_URL}/api/birth-plan`,
      UPDATE: `${API_BASE_URL}/api/birth-plan`,
    },
    SHOPPING: {
      GET: `${API_BASE_URL}/api/shopping`,
      CREATE: `${API_BASE_URL}/api/shopping`,
      UPDATE: `${API_BASE_URL}/api/shopping`,
      DELETE: `${API_BASE_URL}/api/shopping`,
    },
    ARTICLES: {
      GET: `${API_BASE_URL}/api/articles`,
    },
  }
};

export default API_CONFIG;
