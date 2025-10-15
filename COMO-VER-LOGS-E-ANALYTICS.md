# 📊 COMO VER LOGS E ANALYTICS DO USUÁRIO

## 🔍 1. LOGS EM TEMPO REAL

### **No Terminal (Servidor):**
Os logs aparecem automaticamente no terminal onde você executou `npm run dev`

**Exemplos de logs que você verá:**
```
🔑 Auth via token: { userId: '5154abdc-375d-4aeb-b7d5-4479070701fa' }
📝 POST /api/diary-entries 200 in 1234ms
📎 Loaded 15 entries with attachments
🔍 DEBUG Anexo 0: { id: '...', url: '...', type: 'image/png' }
```

### **No Browser (Console):**
1. Abra o **F12** (Developer Tools)
2. Vá na aba **Console**
3. Você verá logs como:
```
🔍 DEBUG Anexo 0: { id: '...', url: '...', type: 'image/png', isImage: true }
✅ Imagem 0 carregada com sucesso: https://...
📤 Tentando Supabase Storage: { originalName: 'imagem.png', size: '245.67 KB' }
```

## 📊 2. CONSULTAS SQL NO BANCO DE DADOS

### **A. ANÁLISE DE ATIVIDADE POR USUÁRIO:**

```sql
-- Ver todas as atividades de um usuário específico
SELECT 
  u.email,
  u.name,
  de.title,
  de.content,
  de.created_at,
  de.mood,
  de.week,
  COUNT(da.id) as num_attachments
FROM users u
JOIN pregnancies p ON u.id = p.user_id
JOIN diary_entries de ON p.id = de.pregnancy_id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
GROUP BY u.id, de.id, u.email, u.name, de.title, de.content, de.created_at, de.mood, de.week
ORDER BY de.created_at DESC;
```

### **B. TEMPO DE SESSÃO E PÁGINAS VISITADAS:**

```sql
-- Ver analytics de páginas visitadas
SELECT 
  u.email,
  av.page,
  av.timestamp,
  av.user_agent,
  av.referrer,
  LAG(av.timestamp) OVER (PARTITION BY av.user_id ORDER BY av.timestamp) as previous_visit,
  av.timestamp - LAG(av.timestamp) OVER (PARTITION BY av.user_id ORDER BY av.timestamp) as time_on_page
FROM users u
JOIN analytics_page_visits av ON u.id = av.user_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY av.timestamp DESC;
```

### **C. ESTATÍSTICAS DE USO:**

```sql
-- Resumo de atividade do usuário
SELECT 
  u.email,
  u.name,
  COUNT(DISTINCT de.id) as total_diary_entries,
  COUNT(DISTINCT da.id) as total_attachments,
  COUNT(DISTINCT av.page) as pages_visited,
  MIN(de.created_at) as first_entry,
  MAX(de.created_at) as last_entry,
  AVG(de.mood) as avg_mood,
  COUNT(DISTINCT DATE(de.created_at)) as active_days
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
LEFT JOIN analytics_page_visits av ON u.id = av.user_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
GROUP BY u.id, u.email, u.name;
```

### **D. ANÁLISE DE HUMOR E EMOÇÕES:**

```sql
-- Análise de humor ao longo do tempo
SELECT 
  DATE(de.created_at) as date,
  AVG(de.mood) as avg_mood,
  COUNT(*) as entries_count,
  STRING_AGG(DISTINCT de.emotions, ', ') as emotions
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
GROUP BY DATE(de.created_at)
ORDER BY date DESC;
```

### **E. ANEXOS E ARQUIVOS:**

```sql
-- Ver todos os anexos do usuário
SELECT 
  de.title,
  de.created_at,
  da.file_name,
  da.file_type,
  da.file_size,
  da.file_url,
  CASE 
    WHEN da.file_url LIKE 'data:%' THEN 'Base64'
    WHEN da.file_url LIKE 'https://%' THEN 'Supabase Storage'
    ELSE 'Outro'
  END as storage_type
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY de.created_at DESC;
```

