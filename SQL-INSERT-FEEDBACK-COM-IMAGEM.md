# 📝 SQL para Inserir Feedback com Imagem

## 🔍 O SQL que o Drizzle ORM gera:

Quando você executa este código no backend:

```typescript
const feedback = await db.insert(feedbacks).values({
  userId: '5154abdc-375d-4aeb-b7d5-4479070701fa',
  page: '/dashboard',
  rating: 4,
  message: 'Teste de feedback com imagem',
  imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' // ou URL
}).returning();
```

O Drizzle ORM gera este SQL:

```sql
INSERT INTO feedbacks (
  user_id,        -- mapeado de userId
  page,           -- mapeado de page
  rating,         -- mapeado de rating
  message,        -- mapeado de message
  image_url,      -- mapeado de imageUrl (⚠️ ATENÇÃO: snake_case no banco!)
  created_at      -- gerado automaticamente (NOW())
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',
  '/dashboard',
  4,
  'Teste de feedback com imagem',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',  -- ⚠️ AQUI DEVE ESTAR A IMAGEM
  NOW()
)
RETURNING *;
```

---

## ✅ SQL Manual para Testar:

### 1. Inserir feedback COM imagem (base64):

```sql
INSERT INTO feedbacks (
  user_id, 
  page, 
  rating, 
  message, 
  image_url,
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',  -- ⚠️ SUBSTITUA PELO SEU USER_ID
  '/dashboard',
  4,
  'Teste manual com imagem base64',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',  -- ⚠️ COLE AQUI O BASE64 COMPLETO
  NOW()
)
RETURNING *;
```

### 2. Inserir feedback COM imagem (URL do Supabase):

```sql
INSERT INTO feedbacks (
  user_id, 
  page, 
  rating, 
  message, 
  image_url,
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',
  '/dashboard',
  5,
  'Teste manual com URL do Supabase',
  'https://yrpbjxhtsnaxlfsazall.supabase.co/storage/v1/object/public/diary-attachments/uploads/2025-11-18/1763503162142-fu8grsnh05l.png',
  NOW()
)
RETURNING *;
```

### 3. Inserir feedback SEM imagem (NULL):

```sql
INSERT INTO feedbacks (
  user_id, 
  page, 
  rating, 
  message, 
  image_url,  -- Será NULL
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',
  '/dashboard',
  3,
  'Teste manual sem imagem',
  NULL,  -- ⚠️ NULL quando não tem imagem
  NOW()
)
RETURNING *;
```

---

## 🔍 Verificar se a imagem foi salva:

```sql
SELECT 
  id,
  user_id,
  page,
  rating,
  message,
  image_url,  -- ⚠️ VERIFICAR ESTA COLUNA
  CASE 
    WHEN image_url IS NULL THEN '❌ NULL (sem imagem)'
    WHEN image_url LIKE 'data:%' THEN '✅ Base64 (' || LENGTH(image_url) || ' caracteres)'
    WHEN image_url LIKE 'http%' THEN '✅ URL: ' || SUBSTRING(image_url, 1, 50) || '...'
    ELSE '✅ Outro formato: ' || SUBSTRING(image_url, 1, 50) || '...'
  END AS status_imagem,
  LENGTH(image_url) AS tamanho_imagem,
  created_at
FROM feedbacks
ORDER BY created_at DESC
LIMIT 10;
```

---

## ⚠️ PROBLEMA COMUM:

Se a imagem não está sendo salva, verifique:

1. **O frontend está enviando `imageUrl`?**
   - Abra o DevTools → Network → veja o payload do POST `/api/feedback`
   - Deve ter: `{ page, rating, message, imageUrl: "..." }`

2. **O backend está recebendo `imageUrl`?**
   - Veja os logs do servidor quando enviar feedback
   - Deve aparecer: `📤 Dados recebidos para inserção: { imageUrl: "..." }`

3. **A coluna `image_url` existe no banco?**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'feedbacks' AND column_name = 'image_url';
   ```
   - Se não retornar nada, execute: `ALTER TABLE feedbacks ADD COLUMN image_url TEXT;`

4. **O Drizzle está mapeando corretamente?**
   - No schema: `imageUrl: text("image_url")` ✅
   - Isso mapeia `imageUrl` (TypeScript) → `image_url` (PostgreSQL)

---

## 🐛 DEBUG:

Adicione estes logs no código para ver o que está acontecendo:

```typescript
// No backend (server/routes.ts):
console.log("📤 Dados recebidos:", req.body);
console.log("📤 imageUrl recebido:", req.body.imageUrl ? "SIM" : "NÃO");
console.log("📤 imageUrl length:", req.body.imageUrl?.length || 0);

const insertData = {
  userId,
  page,
  rating,
  message,
  imageUrl: req.body.imageUrl || null
};

console.log("📝 Dados para inserção:", {
  ...insertData,
  imageUrl: insertData.imageUrl ? insertData.imageUrl.substring(0, 50) + "..." : "NULL"
});
```

---

## 📋 Estrutura da Tabela:

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

Resultado esperado:
- `id` (varchar, NOT NULL)
- `user_id` (varchar, NOT NULL)
- `page` (text, NOT NULL)
- `rating` (integer, NOT NULL)
- `message` (text, NOT NULL)
- `image_url` (text, NULLABLE) ⚠️ **ESTA COLUNA DEVE EXISTIR**
- `created_at` (timestamp, NULLABLE)

