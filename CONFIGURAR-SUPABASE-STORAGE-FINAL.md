# 🚀 CONFIGURAR SUPABASE STORAGE - SOLUÇÃO FINAL

## **📋 PASSOS OBRIGATÓRIOS:**

### **1️⃣ CRIAR BUCKET NO SUPABASE**

1. **Acesse:** https://supabase.com/dashboard
2. **Vá em:** Storage → Create a new bucket
3. **Configure:**
   - **Name:** `diary-attachments`
   - **Public:** ✅ **SIM** (para URLs públicas)
   - **File size limit:** `50MB`
   - **Allowed MIME types:** `image/*,application/pdf`

### **2️⃣ CONFIGURAR POLÍTICAS DE ACESSO**

Execute este SQL no Supabase SQL Editor:

```sql
-- Permitir upload público
CREATE POLICY "Allow public uploads to diary attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'diary-attachments');

-- Permitir leitura pública
CREATE POLICY "Allow public read access to diary attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'diary-attachments');

-- Permitir delete para cleanup
CREATE POLICY "Allow public delete from diary attachments" ON storage.objects
FOR DELETE USING (bucket_id = 'diary-attachments');
```

### **3️⃣ VERIFICAR CONFIGURAÇÃO**

```sql
-- Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE name = 'diary-attachments';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## **🎯 RESULTADO ESPERADO:**

- ✅ **Upload direto** para Supabase Storage
- ✅ **URLs públicas** para acesso rápido
- ✅ **Sem base64** no banco de dados
- ✅ **Performance otimizada**

**Execute estes passos antes de testar!** 🚀
