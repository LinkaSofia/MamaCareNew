# 🔧 Adicionar Coluna `essential` no Supabase

## Como adicionar a coluna manualmente:

1. **Acesse o Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto MamaCare

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute este SQL:**

```sql
-- Adicionar coluna essential na tabela shopping_items
ALTER TABLE shopping_items 
ADD COLUMN IF NOT EXISTS essential BOOLEAN DEFAULT false;
```

4. **Clique em "Run"** (ou pressione Ctrl+Enter)

5. **Verifique se foi criada:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'shopping_items'
ORDER BY ordinal_position;
```

## ✅ Pronto!

Depois de adicionar a coluna, a lista de compras vai funcionar normalmente.

