// Script para executar SQL direto no banco
const { Client } = require('pg');

async function updateArticleImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mamacare'
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao banco de dados');

    const updateQueries = [
      "UPDATE articles SET image = '/src/assets/imagem_artigos/1.jpg' WHERE id = 1;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/2.jpg' WHERE id = 2;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/3.jpg' WHERE id = 3;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/4.jpg' WHERE id = 4;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/5.jpg' WHERE id = 5;",
      "UPDATE articles SET image = '/src/assets/imagem_artigos/6.jpg' WHERE id = 6;"
    ];

    console.log('🖼️  Executando atualizações...\n');

    for (let i = 0; i < updateQueries.length; i++) {
      try {
        const result = await client.query(updateQueries[i]);
        console.log(`✅ Artigo ${i + 1}: ${result.rowCount} linha(s) atualizada(s)`);
      } catch (error) {
        console.error(`❌ Erro no artigo ${i + 1}:`, error.message);
      }
    }

    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const checkResult = await client.query(`
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
    await client.end();
  }
}

updateArticleImages();
