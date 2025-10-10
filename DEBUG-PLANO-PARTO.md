# 🔍 Debug Plano de Parto - URGENTE

## ❌ **ERRO:** `400 Bad Request - Invalid birth plan data`

---

## 📋 **PRECISO VER OS LOGS DO BACKEND!**

No **terminal do backend** (onde você rodou `npm run dev`), quando você tentou salvar o plano de parto, devem ter aparecido logs como:

```
📋 Creating birth plan with data: {...}
❌ Zod validation errors: [...]
```

ou

```
❌ Error creating birth plan: ...
```

---

## 🎯 **ME ENVIE:**

1. **COPIE E COLE AQUI todos os logs** que aparecem no terminal do backend quando você tenta salvar o plano de parto

2. **PRINT da tela** do formulário do plano de parto que você está tentando salvar

---

## 🔧 **POSSÍVEIS CAUSAS:**

### **Causa 1: Faltam colunas no banco de dados**
- Você executou o SQL do arquivo `CHECK-BIRTH-PLANS-TABLE.md` no Supabase?
- Se NÃO executou, vá para o **Supabase SQL Editor** e execute:

```sql
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

### **Causa 2: Campos obrigatórios vazios**
- O `pregnancyId` pode não estar sendo enviado corretamente

---

## ⚡ **AÇÃO IMEDIATA:**

1. **Olhe o terminal do backend** agora
2. **Me envie os logs completos** que aparecem lá
3. Vou identificar exatamente qual campo está causando o erro!

---

**Aguardo os logs do backend!** 🚨

