// Script para atualizar artigos diretamente no banco
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq, inArray } = require('drizzle-orm');

// Importar schema (ajustar caminho conforme necessário)
const { articles } = require('../shared/schema.js');

async function updateArticleImages() {
  let sql;
  
  try {
    console.log('🖼️  Atualizando imagens dos artigos...\n');

    // Configuração do banco (use as mesmas variáveis do seu .env)
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mamacare';
    
    sql = postgres(connectionString);
    const db = drizzle(sql);

    const imageMappings = [
      { id: 1, image: '/src/assets/imagem_artigos/1.jpg' },
      { id: 2, image: '/src/assets/imagem_artigos/2.jpg' },
      { id: 3, image: '/src/assets/imagem_artigos/3.jpg' },
      { id: 4, image: '/src/assets/imagem_artigos/4.jpg' },
      { id: 5, image: '/src/assets/imagem_artigos/5.jpg' },
      { id: 6, image: '/src/assets/imagem_artigos/6.jpg' }
    ];

    for (const mapping of imageMappings) {
      try {
        await db.update(articles)
          .set({ image: mapping.image })
          .where(eq(articles.id, mapping.id));
        
        console.log(`✅ Artigo ${mapping.id}: ${mapping.image}`);
      } catch (error) {
        console.error(`❌ Erro ao atualizar artigo ${mapping.id}:`, error.message);
      }
    }

    console.log('\n🎉 Atualização concluída!');
    
    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const updatedArticles = await db.select({
      id: articles.id,
      title: articles.title,
      image: articles.image
    }).from(articles).where(inArray(articles.id, [1, 2, 3, 4, 5, 6]));

    updatedArticles.forEach(article => {
      console.log(`ID ${article.id}: ${article.title} - ${article.image || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

updateArticleImages();