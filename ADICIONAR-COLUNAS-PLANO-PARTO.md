# Adicionar Colunas ao Plano de Parto no Supabase

Para o formulário completo de plano de parto funcionar, é necessário adicionar novas colunas na tabela `birth_plans` do seu banco de dados Supabase.

## 📝 Instruções

1. **Acesse o Dashboard do Supabase:**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login.

2. **Selecione seu Projeto:**
   - No painel lateral esquerdo, selecione o projeto `mamacare-w5ir`.

3. **Vá para o SQL Editor:**
   - No menu lateral, clique em "SQL Editor" (o ícone de terminal).

4. **Execute a Query:**
   - No editor de SQL, cole o seguinte comando e clique em "Run" (ou "Execute"):

```sql
-- Adicionar novas colunas ao plano de parto
ALTER TABLE birth_plans 
ADD COLUMN IF NOT EXISTS doctor_preference TEXT,
ADD COLUMN IF NOT EXISTS lighting TEXT,
ADD COLUMN IF NOT EXISTS music BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS movement BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pain_relief_natural BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pain_relief_epidural BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pain_relief_other TEXT,
ADD COLUMN IF NOT EXISTS labor_position TEXT,
ADD COLUMN IF NOT EXISTS monitoring TEXT,
ADD COLUMN IF NOT EXISTS hydration_food BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS episiotomy TEXT,
ADD COLUMN IF NOT EXISTS umbilical_cord TEXT,
ADD COLUMN IF NOT EXISTS skin_to_skin BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS breastfeeding TEXT,
ADD COLUMN IF NOT EXISTS baby_bath TEXT,
ADD COLUMN IF NOT EXISTS companion_presence BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS photos BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS religious_cultural TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
```

5. **Verifique a Execução:**
   - Após a execução, você deverá ver uma mensagem de sucesso.
   - Você pode verificar a estrutura da tabela `birth_plans` em "Table Editor" ou "Database" -> "Tables" para confirmar que as novas colunas foram adicionadas.

## ✨ O que isso adiciona?

Estas colunas permitem que o plano de parto completo armazene:

- **Informações Básicas:** Local, acompanhantes, médico preferido
- **Ambiente:** Iluminação, música, movimentação
- **Alívio da Dor:** Métodos naturais, epidural, outros
- **Trabalho de Parto:** Posição, monitoramento, hidratação
- **Durante o Parto:** Tipo de parto, episiotomia, cordão umbilical, pele a pele
- **Pós-Parto:** Amamentação, banho do bebê, presença de acompanhante
- **Solicitações Especiais:** Fotos, crenças religiosas/culturais, outras solicitações

## 🎯 Próximos Passos

Após executar este SQL, o formulário de plano de parto com múltiplas etapas e a exportação de PDF estarão totalmente funcionais!

