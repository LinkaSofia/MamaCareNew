// Script para testar notificação de consulta AGORA
const baseURL = 'http://localhost:5000';

async function testConsultationNotification() {
  try {
    console.log('🧪 Testando notificação de consulta...');
    
    // Fazer login primeiro
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'SEU_EMAIL_AQUI', // ← COLOQUE SEU EMAIL
        password: 'SUA_SENHA_AQUI' // ← COLOQUE SUA SENHA
      }),
      credentials: 'include'
    });

    if (!loginResponse.ok) {
      throw new Error('Erro ao fazer login');
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login realizado');

    // Testar notificação de consulta
    const notifResponse = await fetch(`${baseURL}/api/notifications/test-consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      credentials: 'include'
    });

    const result = await notifResponse.json();
    console.log('📱 Resultado:', result);

    if (result.success) {
      console.log('✅ NOTIFICAÇÃO ENVIADA COM SUCESSO!');
      console.log('Verifique seu console/navegador para ver a notificação.');
    } else {
      console.log('❌ Falha ao enviar notificação');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testConsultationNotification();

