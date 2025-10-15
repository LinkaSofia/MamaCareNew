// Script para testar o registro sem data de nascimento
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testRegistrationNoBirthDate() {
    console.log('🧪 Testando registro sem data de nascimento...');
    
    try {
        // Criar FormData
        const formData = new FormData();
        formData.append('email', `teste-sem-nascimento-${Date.now()}@teste.com`);
        formData.append('password', '123123');
        formData.append('name', 'Teste Sem Nascimento');
        formData.append('pregnancyDate', '2025-07-15');
        formData.append('pregnancyType', 'lastMenstruation');
        
        console.log('📝 Dados enviados:');
        console.log('  - Email:', `teste-sem-nascimento-${Date.now()}@teste.com`);
        console.log('  - Nome: Teste Sem Nascimento');
        console.log('  - Data da gravidez: 2025-07-15');
        console.log('  - Tipo: lastMenstruation');
        console.log('  - Data de nascimento: NÃO ENVIADA (opcional)');
        
        // Fazer requisição
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders()
            }
        });
        
        console.log('📊 Status da resposta:', response.status);
        
        const result = await response.text();
        console.log('📊 Resposta:', result);
        
        if (response.ok) {
            console.log('✅ Registro realizado com sucesso sem data de nascimento!');
            
            // Testar login
            console.log('🔐 Testando login...');
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: `teste-sem-nascimento-${Date.now()}@teste.com`,
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

testRegistrationNoBirthDate();
