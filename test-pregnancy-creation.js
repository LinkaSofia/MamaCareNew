// Script para testar a criação de dados de gravidez
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testPregnancyCreation() {
    console.log('🤰 Testando criação de dados de gravidez...');
    
    try {
        const email = `teste-gravidez-${Date.now()}@teste.com`;
        
        // 1. Registrar usuário
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', '123123');
        formData.append('name', 'Teste Gravidez');
        formData.append('pregnancyDate', '2025-07-15');
        formData.append('pregnancyType', 'lastMenstruation');
        
        console.log('📝 Registrando usuário...');
        const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders()
            }
        });
        
        if (!registerResponse.ok) {
            const error = await registerResponse.text();
            console.error('❌ Erro no registro:', error);
            return;
        }
        
        const registerResult = await registerResponse.json();
        console.log('✅ Usuário registrado:', registerResult.user.email);
        
        // 2. Fazer login
        console.log('🔐 Fazendo login...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: '123123'
            })
        });
        
        if (!loginResponse.ok) {
            const error = await loginResponse.text();
            console.error('❌ Erro no login:', error);
            return;
        }
        
        const loginResult = await loginResponse.json();
        console.log('✅ Login realizado:', loginResult.user.email);
        
        // 3. Verificar dados de gravidez
        console.log('🤰 Verificando dados de gravidez...');
        const pregnancyResponse = await fetch('http://localhost:5000/api/pregnancies/active', {
            method: 'GET',
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie') || ''
            }
        });
        
        console.log('📊 Status dos dados de gravidez:', pregnancyResponse.status);
        const pregnancyResult = await pregnancyResponse.text();
        console.log('📊 Dados de gravidez:', pregnancyResult);
        
        if (pregnancyResponse.ok) {
            const pregnancyData = JSON.parse(pregnancyResult);
            if (pregnancyData.pregnancy) {
                console.log('✅ Dados de gravidez encontrados:');
                console.log('  - ID:', pregnancyData.pregnancy.id);
                console.log('  - Data prevista:', pregnancyData.pregnancy.dueDate);
                console.log('  - Última menstruação:', pregnancyData.pregnancy.lastMenstrualPeriod);
                console.log('  - Ativo:', pregnancyData.pregnancy.isActive);
            } else {
                console.log('❌ Dados de gravidez não encontrados');
            }
        } else {
            console.log('❌ Erro ao obter dados de gravidez');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testPregnancyCreation();
