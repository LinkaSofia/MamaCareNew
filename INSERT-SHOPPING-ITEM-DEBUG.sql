-- ==========================================
-- SQL INSERT GERADO PELO SISTEMA
-- ==========================================
-- 
-- Este é o INSERT que está sendo executado quando você adiciona um item na lista de compras
--

-- 1️⃣ SCHEMA DA TABELA shopping_items:
CREATE TABLE shopping_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id VARCHAR NOT NULL REFERENCES pregnancies(id),
  name TEXT NOT NULL,
  price DECIMAL(10, 2),
  purchased BOOLEAN DEFAULT false,
  category TEXT,
  priority TEXT,
  essential BOOLEAN DEFAULT false,
  purchase_date TIMESTAMP
);

-- 2️⃣ DADOS ENVIADOS PELO FRONTEND:
-- {
--   "pregnancyId": "e32f35ee-ea5f-443b-a396-61fffa3e6522",
--   "name": "Body",
--   "price": "20",
--   "category": null,
--   "priority": "medium",
--   "essential": false
-- }

-- 3️⃣ INSERT GERADO PELO DRIZZLE ORM:
INSERT INTO shopping_items (
  id, 
  pregnancy_id, 
  name, 
  price, 
  category, 
  priority, 
  essential
)
VALUES (
  gen_random_uuid(),  -- ID gerado automaticamente
  'e32f35ee-ea5f-443b-a396-61fffa3e6522',  -- pregnancy_id
  'Body',  -- name
  20.00,  -- price (convertido de string para decimal)
  NULL,  -- category
  'medium',  -- priority
  false  -- essential
)
RETURNING *;

-- ==========================================
-- 4️⃣ PARA TESTAR MANUALMENTE NO SUPABASE:
-- ==========================================
-- Substitua 'SEU-PREGNANCY-ID' pelo ID real da sua gravidez
-- Para pegar o pregnancy_id correto, execute:

SELECT id, user_id, due_date 
FROM pregnancies 
WHERE user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY created_at DESC 
LIMIT 1;

-- Depois insira um item de teste:

INSERT INTO shopping_items (
  id, 
  pregnancy_id, 
  name, 
  price, 
  category, 
  priority, 
  essential
)
VALUES (
  gen_random_uuid(),
  'e32f35ee-ea5f-443b-a396-61fffa3e6522',  -- ⚠️ USE SEU pregnancy_id REAL AQUI
  'Teste Item',
  25.50,
  NULL,
  'high',
  true
)
RETURNING *;

-- ==========================================
-- 5️⃣ VERIFICAR SE O ITEM FOI INSERIDO:
-- ==========================================

SELECT * FROM shopping_items 
WHERE pregnancy_id = 'e32f35ee-ea5f-443b-a396-61fffa3e6522'
ORDER BY name;

-- ==========================================
-- 6️⃣ DEBUG: VERIFICAR ESTRUTURA DA TABELA
-- ==========================================

-- Ver todas as colunas da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'shopping_items'
ORDER BY ordinal_position;

-- Ver constraints (foreign keys)
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'shopping_items';

