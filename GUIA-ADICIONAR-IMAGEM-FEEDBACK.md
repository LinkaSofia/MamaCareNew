# 📸 Guia: Adicionar Suporte a Imagens no Feedback

## ⚠️ PROBLEMA IDENTIFICADO

O erro ocorre porque a coluna `image_url` ainda não foi criada na tabela `feedbacks` do banco de dados.

**Erro:**
```
PostgresError: column "image_url" of relation "feedbacks" does not exist
```

---

## ✅ SOLUÇÃO: Executar Migration SQL

### **OPÇÃO 1: Via Supabase SQL Editor (RECOMENDADO)**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o seguinte SQL:

```sql
-- Adicionar coluna image_url se não existir
ALTER TABLE feedbacks 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Verifique se a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feedbacks' 
ORDER BY ordinal_position;
```

---

### **OPÇÃO 2: Via Terminal (psql)**

```bash
psql "postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

Depois execute:

```sql
ALTER TABLE feedbacks 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

---

### **OPÇÃO 3: Usar o Arquivo SQL**

Execute o arquivo `add-image-column-feedbacks.sql` no Supabase SQL Editor.

---

## 🔧 DEPOIS DE EXECUTAR A MIGRATION

1. **Reinicie o servidor** (se estiver rodando):
   ```bash
   # Pare o servidor (Ctrl+C) e reinicie
   npm run dev
   ```

2. **Teste novamente:**
   - Abra o modal de feedback
   - Adicione uma imagem
   - Envie o feedback
   - Verifique se foi salvo com sucesso

---

## 📝 NOTA SOBRE O BUCKET DO SUPABASE

O erro `Bucket not found` indica que o bucket `diary-attachments` pode não existir no Supabase Storage. 

**Solução temporária:** O sistema já está usando base64 como fallback, então as imagens serão salvas mesmo sem o bucket.

**Para criar o bucket (opcional):**
1. Acesse **Supabase Dashboard** > **Storage**
2. Clique em **New bucket**
3. Nome: `diary-attachments`
4. Marque como **Public bucket**
5. Clique em **Create bucket**

---

## ✅ VERIFICAÇÃO

Após executar a migration, você pode verificar se funcionou:

```sql
-- Ver estrutura da tabela feedbacks
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feedbacks' 
ORDER BY ordinal_position;

-- Ver últimos feedbacks com imagem
SELECT 
  id,
  page,
  rating,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Tem imagem'
    ELSE '❌ Sem imagem'
  END as tem_imagem,
  created_at
FROM feedbacks
ORDER BY created_at DESC
LIMIT 10;
```




