# 🎯 Guia: Orçamento e Peso - Auditoria Implementada

## ✅ O QUE FOI IMPLEMENTADO:

### 1. **Orçamento no Banco de Dados** 💰
- ✅ Adicionada coluna `budget` na tabela `pregnancies`
- ✅ Criado endpoint `PUT /api/pregnancies/:id/budget` para salvar orçamento
- ✅ Frontend atualizado para salvar no banco (não mais apenas localStorage)
- ✅ Auditoria implementada: todas as alterações de orçamento são registradas
- ✅ Compatibilidade com PWA: orçamento persiste no banco, não depende do localStorage

### 2. **Auditoria de Peso** ⚖️
- ✅ Adicionado método `getWeightRecordById` no storage
- ✅ Auditoria implementada nas rotas de peso:
  - POST `/api/weight-entries` (criar)
  - PUT `/api/weight-entries/:id` (atualizar)
  - DELETE `/api/weight-entries/:id` (deletar)
- ✅ Queries SQL atualizadas para mostrar alterações de peso

---

## 📋 PASSO A PASSO PARA APLICAR:

### 1. **Execute a Migration SQL** (OBRIGATÓRIO):

```sql
-- Executar no Supabase/PostgreSQL
ALTER TABLE pregnancies
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT 2000.00;
```

Ou execute o arquivo `add-budget-column-pregnancies.sql`

### 2. **Reinicie o Servidor** (OBRIGATÓRIO):

```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 3. **Teste:**

- ✅ Altere o orçamento na lista de compras
- ✅ Adicione/edite/delete um registro de peso
- ✅ Verifique se aparece nos audit logs

---

## 🔍 QUERIES SQL PARA VER AS ALTERAÇÕES:

### Ver alterações de ORÇAMENTO:

```sql
SELECT
  TO_CHAR(ua.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  ua.page AS pagina,
  '✏️ Atualizou' AS o_que_fez,
  'Orçamento: R$ ' || COALESCE(al.new_values->>'budget', al.old_values->>'budget', 'N/A') AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND ua.action <> 'page_view'
  AND al.table_name = 'pregnancies'
  AND al.changed_fields::text LIKE '%budget%'
ORDER BY ua.timestamp DESC;
```

### Ver alterações de PESO:

```sql
SELECT
  TO_CHAR(ua.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  ua.page AS pagina,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou'
    WHEN al.action = 'update' THEN '✏️ Atualizou'
    WHEN al.action = 'delete' THEN '🗑️ Removeu'
  END AS o_que_fez,
  'Peso: ' || COALESCE(al.new_values->>'weight', al.old_values->>'weight', 'N/A') || ' kg' AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND ua.action <> 'page_view'
  AND al.table_name = 'weight_records'
ORDER BY ua.timestamp DESC;
```

### Ver TODAS as alterações (orçamento + peso + outras):

```sql
SELECT
  TO_CHAR(ua.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  ua.page AS pagina,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou'
    WHEN al.action = 'update' THEN '✏️ Atualizou'
    WHEN al.action = 'delete' THEN '🗑️ Removeu'
  END AS o_que_fez,
  CASE
    WHEN al.table_name = 'shopping_items' THEN COALESCE(al.new_values->>'name', al.old_values->>'name', 'item')
    WHEN al.table_name = 'consultations' THEN COALESCE(al.new_values->>'title', al.old_values->>'title', 'consulta')
    WHEN al.table_name = 'birth_plans' THEN 'Plano de Parto'
    WHEN al.table_name = 'diary_entries' THEN 'Entrada no Diário'
    WHEN al.table_name = 'weight_records' THEN 'Peso: ' || COALESCE(al.new_values->>'weight', al.old_values->>'weight', 'N/A') || ' kg'
    WHEN al.table_name = 'pregnancies' THEN 'Orçamento: R$ ' || COALESCE(al.new_values->>'budget', al.old_values->>'budget', 'N/A')
    ELSE al.table_name
  END AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND ua.action <> 'page_view'
ORDER BY ua.timestamp DESC;
```

---

## 🚨 IMPORTANTE:

1. **Migration SQL**: Execute ANTES de reiniciar o servidor
2. **Servidor**: DEVE ser reiniciado para aplicar as mudanças
3. **Dados antigos**: Alterações feitas ANTES da implementação não aparecerão nos logs
4. **PWA**: Agora o orçamento persiste no banco, funcionando mesmo se o localStorage for limpo

---

## 🐛 SE NÃO FUNCIONAR:

1. Verifique se a migration foi executada:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pregnancies' AND column_name = 'budget';
```

2. Verifique os logs do servidor ao fazer alterações
3. Verifique se há erros no console do navegador

---

## 📝 ARQUIVOS MODIFICADOS:

- `shared/schema.ts` - Adicionada coluna `budget` em `pregnancies`
- `server/storage.ts` - Métodos atualizados para retornar objetos
- `server/routes.ts` - Rotas de orçamento e peso com auditoria
- `client/src/pages/shopping-list.tsx` - Frontend usando API em vez de só localStorage
- `add-budget-column-pregnancies.sql` - Migration SQL

