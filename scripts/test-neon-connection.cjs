const { Pool } = require('@neondatabase/serverless');

// URL de exemplo do Neon - você precisa substituir pela sua URL real
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 Testando conexão com Neon Database...');
console.log('URL:', connectionString.replace(/:[^:]*@/, ':***@')); // Mascarar senha

const pool = new Pool({ connectionString });

async function testConnection() {
  try {
    console.log('\n1. Testando conexão básica...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão funcionou! Hora atual:', result.rows[0].current_time);

    console.log('\n2. Testando consulta de artigos...');
    const articles = await pool.query('SELECT id, title, week, categoria FROM articles LIMIT 5');
    console.log('✅ Artigos encontrados:', articles.rows.length);
    articles.rows.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} (Semana ${article.week}, Categoria: ${article.categoria || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testConnection();





