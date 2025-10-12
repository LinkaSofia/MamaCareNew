# 📸 INSTRUÇÕES PARA MÚLTIPLOS ANEXOS NO DIÁRIO

## ✅ ERRO CORRIGIDO

O erro de tela em branco (`entry.emotions.slice(...).map is not a function`) foi **CORRIGIDO**!

## 📋 NOVO SISTEMA DE ANEXOS

Agora o diário suporta **MÚLTIPLOS arquivos** (imagens, PDFs, etc) por entrada!

### ✅ O que foi corrigido no código:
1. ✅ Campo `image` adicionado no schema (`shared/schema.ts`)
2. ✅ Interface TypeScript atualizada
3. ✅ Upload e compressão de imagem implementados
4. ✅ Campo `image` agora está sendo enviado no `handleSubmit`
5. ✅ Preview e exibição nos cards implementados

### 🆕 NOVA TABELA: `diary_attachments`

Ao invés de um único campo `image`, agora temos uma **tabela separada** que permite:
- ✅ **Múltiplos anexos** por entrada (2, 3, 4, quantos quiser!)
- ✅ **Imagens** (JPEG, PNG, GIF, etc)
- ✅ **PDFs** e outros documentos
- ✅ **Metadados** (nome, tipo, tamanho)

---

## 🚀 EXECUTE ESTE SQL NO SUPABASE

### 🔧 PASSO A PASSO:

#### 1. Abra o Supabase SQL Editor
- Acesse: https://supabase.com/dashboard
- Entre no seu projeto
- Clique em **"SQL Editor"** (ícone ⚡)

#### 2. Copie e Cole este SQL:

```sql
-- Script para criar tabela de anexos do diário
CREATE TABLE IF NOT EXISTS diary_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  file_data TEXT NOT NULL, -- Arquivo em base64
  file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'image/png', 'application/pdf', etc
  file_name VARCHAR(255), -- Nome original do arquivo (opcional)
  file_size INTEGER, -- Tamanho em bytes
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar anexos por entrada
CREATE INDEX IF NOT EXISTS idx_diary_attachments_entry 
ON diary_attachments(diary_entry_id);

-- Verificar criação
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;
```

#### 3. Clique em "Run" (Executar)

#### 4. Verificar o Resultado
Você deve ver as colunas criadas:
```
table_name          | column_name      | data_type
diary_attachments   | id               | uuid
diary_attachments   | diary_entry_id   | uuid
diary_attachments   | file_data        | text
diary_attachments   | file_type        | character varying
diary_attachments   | file_name        | character varying
diary_attachments   | file_size        | integer
diary_attachments   | created_at       | timestamp
```

---

## ⚠️ STATUS ATUAL

### ✅ O QUE JÁ FUNCIONA:
1. **Tela do diário não quebra mais** (erro de emotions corrigido)
2. **Backend preparado** para receber o campo `image`
3. **Tabela criada** para múltiplos anexos (`diary_attachments`)

### 🚧 EM PROGRESSO:
O frontend ainda está com upload de **1 imagem apenas**. A implementação completa para **múltiplos arquivos** (imagens + PDFs) está em desenvolvimento.

### 🎯 PRÓXIMOS PASSOS:

1. **EXECUTE O SQL** acima no Supabase
2. **Recarregue a página** (Ctrl + Shift + R)
3. **Teste se o diário abre sem erro**
4. **Aguarde** a implementação completa dos múltiplos anexos

---

## 📊 LOGS DE DEBUG

Após executar o SQL e testar, abra o Console do navegador (F12) e procure por:

```
📸 Image size: XX.XX KB
📝 Entry data to send: { ... image: "data:image/jpeg;base64,..." }
📝 Entry created successfully: { ... image: "data:image/jpeg..." }
```

Se você ver esses logs, está funcionando! 🎉

---

## ⚠️ PROBLEMAS COMUNS

### "column 'image' of relation 'diary_entries' does not exist"
→ O script SQL ainda não foi executado. Execute o SQL acima.

### "Imagem não aparece após salvar"
→ Verifique se a coluna foi criada corretamente executando:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'diary_entries';
```

### "Imagem muito grande / Erro no upload"
→ O app comprime automaticamente para 800px e quality 0.7
→ Limite: 5MB no arquivo original

---

## 📞 SUPORTE

Se após executar o SQL ainda não funcionar:
1. Abra o Console (F12)
2. Copie todos os logs que começam com 📝 ou 📸
3. Me envie os logs para debug

