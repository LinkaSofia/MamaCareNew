// Script para inserir imagens dos artigos como bytea no banco
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function insertArticleImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mamacare'
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao banco de dados');

    // Caminho das imagens
    const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');
    
    // Lista de imagens
    const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

    console.log('🖼️  Inserindo imagens na tabela articles...\n');

    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const articleId = i + 1; // ID 1, 2, 3, 4, 5, 6
      const imagePath = path.join(imagesPath, filename);
      
      try {
        // Verificar se a imagem existe
        if (!fs.existsSync(imagePath)) {
          console.log(`❌ Imagem não encontrada: ${filename}`);
          continue;
        }

        // Ler a imagem como buffer
        const imageBuffer = fs.readFileSync(imagePath);
        const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);
        
        console.log(`📸 Processando: ${filename} (${fileSizeKB} KB) para artigo ID ${articleId}`);

        // Converter buffer para hex string (formato bytea do PostgreSQL)
        const hexString = imageBuffer.toString('hex');
        
        // Inserir no banco usando a função decode do PostgreSQL
        const query = `
          UPDATE articles 
          SET image = decode($1, 'hex') 
          WHERE id = $2
        `;
        
        const result = await client.query(query, [hexString, articleId]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Artigo ID ${articleId} atualizado com ${filename}`);
        } else {
          console.log(`⚠️  Nenhum artigo encontrado com ID ${articleId}`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error.message);
      }
    }

    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const checkResult = await client.query(`
      SELECT id, title, 
             CASE 
               WHEN image IS NOT NULL THEN 'Imagem inserida (' || length(image) || ' bytes)'
               ELSE 'Sem imagem'
             END as image_status
      FROM articles 
      WHERE id IN (1,2,3,4,5,6) 
      ORDER BY id
    `);

    console.log('\n📊 Status das imagens:');
    checkResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.title} - ${row.image_status}`);
    });

    console.log('\n🎉 Processo concluído!');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    await client.end();
  }
}

insertArticleImages();

