// Script simples para atualizar imagens dos artigos
const { Pool } = require('@neondatabase/serverless');

// URLs de imagens baseadas nos títulos dos artigos
const articleImages = {
  // Candidíase e ginecologia
  'candidíase': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'ginecologista': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'consulta': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'médico': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  
  // Guia da gestante e parto
  'guia da gestante': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  'parto': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
  'adequado': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
  
  // Gravidez e gestante
  'gravidez': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=300&fit=crop&crop=center',
  'gestante': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  'saúde': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  'cuidados': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  
  // Vídeos
  'vídeo': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'papo': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
};

function getArticleImage(title, type) {
  const titleLower = title.toLowerCase();
  
  // Procurar por palavras-chave no título
  for (const [keyword, imageUrl] of Object.entries(articleImages)) {
    if (titleLower.includes(keyword)) {
      return imageUrl;
    }
  }
  
  // Imagem padrão baseada no tipo
  if (type === 'pdf') {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center';
  } else if (type === 'video') {
    return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center';
  }
  
  // Imagem genérica de gravidez
  return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center';
}

async function updateArticleImages() {
  let pool;
  
  try {
    console.log('🖼️ Iniciando atualização de imagens dos artigos...');
    
    // Configurar pool de conexão
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL não encontrada. Usando URL de exemplo...');
      // Para teste, vamos apenas mostrar as imagens que seriam usadas
      console.log('\n📋 Imagens que seriam aplicadas:');
      console.log('1. Candidíase na Gravidez:', getArticleImage('Candidíase na Gravidez', 'video'));
      console.log('2. Guia da Gestante:', getArticleImage('Guia da Gestante', 'pdf'));
      return;
    }
    
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Buscar todos os artigos
    const allArticles = await pool.query('SELECT * FROM articles ORDER BY week, created_at');
    
    console.log(`📋 Encontrados ${allArticles.rows.length} artigos`);
    
    for (const article of allArticles.rows) {
      console.log(`\n📄 Processando: "${article.title}"`);
      
      // Se já tem imagem, pular
      if (article.image) {
        console.log('   ✅ Já possui imagem, pulando...');
        continue;
      }
      
      // Gerar imagem baseada no título
      const imageUrl = getArticleImage(article.title, article.type || 'article');
      
      // Atualizar o artigo com a imagem
      await pool.query(
        'UPDATE articles SET image = $1 WHERE id = $2',
        [imageUrl, article.id]
      );
      
      console.log(`   ✅ Imagem atualizada: ${imageUrl}`);
    }
    
    console.log('\n🎉 Atualização de imagens concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar imagens:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar o script
updateArticleImages();

