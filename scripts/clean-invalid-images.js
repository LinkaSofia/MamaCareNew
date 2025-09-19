// Script para limpar URLs inválidas do banco de dados
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { sql } from 'drizzle-orm';

async function cleanInvalidImages() {
  try {
    console.log('🧹 Limpando URLs inválidas do banco de dados...');
    
    // Limpar URLs que começam com @assets/ (são imagens importadas, não URLs do banco)
    const result1 = await db.execute(sql`
      UPDATE baby_development 
      SET baby_image_url = NULL 
      WHERE baby_image_url LIKE '@assets/%'
    `);
    console.log('✅ URLs @assets/ removidas');
    
    // Limpar URLs que começam com /assets/ (podem não existir)
    const result2 = await db.execute(sql`
      UPDATE baby_development 
      SET baby_image_url = NULL 
      WHERE baby_image_url LIKE '/assets/%'
    `);
    console.log('✅ URLs /assets/ removidas');
    
    // Verificar URLs válidas restantes
    const remaining = await db.select({
      week: babyDevelopment.week,
      baby_image_url: babyDevelopment.baby_image_url
    }).from(babyDevelopment)
    .where(sql`${babyDevelopment.baby_image_url} IS NOT NULL`)
    .orderBy(babyDevelopment.week);
    
    console.log('\n📊 URLs válidas restantes:');
    remaining.forEach(row => {
      console.log(`Semana ${row.week}: ${row.baby_image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar URLs:', error.message);
  }
}

cleanInvalidImages();
