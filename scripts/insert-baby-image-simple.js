// Script simples para inserir imagem do bebê usando SQL direto
import { sql } from 'drizzle-orm';
import { db } from '../server/db.ts';

async function insertBabyImageSimple() {
  try {
    console.log('🖼️ Inserindo imagem do bebê usando SQL direto...');
    
    // URL da imagem da semana 4
    const imageUrl = '/attached_assets/4.png';
    
    // Atualizar a semana 4 com a nova imagem do bebê usando SQL direto
    const result = await db.execute(sql`
      UPDATE baby_development 
      SET baby_image_url = ${imageUrl}
      WHERE week = 4
    `);
    
    console.log('✅ Imagem inserida com sucesso!');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('❌ Erro ao inserir imagem:', error.message);
  }
}

insertBabyImageSimple();
