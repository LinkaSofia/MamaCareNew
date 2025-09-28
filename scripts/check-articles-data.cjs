const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { articles } = require('../shared/schema.ts');

// Configuração da conexão
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_123456789@ep-rough-king-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(connectionString);
const db = drizzle(sql);

async function checkArticlesData() {
  try {
    console.log('🔍 Verificando dados da tabela articles...\n');
    
    // Buscar todos os artigos
    const allArticles = await db.select().from(articles).limit(10);
    
    console.log(`📊 Total de artigos encontrados: ${allArticles.length}\n`);
    
    if (allArticles.length > 0) {
      console.log('📋 Primeiros artigos:');
      allArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ID: ${article.id}`);
        console.log(`   Título: ${article.title}`);
        console.log(`   Categoria: ${article.categoria || 'N/A'}`);
        console.log(`   Imagem: ${article.image ? 'SIM' : 'NÃO'}`);
        console.log(`   Fonte: ${article.source || 'N/A'}`);
        console.log(`   Tipo: ${article.type || 'N/A'}`);
        console.log(`   Ativo: ${article.isActive}`);
        if (article.image) {
          console.log(`   URL da imagem: ${article.image.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('❌ Nenhum artigo encontrado na tabela!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
  } finally {
    await sql.end();
  }
}

checkArticlesData();
