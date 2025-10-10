# 🔍 Verificar Tabela birth_plans no Supabase

## 📋 **Por favor, faça isso:**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione o projeto `mamacare-w5ir`

2. **Vá para "SQL Editor"**

3. **Execute este comando para ver a estrutura da tabela:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'birth_plans'
ORDER BY ordinal_position;
```

4. **Me envie o resultado** que aparecer!

---

## ✅ **A tabela DEVERIA ter estas colunas:**

```
id                   | varchar  | NO
pregnancy_id         | varchar  | NO
location             | text     | YES
companions           | text     | YES
doctor_preference    | text     | YES
lighting             | text     | YES
music                | boolean  | YES
movement             | boolean  | YES
pain_relief_natural  | boolean  | YES
pain_relief_epidural | boolean  | YES
pain_relief_other    | text     | YES
labor_position       | text     | YES
monitoring           | text     | YES
hydration_food       | boolean  | YES
delivery_type        | text     | YES
episiotomy           | text     | YES
umbilical_cord       | text     | YES
skin_to_skin         | boolean  | YES
breastfeeding        | text     | YES
baby_bath            | text     | YES
companion_presence   | boolean  | YES
photos               | boolean  | YES
religious_cultural   | text     | YES
special_requests     | text     | YES
created_at           | timestamp| YES
updated_at           | timestamp| YES
```

---

## 📝 **Se faltar alguma coluna, execute:**

```sql
-- Adicionar colunas que podem estar faltando
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS doctor_preference TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS lighting TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS music BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS movement BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS pain_relief_natural BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS pain_relief_epidural BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS pain_relief_other TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS labor_position TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS monitoring TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS hydration_food BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS delivery_type TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS episiotomy TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS umbilical_cord TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS skin_to_skin BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS breastfeeding TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS baby_bath TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS companion_presence BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS photos BOOLEAN;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS religious_cultural TEXT;
ALTER TABLE birth_plans ADD COLUMN IF NOT EXISTS special_requests TEXT;
```

---

**Me avise quando fizer isso!** 🚀

