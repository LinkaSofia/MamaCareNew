// Script para atualizar artigos usando Neon Database
const { Pool } = require('@neondatabase/serverless');

async function updateArticleImages() {
  // Usar a mesma URL que o servidor usa
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mamacare";
  
  const pool = new Pool({ connectionString });

  try {
    console.log('🔌 Conectado ao banco de dados Neon');
    console.log('🖼️  Atualizando imagens dos artigos...\n');

    const updateQueries = [
      "UPDATE articles SET image = '/src/assets/imagem_artigos/1.jpg' WHERE id = 1;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/2.jpg' WHERE id = 2;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/3.jpg' WHERE id = 3;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/4.jpg' WHERE id = 4;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/5.jpg' WHERE id = 5;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/6.jpg' WHERE id = 6;"
    ];

    for (let i = 0; i < updateQueries.length; i++) {
      try {
        const result = await pool.query(updateQueries[i]);
        console.log(`✅ Artigo ${i + 1}: ${result.rowCount} linha(s) atualizada(s)`);
      } catch (error) {
        console.error(`❌ Erro no artigo ${i + 1}:`, error.message);
      }
    }

    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const checkResult = await pool.query(`
      SELECT id, title, image 
      FROM articles 
      WHERE id IN (1,2,3,4,5,6) 
      ORDER BY id
    `);

    console.log('\n📊 Artigos atualizados:');
    checkResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.title} - ${row.image || 'NULL'}`);
    });

    console.log('\n🎉 Atualização concluída!');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    await pool.end();
  }
}

updateArticleImages();
