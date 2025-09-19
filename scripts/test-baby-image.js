// Script simples para testar inserção de imagem do bebê
import fetch from 'node-fetch';

async function testBabyImage() {
  try {
    console.log('🖼️ Testando inserção de imagem do bebê...');
    
    // Primeiro, vamos verificar se o servidor está rodando
    const healthResponse = await fetch('http://localhost:5000/api/public/baby-development/comparisons');
    console.log('Status do servidor:', healthResponse.status);
    
    if (healthResponse.ok) {
      // Tentar inserir a imagem
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
      
      console.log('Status da resposta:', response.status);
      const text = await response.text();
      console.log('Resposta:', text);
      
      if (response.ok) {
        const result = JSON.parse(text);
        console.log('✅ Sucesso:', result);
      } else {
        console.log('❌ Erro na resposta');
      }
    } else {
      console.log('❌ Servidor não está rodando');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testBabyImage();
