// Script para verificar artigos da semana 3
const { Pool } = require('@neondatabase/serverless');

async function checkWeek3Articles() {
  let pool;
  
  try {
    console.log('🔍 Verificando artigos da semana 3...');
    
    // Configurar pool de conexão
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL não encontrada. Verificando se há artigos na semana 3...');
      console.log('📋 Artigos que deveriam estar na semana 3:');
      console.log('1. Papo com Gineco sobre Candidíase na Gravidez');
      console.log('2. GUIA DA GESTANTE: PASSO A PASSO PARA UM PARTO ADEQUADO');
      console.log('3. Orientações Gerais Sobre a Gestação (novo)');
      return;
    }
    
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Buscar todos os artigos da semana 3
    const week3Articles = await pool.query(`
      SELECT id, title, week, video_url, image, source, type, description, is_active, created_at
      FROM articles 
      WHERE week = 3 
      ORDER BY created_at ASC
    `);
    
    console.log(`📋 Encontrados ${week3Articles.rows.length} artigos na semana 3:`);
    
    week3Articles.rows.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Semana: ${article.week}`);
      console.log(`   Tipo: ${article.type || 'N/A'}`);
      console.log(`   Ativo: ${article.is_active}`);
      console.log(`   Fonte: ${article.source || 'N/A'}`);
      console.log(`   URL: ${article.video_url || 'N/A'}`);
      console.log(`   Imagem: ${article.image || 'N/A'}`);
      console.log(`   Criado em: ${article.created_at}`);
    });
    
    // Verificar se há artigos em outras semanas
    const allArticles = await pool.query(`
      SELECT week, COUNT(*) as count
      FROM articles 
      WHERE is_active IS NULL OR is_active = true
      GROUP BY week 
      ORDER BY week
    `);
    
    console.log('\n📊 Resumo por semana:');
    allArticles.rows.forEach(row => {
      console.log(`   Semana ${row.week}: ${row.count} artigos`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar artigos:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar o script
checkWeek3Articles();

