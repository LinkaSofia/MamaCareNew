// Script para converter imagens para Base64 e inserir no banco
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function convertToBase64() {
  // Usar a mesma URL que o servidor usa
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mamacare";
  
  const pool = new Pool({ connectionString });

  try {
    console.log('🔌 Conectado ao banco de dados Neon');
    console.log('🔄 Alterando coluna image de BYTEA para TEXT...');
    
    // 1. Alterar coluna de BYTEA para TEXT
    await pool.query(`
      ALTER TABLE articles ALTER COLUMN image TYPE TEXT;
    `);
    console.log('✅ Coluna alterada para TEXT');
    
    console.log('🖼️ Convertendo imagens para Base64...\n');

    // Caminho das imagens
    const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');
    
    // Lista de imagens
    const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

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

        // Converter buffer para Base64
        const base64String = imageBuffer.toString('base64');
        
        // Criar data URL
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        
        // Inserir no banco
        const query = `
          UPDATE articles 
          SET image = $1 
          WHERE id = $2
        `;
        
        const result = await pool.query(query, [dataUrl, articleId]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Artigo ID ${articleId} atualizado com ${filename} (Base64)`);
        } else {
          console.log(`⚠️  Nenhum artigo encontrado com ID ${articleId}`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error.message);
      }
    }

    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const checkResult = await pool.query(`
      SELECT id, title, 
             CASE 
               WHEN image IS NOT NULL THEN 'Imagem Base64 inserida (' || length(image) || ' caracteres)'
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
    console.log('💡 As imagens agora funcionam sem servidor!');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    await pool.end();
  }
}

convertToBase64();

