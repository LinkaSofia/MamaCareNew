// Script para testar o registro completo via API
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

async function testRegistration() {
    console.log('🧪 Testando registro completo...');
    
    try {
        // Criar FormData
        const formData = new FormData();
        formData.append('email', `teste-completo-${Date.now()}@teste.com`);
        formData.append('password', '123123');
        formData.append('name', 'Teste Completo');
        formData.append('pregnancyDate', '2025-07-15');
        formData.append('pregnancyType', 'lastMenstruation');
        
        // Adicionar uma imagem de teste se existir
        const testImagePath = 'client/public/icons/icon-192x192.png';
        if (fs.existsSync(testImagePath)) {
            formData.append('profileImage', fs.createReadStream(testImagePath));
            console.log('📸 Imagem de teste adicionada');
        } else {
            console.log('⚠️ Imagem de teste não encontrada, testando sem imagem');
        }
        
        // Fazer requisição
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders()
            }
        });
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.text();
        console.log('📊 Resposta:', result);
        
        if (response.ok) {
            console.log('✅ Registro realizado com sucesso!');
            
            // Testar login
            console.log('🔐 Testando login...');
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
            
            console.log('📊 Status do login:', loginResponse.status);
            const loginResult = await loginResponse.text();
            console.log('📊 Resultado do login:', loginResult);
            
            // Testar dados de gravidez
            if (loginResponse.ok) {
                console.log('🤰 Testando dados de gravidez...');
                const pregnancyResponse = await fetch('http://localhost:5000/api/pregnancies/active', {
                    method: 'GET',
                    headers: {
                        'Cookie': loginResponse.headers.get('set-cookie') || ''
                    }
                });
                
                console.log('📊 Status dos dados de gravidez:', pregnancyResponse.status);
                const pregnancyResult = await pregnancyResponse.text();
                console.log('📊 Dados de gravidez:', pregnancyResult);
            }
        } else {
            console.log('❌ Erro no registro:', result);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testRegistration();
