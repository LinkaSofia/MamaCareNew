# 📝 SQL que está sendo executado para salvar feedback

## 🔍 O SQL que o Drizzle ORM gera quando você salva feedback:

Quando o código TypeScript executa:
```typescript
const feedback = await db.insert(feedbacks).values({
  userId: '5154abdc-375d-4aeb-b7d5-4479070701fa',
  page: '/',  // ⚠️ ESTE É O VALOR QUE DEVE SER SALVO
  rating: 4,
  message: 'Mensagem do feedback',
  imageUrl: null  // ou uma URL/base64
}).returning();
```

O Drizzle ORM gera este SQL:

```sql
INSERT INTO feedbacks (
  user_id,        -- mapeado de userId (camelCase → snake_case)
  page,           -- mapeado de page (mesmo nome)
  rating,         -- mapeado de rating (mesmo nome)
  message,        -- mapeado de message (mesmo nome)
  image_url,      -- mapeado de imageUrl (camelCase → snake_case)
  created_at       -- gerado automaticamente (NOW())
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',  -- userId
  '/',                                      -- ⚠️ PAGE: deve ser '/' para tela inicial
  4,                                        -- rating
  'Mensagem do feedback',                  -- message
  NULL,                                     -- image_url (ou URL/base64)
  NOW()                                     -- created_at
)
RETURNING *;
```

---

## ✅ SQL Manual para Testar:

### 1. Inserir feedback da tela inicial (page = '/'):

```sql
INSERT INTO feedbacks (
  user_id, 
  page,           -- ⚠️ IMPORTANTE: deve ser '/' para tela inicial
  rating, 
  message, 
  image_url,
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',  -- ⚠️ SUBSTITUA PELO SEU USER_ID
  '/',                                      -- ⚠️ TELA INICIAL = '/'
  4,
  'Teste de feedback da tela inicial',
  NULL,
  NOW()
)
RETURNING *;
```

### 2. Verificar se a página foi salva corretamente:

```sql
SELECT 
  id,
  user_id,
  page,                    -- ⚠️ VERIFICAR ESTA COLUNA
  CASE 
    WHEN page = '/' THEN '✅ Tela inicial'
    WHEN page IS NULL OR page = '' THEN '❌ VAZIO/NULL'
    ELSE '✅ ' || page
  END AS status_page,
  rating,
  message,
  image_url,
  created_at
FROM feedbacks
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Verificar feedbacks com página vazia ou NULL:

```sql
SELECT 
  id,
  user_id,
  page,
  rating,
  message,
  created_at
FROM feedbacks
WHERE page IS NULL 
   OR page = '' 
   OR TRIM(page) = ''
ORDER BY created_at DESC;
```

---

## 🔍 Verificar o Schema da Tabela:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feedbacks'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
column_name  | data_type | is_nullable | column_default
-------------|-----------|-------------|----------------
id           | varchar   | NO          | gen_random_uuid()
user_id      | varchar   | NO          | NULL
page         | text      | NO          | NULL          ⚠️ NOT NULL
rating       | integer   | NO          | NULL
message      | text      | NO          | NULL
image_url    | text      | YES         | NULL
created_at   | timestamp | YES         | NOW()
```

---

## ⚠️ PROBLEMA COMUM:

Se a página não está sendo salva, verifique:

### 1. **O frontend está enviando `page`?**

Abra o DevTools → Network → veja o payload do POST `/api/feedback`:
```json
{
  "page": "/",           // ⚠️ DEVE ESTAR PRESENTE
  "rating": 4,
  "message": "...",
  "imageUrl": null
}
```

### 2. **O backend está recebendo `page`?**

Veja os logs do servidor quando enviar feedback. Deve aparecer:
```
💬 Recebendo feedback: { page: '/', ... }
📄 NORMALIZAÇÃO DE PÁGINA (BACKEND): { normalized: '/', ... }
📝 SQL EQUIVALENTE QUE SERÁ EXECUTADO:
  INSERT INTO feedbacks (user_id, page, ...)
  VALUES (..., '/', ...)  -- ⚠️ DEVE MOSTRAR '/' AQUI
```

### 3. **O Drizzle está mapeando corretamente?**

No schema (`shared/schema.ts`):
```typescript
export const feedbacks = pgTable("feedbacks", {
  page: text("page").notNull(),  // ✅ CORRETO
  // ...
});
```

Isso mapeia `page` (TypeScript) → `page` (PostgreSQL) diretamente.

### 4. **A coluna `page` aceita valores vazios?**

A coluna `page` é `NOT NULL`, então **NUNCA** pode ser NULL ou vazio.

Se o valor estiver vazio, o PostgreSQL vai dar erro:
```
ERROR: null value in column "page" violates not-null constraint
```

---

## 🐛 DEBUG: Logs Detalhados

O código agora mostra logs detalhados:

```
📝 SQL EQUIVALENTE QUE SERÁ EXECUTADO:
═══════════════════════════════════════════════════════════
INSERT INTO feedbacks (user_id, page, rating, message, image_url, created_at)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',
  '/',  -- ⚠️ PAGE: length=1, value="/"
  4,
  'Mensagem...',
  NULL,
  NOW()
)
RETURNING *;
═══════════════════════════════════════════════════════════

📋 RESULTADO DO INSERT (RETURNING):
═══════════════════════════════════════════════════════════
{
  "id": "...",
  "userId": "...",
  "page": "/",  // ⚠️ VERIFICAR SE ESTÁ AQUI
  "rating": 4,
  "message": "...",
  "imageUrl": null,
  "createdAt": "..."
}
═══════════════════════════════════════════════════════════
```

---

## ✅ SOLUÇÃO:

Se a página ainda não está sendo salva:

1. **Verifique os logs do servidor** - eles mostram exatamente o SQL que está sendo executado
2. **Verifique o console do navegador** - veja o que está sendo enviado do frontend
3. **Execute o SQL manual** acima para testar se o banco aceita o valor
4. **Verifique se há algum trigger ou constraint** que está modificando o valor:

```sql
-- Verificar constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'feedbacks'::regclass;

-- Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'feedbacks';
```

