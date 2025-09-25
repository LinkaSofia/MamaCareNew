// Script para atualizar artigos com categorias baseadas nos títulos
const { Pool } = require('@neondatabase/serverless');

// Mapeamento de palavras-chave para categorias
const categoryMapping = {
  'candidíase': 'gestacao',
  'ginecologista': 'gestacao',
  'consulta': 'gestacao',
  'médico': 'gestacao',
  'gestação': 'gestacao',
  'gestante': 'gestacao',
  'parto': 'preparacao-parto',
  'adequado': 'preparacao-parto',
  'guia': 'gestacao',
  'orientações': 'gestacao',
  'alimentação': 'saude-bem-estar',
  'nutrição': 'saude-bem-estar',
  'exercício': 'saude-bem-estar',
  'atividade': 'saude-bem-estar',
  'saúde': 'saude-bem-estar',
  'bem-estar': 'saude-bem-estar',
  'amamentação': 'pos-parto',
  'pós-parto': 'pos-parto',
  'puerpério': 'pos-parto',
  'bebê': 'cuidados-bebe',
  'cuidados': 'cuidados-bebe',
  'família': 'rede-apoio',
  'apoio': 'rede-apoio',
  'direitos': 'rede-apoio'
};

function getCategoryFromTitle(title) {
  const titleLower = title.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (titleLower.includes(keyword)) {
      return category;
    }
  }
  
  return 'gestacao'; // Default
}

async function updateArticlesCategories() {
  let pool;
  
  try {
    console.log('🏷️ Iniciando atualização de categorias dos artigos...');
    
    // Configurar pool de conexão
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL não encontrada. Mostrando categorias que seriam aplicadas:');
      console.log('\n📋 Exemplos de categorização:');
      console.log('1. "Papo com Gineco sobre Candidíase na Gravidez" → gestacao');
      console.log('2. "GUIA DA GESTANTE: PASSO A PASSO PARA UM PARTO ADEQUADO" → preparacao-parto');
      console.log('3. "Orientações Gerais Sobre a Gestação" → gestacao');
      return;
    }
    
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Buscar todos os artigos
    const allArticles = await pool.query(`
      SELECT id, title, week, video_url, image, source, type, description, categoria
      FROM articles 
      WHERE is_active IS NULL OR is_active = true
      ORDER BY week, created_at
    `);
    
    console.log(`📋 Encontrados ${allArticles.rows.length} artigos`);
    
    for (const article of allArticles.rows) {
      console.log(`\n📄 Processando: "${article.title}"`);
      
      // Se já tem categoria, pular
      if (article.categoria) {
        console.log('   ✅ Já possui categoria, pulando...');
        continue;
      }
      
      // Gerar categoria baseada no título
      const categoria = getCategoryFromTitle(article.title);
      
      // Atualizar o artigo com a categoria
      await pool.query(
        'UPDATE articles SET categoria = $1 WHERE id = $2',
        [categoria, article.id]
      );
      
      console.log(`   ✅ Categoria atualizada: ${categoria}`);
    }
    
    console.log('\n🎉 Atualização de categorias concluída!');
    
    // Mostrar resultado final
    const updatedArticles = await pool.query(`
      SELECT id, title, week, categoria
      FROM articles 
      WHERE is_active IS NULL OR is_active = true
      ORDER BY categoria, week
    `);
    
    console.log('\n📋 Artigos com categorias:');
    const categories = {};
    updatedArticles.rows.forEach(article => {
      if (!categories[article.categoria]) {
        categories[article.categoria] = [];
      }
      categories[article.categoria].push(article);
    });
    
    Object.entries(categories).forEach(([category, articles]) => {
      console.log(`\n🏷️ ${category.toUpperCase()}:`);
      articles.forEach(article => {
        console.log(`   • ${article.title} (Semana ${article.week})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar categorias:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar o script
updateArticlesCategories();










