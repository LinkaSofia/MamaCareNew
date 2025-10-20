# 🔔 Como Testar Notificações de Consultas

## Sistema Implementado

O sistema de notificações de consultas funciona da seguinte forma:

### ⏰ Quando as notificações são enviadas:
- **A cada hora** (topo da hora: 00:00, 01:00, 02:00, etc.)
- O sistema verifica consultas agendadas para **daqui a 24 horas**
- Envia notificação para o celular do usuário

### 📋 Requisitos para receber notificações:

1. ✅ Ter uma consulta agendada para **daqui a 24 horas** (±1 hora)
2. ✅ A consulta não pode estar marcada como "completa"
3. ✅ Não ter recebido notificação dessa consulta ainda
4. ✅ Ter permissão de notificações habilitada no navegador/app

---

## 🧪 Como Testar MANUALMENTE

### Opção 1: Testar via API (Recomendado)

```bash
# No terminal, rode:
curl -X POST http://localhost:5000/api/notifications/test-consultation \
  -H "Content-Type: application/json" \
  -b "cookies.txt"
```

OU use o Postman/Insomnia com:
- **Method**: POST
- **URL**: `http://localhost:5000/api/notifications/test-consultation`
- **Headers**: Incluir o cookie de sessão

### Opção 2: Criar uma consulta para testar

1. **Crie uma consulta** na tela de Consultas
2. **Configure a data** para exatamente **24 horas a partir de agora**
   - Exemplo: Se agora são 19:30 de 17/10, crie para 19:30 de 18/10
3. **Aguarde até o topo da próxima hora**
   - O cron job roda a cada hora no minuto :00
   - Exemplo: Se agora são 19:45, aguarde até 20:00

---

## 🔍 Verificar Logs do Servidor

No terminal onde o servidor está rodando, procure por:

```
📅 Checking for upcoming consultations (hourly)
📅 Starting consultation notifications check...
📅 Found X consultations to notify
✅ Scheduled notification for consultation [ID]
✅ Consultation notifications sent successfully
```

Se aparecer `Found 0 consultations to notify`, significa que:
- ❌ Não há consultas para daqui a 24 horas, OU
- ❌ A consulta já foi notificada, OU
- ❌ A consulta está marcada como completa

---

## 🐛 Problemas Comuns

### ❌ "Não estou recebendo notificações"

**Verificações:**

1. **Permissão de notificações**
   - Abra o navegador e vá em Configurações → Notificações
   - Verifique se o site tem permissão

2. **Horário da consulta**
   - A consulta DEVE estar entre 23h e 25h a partir de agora
   - Exemplo: Agora 17/10 19:30 → Consulta 18/10 19:00 a 20:30

3. **Verificar tabela de notificações**
   ```sql
   SELECT * FROM consultation_notifications 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

4. **Verificar consultas**
   ```sql
   SELECT id, title, date, completed 
   FROM consultations 
   WHERE date > NOW() 
   ORDER BY date;
   ```

### ❌ "O cron job não está rodando"

No arquivo `server/routes.ts`, linha 30, o scheduler é iniciado:
```typescript
NotificationScheduler.start();
```

Verifique os logs ao iniciar o servidor:
```
🚀 Starting notification scheduler...
✅ Notification scheduler started successfully
```

---

## 📱 Notificações Push no Celular

Para receber notificações no **celular físico**:

1. **Acesse o app via HTTPS** (não localhost)
   - Use a URL do Render: `mamacare-w5ir.onrender.com`
   - Localhost NÃO suporta notificações push em produção

2. **Aceite as permissões** quando solicitado

3. **Adicione à tela inicial** (PWA)
   - Isso melhora a entrega de notificações

---

## 🎯 Teste Rápido Agora

Execute este comando no terminal do servidor para forçar uma verificação:

```javascript
// No console do Node.js ou criar um arquivo test-notification.js:
const { NotificationScheduler } = require('./server/notificationScheduler');
NotificationScheduler.sendTestConsultationNotification();
```

Ou adicione esta rota temporária em `server/routes.ts`:

```typescript
app.get("/api/test-notif-now", async (req, res) => {
  await NotificationScheduler.sendTestConsultationNotification();
  res.json({ message: "Notification test triggered!" });
});
```

Depois acesse: `http://localhost:5000/api/test-notif-now`

---

## ✅ Checklist Final

- [ ] Servidor está rodando
- [ ] Scheduler iniciou com sucesso (verificar logs)
- [ ] Permissão de notificações aceita no navegador
- [ ] Consulta criada para daqui a 24h (±1h)
- [ ] Aguardou até o topo da hora (:00)
- [ ] Verificou os logs do servidor

---

## 📞 Ainda não funciona?

Se após todas essas verificações você ainda não recebe notificações:

1. **Envie os logs do servidor** quando o cron roda
2. **Envie o resultado** da query SQL das consultas
3. **Envie o resultado** da query SQL das notificações
4. **Confirme** que está usando HTTPS (não localhost) no celular

O sistema está 100% funcional no código, então o problema provavelmente é:
- ⏰ Horário da consulta não está no intervalo de 24h
- 🔔 Permissões de notificação bloqueadas
- 🌐 Usando localhost ao invés de HTTPS no celular

