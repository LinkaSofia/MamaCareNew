// Script para testar a API de dados de gravidez
import fetch from 'node-fetch';

async function testPregnancyAPI() {
    console.log('🤰 Testando API de dados de gravidez...');
    
    try {
        // Primeiro, fazer login para obter a sessão
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'teste-completo@teste.com',
                password: '123123'
            })
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Erro no login:', await loginResponse.text());
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login realizado:', loginData.user.email);
        
        // Extrair cookies da resposta
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('🍪 Cookies:', cookies);
        
        // Testar API de dados de gravidez
        const pregnancyResponse = await fetch('http://localhost:5000/api/pregnancies/active', {
            method: 'GET',
            headers: {
                'Cookie': cookies || '',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status da API de gravidez:', pregnancyResponse.status);
        console.log('📊 Headers da resposta:', Object.fromEntries(pregnancyResponse.headers.entries()));
        
        const pregnancyData = await pregnancyResponse.text();
        console.log('📊 Dados de gravidez:', pregnancyData);
        
        if (pregnancyResponse.ok) {
            const data = JSON.parse(pregnancyData);
            if (data.pregnancy) {
                console.log('✅ Dados de gravidez encontrados:');
                console.log('  - ID:', data.pregnancy.id);
                console.log('  - Data prevista:', data.pregnancy.dueDate);
                console.log('  - Última menstruação:', data.pregnancy.lastMenstrualPeriod);
                console.log('  - Ativo:', data.pregnancy.isActive);
            } else {
                console.log('❌ Nenhum dado de gravidez encontrado');
            }
        } else {
            console.log('❌ Erro na API de gravidez:', pregnancyData);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testPregnancyAPI();
