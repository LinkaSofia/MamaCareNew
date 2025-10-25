# 📊 GUIA: Como Ver Feedbacks no Banco de Dados

## 🎯 3 Formas de Consultar

---

## 📝 **OPÇÃO 1: Script Automático (MAIS FÁCIL)**

### Ver Relatório Completo:

```bash
node ver-feedbacks.cjs
```

**O que mostra:**
- ✅ Total de feedbacks
- ✅ Nota média geral
- ✅ Feedbacks por tela
- ✅ Distribuição de notas (quantos de cada)
- ✅ Últimos 5 feedbacks
- ✅ Feedbacks com problemas (nota baixa)
- ✅ Feedbacks positivos

---

### Ver Feedbacks de Uma Tela Específica:

```bash
node ver-feedbacks-tela.cjs
```

**Antes de executar, edite o arquivo:**

```javascript
// Linha 4 do arquivo ver-feedbacks-tela.cjs
const TELA = '/consultations'; // MUDE AQUI!
```

**Telas disponíveis:**
- `/` - Dashboard (página inicial)
- `/consultations` - Tela de consultas
- `/diary` - Diário
- `/weight-tracking` - Controle de peso
- `/kick-counter` - Contador de chutes
- `/photo-album` - Álbum de fotos
- `/shopping-list` - Lista de compras
- `/birth-plan` - Plano de parto
- `/community` - Comunidade

---

## 💻 **OPÇÃO 2: SQL Direto (Para Desenvolvedores)**

### Conectar ao Banco:

```bash
psql "postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### Depois, use as queries do arquivo `consultar-feedbacks.sql`

---

## 📋 **OPÇÃO 3: Queries SQL Prontas**

Abra o arquivo: `consultar-feedbacks.sql`

**Principais queries:**

### 1. Ver TODOS os feedbacks:

```sql
SELECT 
  f.id,
  u.name as nome_usuario,
  u.email,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as data_envio
FROM feedbacks f
JOIN users u ON f.user_id = u.id
ORDER BY f.created_at DESC;
```

### 2. Ver feedbacks POR TELA:

```sql
SELECT 
  f.page as tela,
  COUNT(*) as total_feedbacks,
  ROUND(AVG(f.rating), 2) as nota_media
FROM feedbacks f
GROUP BY f.page
ORDER BY total_feedbacks DESC;
```

### 3. Ver feedbacks RUINS (nota 1-2):

```sql
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE f.rating <= 2
ORDER BY f.created_at DESC;
```

### 4. Ver feedbacks BONS (nota 4-5):

```sql
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE f.rating >= 4
ORDER BY f.created_at DESC;
```

### 5. ESTATÍSTICAS gerais:

```sql
SELECT 
  COUNT(*) as total_feedbacks,
  ROUND(AVG(rating), 2) as nota_media_geral,
  COUNT(DISTINCT user_id) as usuarios_que_avaliaram,
  COUNT(DISTINCT page) as telas_avaliadas
FROM feedbacks;
```

### 6. Ver feedbacks de HOJE:

```sql
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  TO_CHAR(f.created_at, 'HH24:MI') as hora
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE DATE(f.created_at) = CURRENT_DATE
ORDER BY f.created_at DESC;
```

### 7. Ver feedbacks dos ÚLTIMOS 7 DIAS:

```sql
SELECT 
  DATE(f.created_at) as dia,
  COUNT(*) as total,
  ROUND(AVG(f.rating), 2) as nota_media
FROM feedbacks f
WHERE f.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(f.created_at)
ORDER BY dia DESC;
```

### 8. Ver feedbacks de um USUÁRIO específico:

```sql
SELECT 
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE u.email = 'linkasofialunkes@gmail.com' -- MUDE O EMAIL AQUI
ORDER BY f.created_at DESC;
```

### 9. DISTRIBUIÇÃO de notas (quantos de cada):

```sql
SELECT 
  f.rating as nota,
  CASE 
    WHEN f.rating = 5 THEN '⭐⭐⭐⭐⭐'
    WHEN f.rating = 4 THEN '⭐⭐⭐⭐'
    WHEN f.rating = 3 THEN '⭐⭐⭐'
    WHEN f.rating = 2 THEN '⭐⭐'
    ELSE '⭐'
  END as estrelas,
  COUNT(*) as quantidade
FROM feedbacks f
GROUP BY f.rating
ORDER BY f.rating DESC;
```

---

## 🗂️ **Estrutura da Tabela**

### Tabela: `feedbacks`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do feedback |
| `user_id` | UUID | ID do usuário que enviou |
| `page` | TEXT | Página onde foi dado (ex: /consultations) |
| `rating` | INTEGER | Nota de 1 a 5 estrelas |
| `message` | TEXT | Mensagem do usuário |
| `created_at` | TIMESTAMP | Data e hora do envio |

### Relacionamentos:

```
feedbacks
    └── user_id → users.id (quem enviou)
```

---

## 📊 **Exemplo de Resultado Atual:**

```
================================================================================
📊 RELATÓRIO DE FEEDBACKS - MAMACARE
================================================================================

📈 ESTATÍSTICAS GERAIS:

   Total de feedbacks: 1
   Nota média geral: 4.00 ⭐
   Usuários que avaliaram: 1
   Telas avaliadas: 1

--------------------------------------------------------------------------------
📱 FEEDBACKS POR TELA:

   1. /
      Total: 1 | Média: 4.00 ⭐⭐⭐⭐

--------------------------------------------------------------------------------
📝 ÚLTIMOS 5 FEEDBACKS:

   1. Linka Sofia (linkasofialunkes@gmail.com)
      Tela: /
      Nota: ⭐⭐⭐⭐ (4/5)
      Mensagem: "poderia melhorar"
      Data: 25/10/2025 13:21
```

---

## 🔄 **Atualizar Dados**

Para ver dados novos, simplesmente execute novamente:

```bash
node ver-feedbacks.cjs
```

---

## ⚠️ **Dicas:**

1. **Backup antes de deletar:**
   ```sql
   -- Backup
   SELECT * FROM feedbacks;
   
   -- Deletar
   DELETE FROM feedbacks WHERE id = 'id-aqui';
   ```

2. **Ver quantos feedbacks cada usuário deu:**
   ```sql
   SELECT 
     u.name,
     COUNT(*) as total_feedbacks,
     ROUND(AVG(f.rating), 2) as nota_media
   FROM feedbacks f
   JOIN users u ON f.user_id = u.id
   GROUP BY u.name
   ORDER BY total_feedbacks DESC;
   ```

3. **Ver telas que precisam de atenção:**
   ```sql
   SELECT 
     f.page,
     ROUND(AVG(f.rating), 2) as nota_media
   FROM feedbacks f
   GROUP BY f.page
   HAVING AVG(f.rating) < 3
   ORDER BY nota_media ASC;
   ```

---

## 🎯 **Resumo Rápido:**

| Quero ver... | Comando |
|-------------|---------|
| Relatório completo | `node ver-feedbacks.cjs` |
| Feedbacks de uma tela | `node ver-feedbacks-tela.cjs` |
| Query SQL customizada | Abrir `consultar-feedbacks.sql` |

---

**Pronto! Agora você sabe consultar todos os feedbacks! 📊✨**