## 📈 3. DASHBOARD DE ANALYTICS

### **A. USUÁRIOS MAIS ATIVOS:**

```sql
-- Top 10 usuários mais ativos
SELECT 
  u.email,
  u.name,
  COUNT(DISTINCT de.id) as diary_entries,
  COUNT(DISTINCT da.id) as attachments,
  COUNT(DISTINCT av.id) as page_visits,
  MAX(de.created_at) as last_activity
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
LEFT JOIN analytics_page_visits av ON u.id = av.user_id
GROUP BY u.id, u.email, u.name
ORDER BY diary_entries DESC
LIMIT 10;
```

### **B. PÁGINAS MAIS VISITADAS:**

```sql
-- Páginas mais populares
SELECT 
  av.page,
  COUNT(*) as visits,
  COUNT(DISTINCT av.user_id) as unique_users,
  AVG(EXTRACT(EPOCH FROM (LEAD(av.timestamp) OVER (PARTITION BY av.user_id ORDER BY av.timestamp) - av.timestamp))/60) as avg_time_minutes
FROM analytics_page_visits av
WHERE av.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY av.page
ORDER BY visits DESC;
```

### **C. ESTATÍSTICAS GERAIS:**

```sql
-- Estatísticas gerais da aplicação
SELECT 
  'Total Users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Total Diary Entries',
  COUNT(*)
FROM diary_entries
UNION ALL
SELECT 
  'Total Attachments',
  COUNT(*)
FROM diary_attachments
UNION ALL
SELECT 
  'Total Page Visits',
  COUNT(*)
FROM analytics_page_visits
UNION ALL
SELECT 
  'Active Users (Last 7 days)',
  COUNT(DISTINCT user_id)
FROM analytics_page_visits
WHERE timestamp >= NOW() - INTERVAL '7 days';
```

## 🕒 4. ANÁLISE DE TEMPO REAL

### **A. ATIVIDADE HOJE:**

```sql
-- Atividade de hoje
SELECT 
  u.email,
  COUNT(DISTINCT de.id) as entries_today,
  COUNT(DISTINCT av.id) as visits_today
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id AND DATE(de.created_at) = CURRENT_DATE
LEFT JOIN analytics_page_visits av ON u.id = av.user_id AND DATE(av.timestamp) = CURRENT_DATE
GROUP BY u.id, u.email
HAVING COUNT(DISTINCT de.id) > 0 OR COUNT(DISTINCT av.id) > 0
ORDER BY entries_today DESC, visits_today DESC;
```

### **B. ÚLTIMAS ATIVIDADES:**

```sql
-- Últimas atividades (últimas 24h)
SELECT 
  'Diary Entry' as activity_type,
  u.email,
  de.title,
  de.created_at as timestamp
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
JOIN users u ON p.user_id = u.id
WHERE de.created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Page Visit',
  u.email,
  av.page,
  av.timestamp
FROM analytics_page_visits av
JOIN users u ON av.user_id = u.id
WHERE av.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 50;
```

## 🔧 5. COMO EXECUTAR AS CONSULTAS

### **No Supabase Dashboard:**
1. Acesse: https://supabase.com/dashboard
2. Vá no seu projeto
3. Clique em **SQL Editor**
4. Cole qualquer uma das consultas acima
5. Clique em **Run**

### **Substitua o User ID:**
- Substitua `'5154abdc-375d-4aeb-b7d5-4479070701fa'` pelo ID do usuário que você quer analisar
- Para ver todos os usuários, remova a condição `WHERE u.id = '...'`

## 📱 6. LOGS DO FRONTEND

### **Para ver logs específicos no browser:**
1. Abra **F12** → **Console**
2. Digite: `localStorage.getItem('debug')` para ver dados de debug
3. Os logs aparecem automaticamente quando você navega

### **Filtros úteis no Console:**
- Digite `🔍` para ver apenas logs de debug
- Digite `✅` para ver apenas sucessos
- Digite `❌` para ver apenas erros
