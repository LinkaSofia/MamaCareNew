const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres');

async function verFeedbacks() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO DE FEEDBACKS - MAMACARE');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. ESTATÍSTICAS GERAIS
    console.log('📈 ESTATÍSTICAS GERAIS:\n');
    const stats = await sql`
      SELECT 
        COUNT(*) as total_feedbacks,
        ROUND(AVG(rating), 2) as nota_media_geral,
        COUNT(DISTINCT user_id) as usuarios_que_avaliaram,
        COUNT(DISTINCT page) as telas_avaliadas
      FROM feedbacks
    `;
    
    if (stats[0].total_feedbacks > 0) {
      console.log(`   Total de feedbacks: ${stats[0].total_feedbacks}`);
      console.log(`   Nota média geral: ${stats[0].nota_media_geral} ⭐`);
      console.log(`   Usuários que avaliaram: ${stats[0].usuarios_que_avaliaram}`);
      console.log(`   Telas avaliadas: ${stats[0].telas_avaliadas}`);
    } else {
      console.log('   ℹ️  Ainda não há feedbacks no sistema');
      console.log('\n' + '='.repeat(80) + '\n');
      return;
    }

    // 2. FEEDBACKS POR TELA
    console.log('\n' + '-'.repeat(80));
    console.log('📱 FEEDBACKS POR TELA:\n');
    const byPage = await sql`
      SELECT 
        f.page as tela,
        COUNT(*) as total,
        ROUND(AVG(f.rating), 2) as nota_media
      FROM feedbacks f
      GROUP BY f.page
      ORDER BY total DESC
    `;
    
    byPage.forEach((row, i) => {
      const stars = '⭐'.repeat(Math.round(row.nota_media));
      console.log(`   ${i + 1}. ${row.tela}`);
      console.log(`      Total: ${row.total} | Média: ${row.nota_media} ${stars}`);
    });

    // 3. DISTRIBUIÇÃO DE NOTAS
    console.log('\n' + '-'.repeat(80));
    console.log('📊 DISTRIBUIÇÃO DE NOTAS:\n');
    const distribution = await sql`
      SELECT 
        f.rating as nota,
        COUNT(*) as quantidade
      FROM feedbacks f
      GROUP BY f.rating
      ORDER BY f.rating DESC
    `;
    
    distribution.forEach(row => {
      const stars = '⭐'.repeat(row.nota);
      const bar = '█'.repeat(Math.ceil(row.quantidade / 2));
      console.log(`   ${stars} (${row.nota}): ${bar} ${row.quantidade}`);
    });

    // 4. ÚLTIMOS 5 FEEDBACKS
    console.log('\n' + '-'.repeat(80));
    console.log('📝 ÚLTIMOS 5 FEEDBACKS:\n');
    const recent = await sql`
      SELECT 
        u.name as usuario,
        u.email,
        f.page as tela,
        f.rating as nota,
        f.message as mensagem,
        TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') as data_hora
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT 5
    `;
    
    recent.forEach((row, i) => {
      const stars = '⭐'.repeat(row.nota);
      console.log(`   ${i + 1}. ${row.usuario} (${row.email})`);
      console.log(`      Tela: ${row.tela}`);
      console.log(`      Nota: ${stars} (${row.nota}/5)`);
      console.log(`      Mensagem: "${row.mensagem}"`);
      console.log(`      Data: ${row.data_hora}`);
      console.log('');
    });

    // 5. FEEDBACKS COM PROBLEMAS (nota <= 2)
    const problemas = await sql`
      SELECT 
        u.name as usuario,
        f.page as tela,
        f.rating as nota,
        f.message as mensagem
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.rating <= 2
      ORDER BY f.created_at DESC
      LIMIT 3
    `;
    
    if (problemas.length > 0) {
      console.log('-'.repeat(80));
      console.log('⚠️  ATENÇÃO - FEEDBACKS COM PROBLEMAS (Nota 1-2):\n');
      problemas.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.usuario} - ${row.tela}`);
        console.log(`      Nota: ${'⭐'.repeat(row.nota)} (${row.nota}/5)`);
        console.log(`      Problema: "${row.mensagem}"`);
        console.log('');
      });
    }

    // 6. FEEDBACKS EXCELENTES (nota >= 4)
    const excelentes = await sql`
      SELECT 
        u.name as usuario,
        f.page as tela,
        f.rating as nota,
        f.message as mensagem
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.rating >= 4
      ORDER BY f.created_at DESC
      LIMIT 3
    `;
    
    if (excelentes.length > 0) {
      console.log('-'.repeat(80));
      console.log('✨ FEEDBACKS POSITIVOS (Nota 4-5):\n');
      excelentes.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.usuario} - ${row.tela}`);
        console.log(`      Nota: ${'⭐'.repeat(row.nota)} (${row.nota}/5)`);
        console.log(`      Elogio: "${row.mensagem}"`);
        console.log('');
      });
    }

    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao buscar feedbacks:', error.message);
  } finally {
    await sql.end();
  }
}

verFeedbacks();

