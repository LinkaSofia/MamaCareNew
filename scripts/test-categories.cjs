const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { sql } = require('drizzle-orm');

// Usar a URL de conexão do Neon
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mamacare';

console.log('🔍 Testando consulta de categorias...');

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function testCategories() {
  try {
    // Testar consulta simples primeiro
    console.log('\n1. Testando consulta básica de artigos...');
    const basicQuery = await db.execute(sql`SELECT id, title, week, categoria FROM articles LIMIT 5`);
    console.log('✅ Consulta básica funcionou:', basicQuery.rows);

    // Testar consulta com filtro is_active
    console.log('\n2. Testando consulta com filtro is_active...');
    const activeQuery = await db.execute(sql`SELECT id, title, week, categoria FROM articles WHERE (is_active IS NULL OR is_active = true) LIMIT 5`);
    console.log('✅ Consulta com filtro funcionou:', activeQuery.rows);

    // Testar contagem total
    console.log('\n3. Contando total de artigos...');
    const countQuery = await db.execute(sql`SELECT COUNT(*) as total FROM articles WHERE (is_active IS NULL OR is_active = true)`);
    console.log('✅ Total de artigos ativos:', countQuery.rows[0].total);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testCategories();




