# 🚀 CONFIGURAR SUPABASE STORAGE - GUIA COMPLETO

## **🎯 OBJETIVO:**
Eliminar completamente o base64 e usar **apenas Supabase Storage** para máxima performance.

---

## **📋 PASSOS OBRIGATÓRIOS:**

### **1️⃣ ACESSAR SUPABASE DASHBOARD**

1. **Acesse:** https://supabase.com/dashboard
2. **Faça login** com sua conta
3. **Selecione o projeto:** `yrpbjxhtsnaxlfsazall`

### **2️⃣ OBTER CHAVE DE API CORRETA**

1. **Vá em:** Settings → API
2. **Copie a chave:** `anon public` (não a service_role)
3. **Exemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **3️⃣ CRIAR BUCKET NO STORAGE**

1. **Vá em:** Storage → Create a new bucket
2. **Configure:**
   - **Name:** `diary-attachments`
   - **Public:** ✅ **SIM** (muito importante!)
   - **File size limit:** `50MB`
   - **Allowed MIME types:** `image/*,application/pdf`

### **4️⃣ CONFIGURAR POLÍTICAS DE ACESSO**

Execute este SQL no **SQL Editor**:

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

### **5️⃣ ATUALIZAR CONFIGURAÇÃO NO CÓDIGO**

Substitua a chave no arquivo `client/src/lib/supabase.ts`:

```typescript
const supabaseAnonKey = 'SUA_CHAVE_AQUI'; // Cole a chave correta
```

### **6️⃣ VERIFICAR CONFIGURAÇÃO**

Execute este SQL para verificar:

```sql
-- Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE name = 'diary-attachments';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## **🔧 ATUALIZAR CÓDIGO:**

### **Frontend (client/src/lib/supabase.ts):**
```typescript
// Configuração do Supabase - URLs corretas do seu projeto
const supabaseUrl = 'https://yrpbjxhtsnaxlfsazall.supabase.co';
const supabaseAnonKey = 'SUA_CHAVE_AQUI'; // ← SUBSTITUA AQUI
```

### **Backend (server/routes.ts):**
Já está configurado para receber URLs.

---

## **🧪 TESTAR:**

1. **Execute os passos acima**
2. **Reinicie o servidor**
3. **Teste upload de imagem**
4. **Verifique no console:**
   ```
   📤 Tentando upload para Supabase Storage
   ✅ Upload para Supabase Storage bem-sucedido
   ```

---

## **🎯 RESULTADO ESPERADO:**

- ✅ **Upload direto** para Supabase Storage
- ✅ **URLs públicas** para acesso rápido
- ✅ **Zero base64** no banco de dados
- ✅ **Performance máxima** com CDN

**Execute estes passos e teremos Supabase Storage funcionando!** 🚀
