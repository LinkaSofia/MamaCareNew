const fs = require('fs');
const path = require('path');

/**
 * Script para importar imagens do bebê diretamente no banco de dados como base64
 * Uso: node scripts/import-baby-images.js
 * 
 * O usuário deve fornecer as imagens e o número da semana correspondente
 */

// Pool de conexão com o banco (simular estrutura)
const { Client } = require('pg');

async function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Erro ao converter imagem ${imagePath}:`, error.message);
    return null;
  }
}

async function insertImageIntoDatabase(week, imageDataUrl) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    const query = `
      UPDATE baby_development 
      SET image_path = $1 
      WHERE week = $2
    `;
    
    const result = await client.query(query, [imageDataUrl, week]);
    
    if (result.rowCount > 0) {
      console.log(`✅ Imagem inserida para semana ${week}`);
      return true;
    } else {
      console.log(`⚠️ Nenhuma linha encontrada para semana ${week}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao inserir imagem para semana ${week}:`, error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function processImageUpload(week, imagePath) {
  console.log(`📸 Processando imagem para semana ${week}: ${imagePath}`);
  
  // Verificar se arquivo existe
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Arquivo não encontrado: ${imagePath}`);
    return false;
  }

  // Converter para base64
  const imageDataUrl = await convertImageToBase64(imagePath);
  if (!imageDataUrl) {
    return false;
  }

  // Verificar tamanho (máximo 500KB)
  const sizeInBytes = imageDataUrl.length * 0.75; // base64 é ~33% maior que o arquivo original
  const maxSizeInBytes = 500 * 1024; // 500KB
  
  if (sizeInBytes > maxSizeInBytes) {
    console.error(`❌ Imagem muito grande (${Math.round(sizeInBytes/1024)}KB). Máximo: 500KB`);
    return false;
  }

  // Inserir no banco
  return await insertImageIntoDatabase(week, imageDataUrl);
}

// Função principal para uso interativo
async function main() {
  if (process.argv.length < 4) {
    console.log('📝 Uso: node import-baby-images.js <semana> <caminho-da-imagem>');
    console.log('📝 Exemplo: node import-baby-images.js 5 ./images/semana5.png');
    process.exit(1);
  }

  const week = parseInt(process.argv[2]);
  const imagePath = process.argv[3];

  if (isNaN(week) || week < 1 || week > 40) {
    console.error('❌ Semana deve ser um número entre 1 e 40');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    process.exit(1);
  }

  const success = await processImageUpload(week, imagePath);
  process.exit(success ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processImageUpload, convertImageToBase64 };