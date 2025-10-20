# 🔔 DEBUG COMPLETO - Notificações de Consultas

## ⚡ TESTE IMEDIATO - FAÇA AGORA!

### **No Console do Navegador (F12):**

```javascript
// 1️⃣ TRIGGER MANUAL - Força verificação AGORA
fetch('/api/notifications/trigger-check', { method: 'POST' })
  .then(r => r.json())
  .then(result => {
    console.log('✅ Trigger executado:', result);
    alert('Verificação executada! Veja os logs do SERVIDOR (terminal)!');
  });
```

**IMPORTANTE:** Os logs vão aparecer no **TERMINAL DO SERVIDOR**, não no navegador!

---

## 📊 Ver Diagnóstico Completo

```javascript
// 2️⃣ DEBUG - Ver quais consultas seriam notificadas
fetch('/api/notifications/debug-consultations')
  .then(r => r.json())
  .then(data => {
    console.log('='.repeat(80));
    console.log('🔍 DIAGNÓSTICO COMPLETO');
    console.log('='.repeat(80));
    
    console.log('\n⏰ JANELA DE TEMPO:');
    console.log('  Agora:', data.now);
    console.log('  Até:', data.in24Hours);
    console.log('  Timezone:', data.timezone);
    
    console.log('\n📅 TODAS AS CONSULTAS FUTURAS:');
    if (data.allFutureConsultations.length === 0) {
      console.log('  ❌ Nenhuma consulta futura encontrada!');
    } else {
      data.allFutureConsultations.forEach((c, i) => {
        console.log(`  ${i+1}. ${c.title} - ${c.date}`);
        console.log(`     Completa: ${c.completed ? 'SIM' : 'NÃO'}`);
      });
    }
    
    console.log('\n🔔 CONSULTAS QUE DEVERIAM SER NOTIFICADAS:');
    if (data.consultationsToNotify.length === 0) {
      console.log('  ❌ Nenhuma consulta para notificar agora!');
      console.log('  Razões possíveis:');
      console.log('    - Consulta fora da janela de 24h');
      console.log('    - Já foi notificada');
      console.log('    - Está marcada como completa');
    } else {
      data.consultationsToNotify.forEach((c, i) => {
        console.log(`  ${i+1}. ${c.title} - ${c.date}`);
      });
    }
    
    console.log('\n✅ NOTIFICAÇÕES JÁ ENVIADAS:');
    if (data.sentNotifications.length === 0) {
      console.log('  Nenhuma notificação enviada ainda');
    } else {
      data.sentNotifications.forEach((n, i) => {
        console.log(`  ${i+1}. ${n.title}`);
        console.log(`     Consulta: ${n.consultation_date}`);
        console.log(`     Enviada: ${n.sent ? 'SIM' : 'NÃO'}`);
        console.log(`     Quando: ${n.sent_at || 'Não enviada'}`);
      });
    }
    
    console.log('\n📊 RESUMO:');
    console.log('  Total futuras:', data.debug.totalFuture);
    console.log('  Para notificar:', data.debug.toNotifyCount);
    console.log('  Já enviadas:', data.debug.alreadySent);
    console.log('='.repeat(80));
  });
```

---

## 🎯 O QUE VERIFICAR

### **1. Logs do Servidor (TERMINAL)**

Após executar o trigger, você DEVE ver no terminal:

```
================================================================================
📅 INICIANDO VERIFICAÇÃO DE NOTIFICAÇÕES DE CONSULTAS
⏰ Hora atual: 2025-10-20T23:00:00.000Z (20/10/2025, 20:00:00)
================================================================================

📊 RESULTADO DA BUSCA:
   Total de consultas encontradas: 1

📋 CONSULTAS A SEREM NOTIFICADAS:

   1. Consulta ID: xxxx-xxxx-xxxx
      Usuário: xxxx
      Título: Teste
      Data: 2025-10-21T22:58:00.000Z
      Local: Não informado

────────────────────────────────────────────────────────────────────────────────
🔔 PROCESSANDO: Teste (ID: xxxx)
   📝 Criando registro de notificação...
   📨 Mensagem preparada: { title: '...', body: '...', ... }
   🚀 Enviando notificação para usuário xxxx...
   ✅ Notificação ENVIADA com sucesso!
   ✅ Marcando notificação como enviada (ID: xxxx)

================================================================================
✅ VERIFICAÇÃO DE NOTIFICAÇÕES CONCLUÍDA
================================================================================
```

### **2. Se aparecer "NENHUMA CONSULTA PARA NOTIFICAR"**

Possíveis razões:

#### ❌ **Consulta fora da janela de 24h**
- Agora: 20/10/2025 20:00
- Janela: 20/10 20:00 até 21/10 20:00
- Sua consulta: 21/10 19:58 ✅ (DENTRO!)

Se sua consulta está dentro e mesmo assim não aparece:

#### ❌ **Consulta já foi notificada**
- Verificar no debug: `sentNotifications`
- Se aparecer lá, é porque já foi enviada

#### ❌ **Consulta marcada como 'completed = true'**
- Verificar no debug: `allFutureConsultations`
- Se `completed: true`, não será notificada

---

## 🔧 CHECKLIST DE PROBLEMAS

### **No Servidor:**

- [ ] Cron job está rodando? (Veja logs na inicialização: "✅ Notification scheduler started")
- [ ] Horário do servidor está correto? (Timezone: America/Sao_Paulo)
- [ ] Query SQL está encontrando a consulta?

### **No Cliente:**

- [ ] Permissões de notificação habilitadas?
- [ ] Service Worker registrado?
- [ ] Push subscription criada?

Para verificar no cliente:

```javascript
// Verificar permissões
Notification.permission // Deve ser "granted"

// Verificar service worker
navigator.serviceWorker.getRegistrations().then(console.log)

// Verificar subscription
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(console.log)
)
```

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### **"Notificação não chega no celular"**

**Causa:** Push notifications só funcionam via HTTPS

**Solução:**
- ❌ NÃO: `http://localhost:5000`
- ✅ SIM: `https://mamacare-w5ir.onrender.com`

### **"Found 0 consultations to notify"**

**Causa:** Consulta já foi notificada ou está fora da janela

**Solução:**
1. Criar nova consulta para EXATAMENTE 24h a partir de agora
2. Rodar o trigger manual
3. Verificar logs do servidor

### **"Usuário sem subscription de push"**

**Causa:** Usuário não aceitou permissões

**Solução:**
1. Ir em Configurações do navegador → Notificações
2. Permitir notificações para o site
3. Recarregar o app
4. Aceitar quando pedir permissão

---

## 📱 TESTE FINAL

1. **Execute o trigger manual** (comando 1️⃣ acima)
2. **Olhe o TERMINAL DO SERVIDOR**
3. **Me envie a saída completa dos logs**

Os logs vão me dizer EXATAMENTE o que está acontecendo!

---

## ⏰ Cron Job

O cron roda **automaticamente** a cada hora:
- 19:00, 20:00, 21:00, 22:00, etc.

Se você cadastrou a consulta DEPOIS das 19:00, a próxima verificação será às **20:00** (topo da próxima hora).

Para não esperar, **USE O TRIGGER MANUAL!** 🔥

