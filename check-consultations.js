const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres');

(async () => {
  try {
    console.log('🔍 Buscando consultas no banco...');
    const result = await sql`
      SELECT id, title, date, location, doctor_name, pregnancy_id, completed 
      FROM consultations 
      ORDER BY date DESC 
      LIMIT 10
    `;
    console.log(`📊 Total de consultas: ${result.length}`);
    console.log('📋 Consultas encontradas:');
    result.forEach((c, i) => {
      console.log(`\n${i+1}. ${c.title}`);
      console.log(`   ID: ${c.id}`);
      console.log(`   Data: ${c.date}`);
      console.log(`   Gravidez: ${c.pregnancy_id}`);
      console.log(`   Concluída: ${c.completed}`);
    });
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
})();

