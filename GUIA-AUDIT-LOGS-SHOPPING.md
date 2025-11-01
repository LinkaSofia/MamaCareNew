# 🔍 Guia: Como Verificar Alterações na Lista de Compras

## ⚠️ PROBLEMA: Audit Logs estão vazios (NULL)

### Possíveis Causas:

1. **Servidor não foi reiniciado** após as mudanças no código
2. **Alterações foram feitas ANTES** da implementação dos audit logs
3. **User ID incorreto** na query SQL

---

## ✅ SOLUÇÃO PASSO A PASSO:

### 1. **REINICIE O SERVIDOR** (CRÍTICO!)

```bash
# Pare o servidor atual (Ctrl+C)
# Depois inicie novamente:
npm run dev
# ou
npm start
```

### 2. **Teste fazendo uma alteração AGORA**

Após reiniciar o servidor:
- ✅ Adicione um novo item na lista de compras
- ✅ Edite um item existente
- ✅ Delete um item

### 3. **Execute a Query de Verificação**

Use a query **5B** do arquivo `ver-alteracoes-shopping-list.sql`:

```sql
-- QUERY DIRETA: Ver APENAS os audit logs (sem JOIN)
SELECT
  al.timestamp,
  al.action,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou: ' || (al.new_values->>'name')
    WHEN al.action = 'update' THEN '✏️ Atualizou: ' || COALESCE(al.new_values->>'name', 'N/A')
    WHEN al.action = 'delete' THEN '🗑️ Removeu: ' || COALESCE(al.old_values->>'name', 'N/A')
  END AS resumo,
  al.old_values,
  al.new_values,
  al.changed_fields,
  al.record_id
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ SEU USER_ID CORRETO
  AND al.table_name = 'shopping_items'
ORDER BY al.timestamp DESC;
```

### 4. **Se ainda estiver vazio, execute a verificação completa:**

Use o arquivo `verificar-audit-logs.sql` para diagnosticar:

```sql
-- Verificar se existe ALGUM audit log para shopping_items
SELECT 
  COUNT(*) AS total_logs_shopping,
  COUNT(DISTINCT user_id) AS usuarios_com_logs
FROM audit_logs
WHERE table_name = 'shopping_items';
```

**Se retornar `0`, significa que:**
- ❌ O servidor não foi reiniciado
- ❌ Nenhuma alteração foi feita após a implementação
- ❌ Há um erro no código (verificar logs do servidor)

---

## 🔧 Verificar se o Código está Funcionando:

### Verifique os logs do servidor ao fazer uma alteração:

Quando você adicionar/editar/deletar um item, você DEVE ver no console do servidor:

```
🛒 Creating shopping item...
✅ Shopping item created: [id]
📝 Creating audit log: { action: 'create', tableName: 'shopping_items', ... }
🔍 Audit logged: create on shopping_items record [id] by user [userId]
```

**Se você NÃO vê essas mensagens:**
- ❌ O servidor não foi reiniciado
- ❌ Há um erro silencioso (verificar logs de erro)

---

## 📋 Checklist Rápido:

- [ ] Servidor foi reiniciado após as mudanças?
- [ ] Fez alguma alteração na shopping-list DEPOIS de reiniciar?
- [ ] Está usando o user_id CORRETO (`e1e2288f-e96c-40ac-bc3a-5fab0e35b91c`)?
- [ ] Verificou os logs do servidor para ver se há erros?
- [ ] Executou a query de verificação (query 5B)?

---

## 🚨 Se NADA funcionar:

Execute esta query para verificar se a tabela `audit_logs` existe e está configurada:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_logs';

-- Ver se há QUALQUER registro na tabela (qualquer usuário)
SELECT COUNT(*) as total_registros
FROM audit_logs;
```

**Se a tabela não existir ou estiver vazia, há um problema maior no código.**

