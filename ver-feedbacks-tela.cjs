const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres');

// EDITE AQUI: Escolha a tela que quer ver
const TELA = '/consultations'; // Exemplos: /consultations, /diary, /dashboard, /weight-tracking

async function verFeedbacksPorTela() {
  console.log('\n' + '='.repeat(80));
  console.log(`📱 FEEDBACKS DA TELA: ${TELA}`);
  console.log('='.repeat(80) + '\n');

  try {
    // Total e média
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        ROUND(AVG(rating), 2) as media
      FROM feedbacks
      WHERE page = ${TELA}
    `;

    if (stats[0].total === 0) {
      console.log(`ℹ️  Ainda não há feedbacks para a tela ${TELA}\n`);
      console.log('Telas disponíveis no sistema:');
      const telas = await sql`
        SELECT DISTINCT page FROM feedbacks ORDER BY page
      `;
      telas.forEach(t => console.log(`   - ${t.page}`));
      console.log('');
      return;
    }

    console.log(`Total de feedbacks: ${stats[0].total}`);
    console.log(`Nota média: ${stats[0].media} ${'⭐'.repeat(Math.round(stats[0].media))}\n`);

    // Todos os feedbacks desta tela
    const feedbacks = await sql`
      SELECT 
        u.name as usuario,
        u.email,
        f.rating as nota,
        f.message as mensagem,
        TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') as data_hora
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.page = ${TELA}
      ORDER BY f.created_at DESC
    `;

    console.log('-'.repeat(80));
    console.log('📋 TODOS OS FEEDBACKS:\n');

    feedbacks.forEach((row, i) => {
      const stars = '⭐'.repeat(row.nota);
      const emoji = row.nota >= 4 ? '😊' : row.nota === 3 ? '🙂' : '😔';
      
      console.log(`${i + 1}. ${emoji} ${row.usuario}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Nota: ${stars} (${row.nota}/5)`);
      console.log(`   Mensagem: "${row.mensagem}"`);
      console.log(`   Data: ${row.data_hora}`);
      console.log('');
    });

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await sql.end();
  }
}

verFeedbacksPorTela();

