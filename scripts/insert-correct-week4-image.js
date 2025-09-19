// Script para inserir a imagem correta da semana 4
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function insertCorrectWeek4Image() {
  try {
    console.log('🖼️ Inserindo imagem correta da semana 4...');
    
    // URL da imagem correta da semana 4 (usando a imagem que está no assets)
    const imageUrl = '/attached_assets/4.png';
    
    // Atualizar a semana 4 com a imagem correta
    const result = await db.update(babyDevelopment)
      .set({ baby_image_url: imageUrl })
      .where(eq(babyDevelopment.week, 4))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Imagem da semana 4 atualizada com sucesso!');
      console.log('Resultado:', result[0]);
    } else {
      console.log('❌ Nenhum registro encontrado para a semana 4');
    }
    
    // Verificar o estado final
    const week4Data = await db.select({
      week: babyDevelopment.week,
      baby_image_url: babyDevelopment.baby_image_url,
      fruit_comparison: babyDevelopment.fruit_comparison
    }).from(babyDevelopment)
    .where(eq(babyDevelopment.week, 4))
    .limit(1);
    
    console.log('\n📊 Estado final da semana 4:');
    console.log(`Semana: ${week4Data[0]?.week}`);
    console.log(`Imagem: ${week4Data[0]?.baby_image_url}`);
    console.log(`Comparação: ${week4Data[0]?.fruit_comparison}`);
    
  } catch (error) {
    console.error('❌ Erro ao inserir imagem:', error.message);
  }
}

insertCorrectWeek4Image();
