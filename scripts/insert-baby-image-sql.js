// Script para inserir imagem do bebê diretamente no banco de dados
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function insertBabyImageSQL() {
  try {
    console.log('🖼️ Inserindo imagem do bebê diretamente no banco...');
    
    // URL da imagem da semana 4
    const imageUrl = '/attached_assets/4.png';
    
    // Atualizar a semana 4 com a nova imagem do bebê
    const result = await db.update(babyDevelopment)
      .set({ baby_image_url: imageUrl })
      .where(eq(babyDevelopment.week, 4))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Imagem inserida com sucesso!');
      console.log('Resultado:', result[0]);
    } else {
      console.log('❌ Nenhum registro encontrado para a semana 4');
    }
  } catch (error) {
    console.error('❌ Erro ao inserir imagem:', error.message);
  }
}

insertBabyImageSQL();
