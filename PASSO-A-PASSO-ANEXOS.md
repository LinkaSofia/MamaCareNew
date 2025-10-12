# 🚨 **PASSO A PASSO PARA SALVAR IMAGENS/PDFs NO DIÁRIO**

## **📌 O PROBLEMA:**
- Você adiciona imagens/PDFs no diário
- Sistema diz "Entrada atualizada!"
- **MAS** não aparece no banco Supabase

---

## **✅ SOLUÇÃO EM 3 PASSOS:**

### **PASSO 1: CRIAR TABELA NO SUPABASE**

1. **Abra o Supabase Dashboard**
2. **Vá em SQL Editor** (ícone de banco de dados)
3. **Cole EXATAMENTE este código:**

```sql
-- ATENÇÃO: diary_entries.id é VARCHAR, não UUID!
CREATE TABLE IF NOT EXISTS diary_attachments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  diary_entry_id VARCHAR NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  file_data TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar anexos por entrada
CREATE INDEX IF NOT EXISTS idx_diary_attachments_entry 
ON diary_attachments(diary_entry_id);
```

4. **Clique em "RUN"**
5. **Você deve ver:** `Success. No rows returned`

---

### **PASSO 2: VERIFICAR SE FOI CRIADA**

**Cole e rode este SQL:**

```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;
```

**Você deve ver:**
```
table_name         | column_name     | data_type
-------------------+----------------+-----------
diary_attachments  | id             | varchar
diary_attachments  | diary_entry_id | varchar
diary_attachments  | file_data      | text
diary_attachments  | file_type      | varchar
diary_attachments  | file_name      | varchar
diary_attachments  | file_size      | integer
diary_attachments  | created_at     | timestamp
```

---

### **PASSO 3: TESTAR NO APP**

1. **Recarregue a página** (Ctrl + Shift + R)
2. **Vá no Diário**
3. **Crie uma nova entrada**
4. **Adicione 1 ou 2 imagens**
5. **Clique em "Salvar"**
6. **Vá no Supabase → Table Editor → `diary_attachments`**
7. **Você deve ver as imagens salvas!**

---

## **🔍 ONDE OS DADOS SÃO SALVOS:**

### **Tabela `diary_entries`** (entrada do diário)
- `id` (VARCHAR)
- `pregnancy_id`
- `title`
- `content`
- `mood`
- `week`
- `milestone`
- `date`
- ~~`image`~~ ← **NÃO SALVA AQUI!**

### **Tabela `diary_attachments`** (imagens e PDFs)
- `id` (VARCHAR)
- `diary_entry_id` (FK para `diary_entries.id`)
- `file_data` (TEXT base64) ← **SALVA AQUI!**
- `file_type` (VARCHAR - "image/png", "image/jpeg", "application/pdf")
- `file_name` (VARCHAR - nome do arquivo)
- `file_size` (INTEGER - tamanho em bytes)
- `created_at` (TIMESTAMP)

---

## **🐛 SE DER ERRO:**

### **Erro: "foreign key constraint cannot be implemented"**
- **Motivo:** Tipo de dado incompatível
- **Solução:** Use o script acima que usa `VARCHAR` em vez de `UUID`

### **Erro: "table already exists"**
- **Motivo:** Você já criou a tabela
- **Solução:** Ignore o erro ou delete a tabela e recrie

### **Imagens não aparecem depois de salvar**
1. Verifique se a tabela `diary_attachments` existe
2. Rode este SQL para ver se os dados estão lá:

```sql
SELECT 
  id, 
  diary_entry_id, 
  file_type, 
  file_name, 
  LENGTH(file_data) as tamanho_em_bytes,
  created_at
FROM diary_attachments
ORDER BY created_at DESC
LIMIT 10;
```

---

## **✅ COMO SABER SE FUNCIONOU:**

1. **No Console do navegador**, você deve ver:
```
📎 Saving 2 attachments...
📎 Validating attachment: {...}
✅ Attachment saved: imagem.png
✅ Attachment saved: documento.pdf
✅ All attachments processed for entry abc-123
```

2. **No Supabase**, você deve ver:
   - Tabela `diary_attachments` com registros
   - Cada registro tem `file_data` (string gigante base64)
   - `diary_entry_id` corresponde ao `id` da `diary_entries`

---

## **📞 SE AINDA NÃO FUNCIONAR:**

1. **Copie o erro COMPLETO do console**
2. **Tire print da tabela `diary_attachments` no Supabase**
3. **Tire print do console do navegador**
4. **Me envie tudo**

---

**FEITO! Agora as imagens e PDFs vão ser salvos corretamente!** 🎉

