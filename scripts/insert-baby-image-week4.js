// Script para inserir imagem do bebê para a semana 4
import fetch from 'node-fetch';

async function insertBabyImageWeek4() {
  try {
    console.log('🖼️ Inserindo imagem do bebê para a semana 4...');
    
    // URL da imagem da semana 4 (usando a imagem local que está no assets)
    const imageUrl = '/attached_assets/4.png';
    
    const response = await fetch('http://localhost:5000/api/baby-development/insert-baby-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        week: 4,
        imageUrl: imageUrl
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Imagem inserida com sucesso!');
      console.log('Resultado:', result);
    } else {
      console.error('❌ Erro ao inserir imagem:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

insertBabyImageWeek4();
