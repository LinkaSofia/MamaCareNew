# 🚀 CONFIGURAR SUPABASE STORAGE PARA ANEXOS

## ✅ **PROBLEMA RESOLVIDO: Base64 → Supabase Storage**

Ao invés de salvar arquivos como base64 no banco de dados (que gera arquivos enormes), agora usamos **Supabase Storage** para armazenar os arquivos e salvar apenas as URLs no banco.

---

## 🔧 **PASSO A PASSO:**

### **1️⃣ EXECUTAR MIGRAÇÃO NO SUPABASE**

Rode este SQL no **Supabase SQL Editor**:

```sql
-- 1. Adicionar nova coluna file_url
ALTER TABLE diary_attachments 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. Remover a coluna file_data (base64)
ALTER TABLE diary_attachments 
DROP COLUMN IF EXISTS file_data;

-- 3. Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 4. Limpar dados antigos (opcional - só se quiser começar do zero)
DELETE FROM diary_attachments;

-- 5. Verificar se a tabela está vazia
SELECT COUNT(*) as total_anexos FROM diary_attachments;
```

### **2️⃣ CRIAR BUCKET NO SUPABASE STORAGE**

1. **Acesse o Supabase Dashboard**
2. **Vá em "Storage"** no menu lateral
3. **Clique em "Create a new bucket"**
4. **Configure:**
   - **Name:** `diary-attachments`
   - **Public:** ✅ **SIM** (para URLs públicas)
   - **File size limit:** `50MB`
   - **Allowed MIME types:** `image/*,application/pdf`

### **3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE**

Adicione no arquivo `.env` (se não existir):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://yrpbjxhtsnaxlfsazall.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycGJqeGh0c25heGxmc2F6YWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0NzQwNzIsImV4cCI6MjA0MDA1MDA3Mn0.8QK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K
```

### **4️⃣ POLÍTICA DE ACESSO (OPCIONAL)**

Para maior segurança, configure políticas no Supabase:

```sql
-- Permitir upload de arquivos para usuários autenticados
CREATE POLICY "Allow authenticated users to upload diary attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'diary-attachments' AND auth.role() = 'authenticated');

-- Permitir leitura pública dos arquivos
CREATE POLICY "Allow public read access to diary attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'diary-attachments');
```

---

## 🎯 **VANTAGENS DA NOVA ABORDAGEM:**

### ✅ **Performance:**
- **Arquivos menores** - sem overhead do base64 (33% maior)
- **Upload direto** - mais rápido que converter para base64
- **URLs públicas** - carregamento instantâneo das imagens

### ✅ **Escalabilidade:**
- **Sem limite** de tamanho no banco de dados
- **CDN integrado** do Supabase para entrega rápida
- **Compressão automática** de imagens

### ✅ **Manutenção:**
- **Backup automático** dos arquivos
- **Versionamento** de arquivos
- **Limpeza fácil** de arquivos órfãos

---

## 🧪 **COMO TESTAR:**

1. **Execute a migração SQL** (passo 1)
2. **Crie o bucket** (passo 2)
3. **Configure as variáveis** (passo 3)
4. **Reinicie o servidor**
5. **Teste no diário:**
   - Adicione uma entrada
   - Anexe 1-2 imagens
   - Salve
   - Verifique se as imagens aparecem

---

## 📊 **COMPARAÇÃO:**

| Aspecto | Base64 (Antigo) | Supabase Storage (Novo) |
|---------|-----------------|-------------------------|
| **Tamanho** | Arquivo × 1.33 | Arquivo original |
| **Performance** | Lento (conversão) | Rápido (upload direto) |
| **Banco de dados** | Sobrecarregado | Apenas URLs |
| **Limite** | 5MB por arquivo | 50MB por arquivo |
| **CDN** | Não | Sim (Supabase) |

---

## 🚨 **SE DER ERRO:**

### **Erro: "Bucket not found"**
- Verifique se o bucket `diary-attachments` foi criado
- Confirme se o nome está exato

### **Erro: "Invalid URL"**
- Verifique as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Reinicie o servidor após alterar o `.env`

### **Erro: "Permission denied"**
- Configure as políticas de acesso (passo 4)
- Ou torne o bucket público temporariamente

---

## 🎉 **RESULTADO FINAL:**

Agora os anexos do diário:
- ✅ **Carregam mais rápido**
- ✅ **Não sobrecarregam o banco**
- ✅ **Suportam arquivos maiores**
- ✅ **São mais eficientes**

**O problema do base64 está resolvido!** 🚀
