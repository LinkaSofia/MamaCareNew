# 🔍 Guia de Debug: Por que o peso não aparece nos audit logs?

## ✅ Verificações Rápidas:

### 1. **Servidor foi reiniciado?** ⚠️ CRÍTICO
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 2. **Execute a Query de Diagnóstico:**

Use o arquivo `verificar-audit-logs-peso.sql` para verificar:

```sql
-- Ver se há QUALQUER audit log de peso
SELECT 
  COUNT(*) AS total_logs_peso,
  MIN(timestamp) AS primeiro_log,
  MAX(timestamp) AS ultimo_log
FROM audit_logs
WHERE table_name = 'weight_records';
```

**Se retornar 0:**
- ❌ Servidor não foi reiniciado
- ❌ Alteração foi feita ANTES da implementação
- ❌ Há erro silencioso (ver logs do servidor)

### 3. **Verifique os Logs do Servidor:**

Quando você **atualizar** um peso, deve aparecer no console do servidor:

```
📊 Weight entry update request: [id] ...
📊 Processed update data: ...
📝 Iniciando auditoria de peso...
📝 Dados antigos: { weight: 65.5, ... }
📝 Dados novos: { weight: 66.0, ... }
✅ Auditoria de peso registrada com sucesso!
🔍 Audit logged: update on weight_records record [id] by user [userId]
```

**Se você NÃO vê essas mensagens:**
- ❌ O servidor não foi reiniciado
- ❌ A requisição não está chegando ao servidor
- ❌ Há um erro antes da auditoria

### 4. **Verifique se o registro existe:**

```sql
-- Ver os últimos registros de peso do seu usuário
SELECT 
  wr.id,
  wr.weight,
  wr.date,
  wr.created_at
FROM weight_records wr
INNER JOIN pregnancies p ON p.id = wr.pregnancy_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY wr.created_at DESC
LIMIT 10;
```

---

## 🐛 Problemas Comuns e Soluções:

### Problema 1: Nenhum audit log aparece

**Causa:** Servidor não reiniciado ou alteração feita antes da implementação

**Solução:**
1. Reinicie o servidor
2. Faça uma NOVA alteração de peso
3. Verifique novamente

### Problema 2: Logs aparecem mas não na query com JOIN

**Causa:** Janela de tempo muito curta (15 segundos)

**Solução:** Use esta query sem JOIN primeiro:

```sql
-- Ver DIRETAMENTE os audit logs (sem JOIN)
SELECT
  timestamp,
  action,
  old_values->>'weight' AS peso_antes,
  new_values->>'weight' AS peso_depois,
  changed_fields
FROM audit_logs
WHERE table_name = 'weight_records'
  AND user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY timestamp DESC;
```

Se isso retornar dados, o problema é no JOIN (janela de tempo). Use a query acima sem o JOIN.

### Problema 3: Erro no console do servidor

**Verifique:**
- Se há erros de conexão com o banco
- Se a tabela `audit_logs` existe
- Se o `user_id` está correto

**Execute:**
```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'audit_logs'
);
```

---

## ✅ Query Corrigida (Mais Tolerante):

Se a query com JOIN não funcionar, use esta versão mais tolerante (30 segundos):

```sql
SELECT
  TO_CHAR(ua.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  ua.page AS pagina,
  '✏️ Atualizou' AS o_que_fez,
  'Peso: ' || COALESCE(al.new_values->>'weight', al.old_values->>'weight', 'N/A') || ' kg' AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '30 seconds' AND ua.timestamp + INTERVAL '30 seconds'
WHERE ua.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND ua.action <> 'page_view'
  AND al.table_name = 'weight_records'
ORDER BY ua.timestamp DESC;
```

Ou ainda melhor, use SEM JOIN para ver diretamente:

```sql
-- Ver DIRETO os audit logs (mais confiável)
SELECT
  TO_CHAR(timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  action AS o_que_fez,
  'Peso: ' || COALESCE(new_values->>'weight', old_values->>'weight', 'N/A') || ' kg' AS item_afetado,
  changed_fields AS o_que_mudou,
  old_values AS antes,
  new_values AS depois
FROM audit_logs
WHERE table_name = 'weight_records'
  AND user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY timestamp DESC;
```

---

## 📋 Checklist:

- [ ] Servidor foi reiniciado?
- [ ] Fez uma alteração NOVA de peso DEPOIS de reiniciar?
- [ ] Verificou os logs do servidor para ver mensagens de auditoria?
- [ ] Executou a query de diagnóstico (`verificar-audit-logs-peso.sql`)?
- [ ] Tentou a query DIRETA (sem JOIN)?

---

## 🚨 Se NADA funcionar:

1. Execute todas as queries de diagnóstico do arquivo `verificar-audit-logs-peso.sql`
2. Verifique se há algum erro no console do servidor
3. Verifique se o `user_id` está correto
4. Teste criando um NOVO registro de peso (não apenas atualizando)

