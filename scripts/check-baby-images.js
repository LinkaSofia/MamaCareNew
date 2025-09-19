// Script para verificar quais semanas têm baby_image_url no banco
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { sql } from 'drizzle-orm';

async function checkBabyImages() {
  try {
    console.log('🔍 Verificando imagens do bebê no banco de dados...');
    
    // Buscar todas as semanas com baby_image_url
    const result = await db.select({
      week: babyDevelopment.week,
      baby_image_url: babyDevelopment.baby_image_url,
      fruit_image_url: babyDevelopment.fruit_image_url
    }).from(babyDevelopment)
    .where(sql`${babyDevelopment.baby_image_url} IS NOT NULL`)
    .orderBy(babyDevelopment.week);
    
    console.log('📊 Semanas com baby_image_url:');
    result.forEach(row => {
      console.log(`Semana ${row.week}: ${row.baby_image_url}`);
    });
    
    // Buscar todas as semanas para ver o estado geral
    const allWeeks = await db.select({
      week: babyDevelopment.week,
      baby_image_url: babyDevelopment.baby_image_url,
      fruit_image_url: babyDevelopment.fruit_image_url
    }).from(babyDevelopment)
    .orderBy(babyDevelopment.week)
    .limit(10);
    
    console.log('\n📋 Primeiras 10 semanas:');
    allWeeks.forEach(row => {
      console.log(`Semana ${row.week}: baby=${row.baby_image_url ? '✅' : '❌'}, fruit=${row.fruit_image_url ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar imagens:', error.message);
  }
}

checkBabyImages();
