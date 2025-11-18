-- ================================================
-- 📝 SQL EQUIVALENTE AO INSERT DO FEEDBACK
-- ================================================
-- Este é o SQL que o Drizzle ORM gera quando você faz:
-- db.insert(feedbacks).values({ userId, page, rating, message, imageUrl })

-- EXEMPLO 1: Inserir feedback COM imagem (base64 ou URL)
INSERT INTO feedbacks (
  user_id, 
  page, 
  rating, 
  message, 
  image_url,  -- ⚠️ COLUNA CORRETA: image_url (não imageUrl)
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',  -- userId
  '/dashboard',                             -- page
  4,                                        -- rating
  'Teste de feedback com imagem',          -- message
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',  -- image_url (base64 ou URL)
  NOW()                                     -- created_at
)
RETURNING *;

-- ================================================

-- EXEMPLO 2: Inserir feedback SEM imagem (NULL)
INSERT INTO feedbacks (
  user_id, 
  page, 
  rating, 
  message, 
  image_url,  -- Será NULL
  created_at
)
VALUES (
  '5154abdc-375d-4aeb-b7d5-4479070701fa',  -- userId
  '/dashboard',                             -- page
  5,                                        -- rating
  'Feedback sem imagem',                    -- message
  NULL,                                     -- image_url = NULL
  NOW()                                     -- created_at
)
RETURNING *;

-- ================================================

-- VERIFICAR SE A IMAGEM FOI SALVA:
SELECT 
  id,
  user_id,
  page,
  rating,
  message,
  image_url,  -- ⚠️ Verificar se esta coluna tem valor
  CASE 
    WHEN image_url IS NULL THEN '❌ NULL (sem imagem)'
    WHEN image_url LIKE 'data:%' THEN '✅ Base64 (' || LENGTH(image_url) || ' caracteres)'
    WHEN image_url LIKE 'http%' THEN '✅ URL: ' || SUBSTRING(image_url, 1, 50) || '...'
    ELSE '✅ Outro formato'
  END AS status_imagem,
  created_at
FROM feedbacks
ORDER BY created_at DESC
LIMIT 5;

-- ================================================

-- VERIFICAR ESTRUTURA DA TABELA:
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feedbacks'
ORDER BY ordinal_position;

