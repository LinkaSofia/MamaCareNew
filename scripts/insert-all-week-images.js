// Script para inserir todas as imagens das semanas no banco de dados
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { eq, sql } from 'drizzle-orm';

async function insertAllWeekImages() {
  try {
    console.log('🖼️ Inserindo todas as imagens das semanas no banco de dados...');
    
    // Mapeamento das semanas com suas respectivas imagens
    const weekImages = {
      1: '/client/src/assets/1.png',
      2: '/client/src/assets/2_1757176256170.jpeg',
      3: '/client/src/assets/3_1757174102100.png',
      4: '/client/src/assets/4.png',
      5: '/client/src/assets/5.png',
      6: '/client/src/assets/6.png',
      7: '/client/src/assets/7.png',
      8: '/client/src/assets/8.png',
      9: '/client/src/assets/9.png',
      10: '/client/src/assets/10.png',
      11: '/client/src/assets/11.png',
      12: '/client/src/assets/12.png',
      13: '/client/src/assets/13.png',
      14: '/client/src/assets/14.png',
      15: '/client/src/assets/15.png',
      16: '/client/src/assets/16.png'
    };
    
    const results = [];
    
    for (const [week, imagePath] of Object.entries(weekImages)) {
      try {
        const weekNum = parseInt(week);
        
        // Atualizar a semana com a imagem correta
        const result = await db.update(babyDevelopment)
          .set({ baby_image_url: imagePath })
          .where(eq(babyDevelopment.week, weekNum))
          .returning();
        
        if (result.length > 0) {
          console.log(`✅ Semana ${week}: ${imagePath}`);
          results.push({ week: weekNum, image: imagePath, status: 'success' });
        } else {
          console.log(`❌ Semana ${week}: Nenhum registro encontrado`);
          results.push({ week: weekNum, image: imagePath, status: 'not_found' });
        }
      } catch (error) {
        console.error(`❌ Erro na semana ${week}:`, error.message);
        results.push({ week: parseInt(week), image: imagePath, status: 'error', error: error.message });
      }
    }
    
    console.log('\n📊 Resumo das inserções:');
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : result.status === 'not_found' ? '⚠️' : '❌';
      console.log(`${status} Semana ${result.week}: ${result.image} (${result.status})`);
    });
    
    // Verificar o estado final
    const allWeeks = await db.select({
      week: babyDevelopment.week,
      baby_image_url: babyDevelopment.baby_image_url
    }).from(babyDevelopment)
    .where(sql`${babyDevelopment.baby_image_url} IS NOT NULL`)
    .orderBy(babyDevelopment.week);
    
    console.log('\n📋 Estado final do banco de dados:');
    allWeeks.forEach(row => {
      console.log(`Semana ${row.week}: ${row.baby_image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

insertAllWeekImages();
