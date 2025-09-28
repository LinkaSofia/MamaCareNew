const { Pool } = require('pg');

console.log('🔧 Configurando banco de dados local...\n');

// Configuração do banco local
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
});

async function setupDatabase() {
  try {
    console.log('📡 Conectando ao PostgreSQL...');
    
    // Criar banco de dados se não existir
    await pool.query('CREATE DATABASE mamacare');
    console.log('✅ Banco de dados "mamacare" criado com sucesso!');
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  Banco de dados "mamacare" já existe.');
    } else {
      console.error('❌ Erro ao criar banco de dados:', error.message);
      console.log('\n🔧 Soluções possíveis:');
      console.log('1. Instalar PostgreSQL: https://www.postgresql.org/download/');
      console.log('2. Iniciar o serviço PostgreSQL');
      console.log('3. Verificar se a senha está correta (padrão: "password")');
      console.log('4. Verificar se a porta 5432 está disponível');
    }
  } finally {
    await pool.end();
  }
}

setupDatabase();
