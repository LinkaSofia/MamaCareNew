# 📊 Explicação dos Cálculos do Diário da Gestação

## 🎭 Sistema de Humor (Escala 1-10)

O sistema de humor do diário utiliza uma escala de **1 a 10**, onde cada valor representa um estado emocional diferente:

| Valor | Label | Emoji | Cor | Descrição |
|-------|-------|-------|-----|-----------|
| 1 | Terrível | 😭 | Vermelho Escuro | Estado emocional muito negativo |
| 2 | Muito mal | 😢 | Vermelho | Sentindo-se muito mal |
| 3 | Mal | 😔 | Laranja | Dia difícil |
| 4 | Chateada | 😕 | Amarelo | Ligeiramente chateada |
| 5 | Neutra | 😐 | Cinza | Estado neutro |
| 6 | Ok | 🙂 | Verde Claro | Sentindo-se ok |
| 7 | Bem | 😊 | Verde | Sentindo-se bem |
| 8 | Muito bem | 😄 | Azul | Sentindo-se muito bem |
| 9 | Excelente | 😍 | Roxo | Estado excelente |
| 10 | Radiante | 🤩 | Rosa | Estado radiante |

---

## 📈 **1. HUMOR MÉDIO** 

### Como é calculado:

```typescript
const averageMood = entries.length > 0 
  ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
  : 0;
```

### Explicação:
É a **média aritmética simples** de todos os humores registrados nas entradas do diário.

### Exemplo prático:

**Cenário 1:**
- Você tem 4 entradas no diário
- Humores registrados: 8, 9, 7, 10

**Cálculo:**
```
Soma total: 8 + 9 + 7 + 10 = 34
Total de entradas: 4
Humor Médio: 34 ÷ 4 = 8.5
```

**Resultado:** `8.5` (exibido como "8.5" no card)

---

**Cenário 2:**
- Você tem 3 entradas
- Humores: 5, 6, 7

**Cálculo:**
```
Soma: 5 + 6 + 7 = 18
Total: 3
Humor Médio: 18 ÷ 3 = 6.0
```

**Resultado:** `6.0` (exibido como "6.0" no card)

---

### 🎯 Interpretação do Humor Médio:

| Faixa | Interpretação | Status |
|-------|---------------|--------|
| 8.0 - 10.0 | 🤩 Excelente! Você está muito bem emocionalmente | ✅ Muito Positivo |
| 7.0 - 7.9 | 😊 Bom! Seu humor está positivo | ✅ Positivo |
| 5.0 - 6.9 | 😐 Neutro/Ok. Nem ótimo nem ruim | ⚠️ Neutro |
| 3.0 - 4.9 | 😔 Baixo. Pode ser bom conversar com alguém | ⚠️ Atenção |
| 1.0 - 2.9 | 😢 Muito baixo. Considere buscar apoio profissional | ❌ Crítico |

---

## ❤️ **2. DIAS FELIZES**

### Como é calculado:

```typescript
const happyDays = entries.filter(entry => entry.mood >= 8).length
```

### Explicação:
Conta quantas entradas têm um humor **maior ou igual a 8** (Muito bem, Excelente ou Radiante).

### Exemplo prático:

**Cenário 1:**
Você tem 10 entradas com os seguintes humores:
- Entrada 1: humor 8 ✅ (conta)
- Entrada 2: humor 9 ✅ (conta)
- Entrada 3: humor 7 ❌ (não conta)
- Entrada 4: humor 10 ✅ (conta)
- Entrada 5: humor 6 ❌ (não conta)
- Entrada 6: humor 8 ✅ (conta)
- Entrada 7: humor 5 ❌ (não conta)
- Entrada 8: humor 9 ✅ (conta)
- Entrada 9: humor 7 ❌ (não conta)
- Entrada 10: humor 8 ✅ (conta)

**Cálculo:**
```
Entradas com humor >= 8: 1, 2, 4, 6, 8, 10
Total de Dias Felizes: 6
```

**Resultado:** `6` (exibido como "6" no card)

---

**Cenário 2:**
Você tem 5 entradas:
- Humores: 5, 6, 7, 7, 6

**Cálculo:**
```
Entradas com humor >= 8: nenhuma
Total de Dias Felizes: 0
```

**Resultado:** `0` (exibido como "0" no card)

---

### 🎯 O que conta como "Dia Feliz":

| Humor | Conta como Dia Feliz? |
|-------|-----------------------|
| 10 - Radiante 🤩 | ✅ SIM |
| 9 - Excelente 😍 | ✅ SIM |
| 8 - Muito bem 😄 | ✅ SIM |
| 7 - Bem 😊 | ❌ NÃO |
| 6 - Ok 🙂 | ❌ NÃO |
| 5 - Neutra 😐 | ❌ NÃO |
| 1-4 | ❌ NÃO |

**Nota:** Apenas os humores **8, 9 e 10** contam como "Dias Felizes". É um limiar alto para representar dias realmente especiais!

---

## 🐛 **SOBRE O BUG "HUMOR MÉDIO 255"**

Se você está vendo **"255"** no card de Humor Médio, isso indica um dos seguintes problemas:

### Possíveis causas:

1. **Dados corrompidos no banco:**
   - Alguma entrada tem `mood` armazenado como `255` ou valor inválido
   - Solução: Verificar as entradas no Supabase e corrigir valores inválidos

2. **Erro na conversão de tipo:**
   - O campo `mood` pode estar sendo enviado/recebido como string em vez de número
   - Exemplo: `"8"` em vez de `8`
   - Quando strings são somadas em JavaScript: `"8" + "9" = "89"` (concatenação)

3. **Valor padrão incorreto:**
   - Se não há entradas e o cálculo está retornando 255 em vez de 0

### Como verificar no banco de dados:

```sql
-- Ver todos os humores registrados
SELECT id, mood, date, title 
FROM diary_entries 
WHERE pregnancy_id = 'seu-pregnancy-id'
ORDER BY date DESC;

-- Verificar se há valores inválidos (fora do range 1-10)
SELECT id, mood, date 
FROM diary_entries 
WHERE mood < 1 OR mood > 10 OR mood IS NULL;

-- Corrigir valores inválidos (se necessário)
UPDATE diary_entries 
SET mood = 5 
WHERE mood > 10 OR mood < 1 OR mood IS NULL;
```

---

## 📊 **OUTROS CÁLCULOS IMPORTANTES**

### 3. Entradas Esta Semana

```typescript
const entriesThisWeek = entries.filter(entry => {
  const entryDate = new Date(entry.date);
  const weekAgo = subDays(new Date(), 7);
  return entryDate >= weekAgo;
}).length
```

Conta quantas entradas foram feitas nos últimos 7 dias.

---

### 4. Distribuição de Humor

```typescript
const moodDistribution = moods.map(mood => ({
  mood: mood.label,
  count: entries.filter(entry => entry.mood === mood.value).length,
  color: mood.color
})).filter(item => item.count > 0);
```

Mostra quantas vezes cada humor foi registrado (para gráficos).

---

### 5. Frequência de Emoções

```typescript
const emotionFrequency = emotionTags.map(emotion => ({
  emotion: emotion.label,
  count: entries.reduce((sum, entry) => 
    sum + (entry.emotions.includes(emotion.value) ? 1 : 0), 0
  ),
  color: emotion.color
}))
```

Conta quantas vezes cada emoção (gratidão, ansiedade, amor, etc.) foi marcada.

---

## 💡 **DICAS DE USO**

### Para um Humor Médio Saudável:
- ✅ Registre entradas regularmente (diariamente é ideal)
- ✅ Seja honesta sobre seus sentimentos
- ✅ Comemore os dias com humor alto (≥8)
- ✅ Em dias difíceis, use os prompts de escrita para reflexão

### Para Aumentar os Dias Felizes:
- 🌟 Pratique gratidão (marque emoção "Gratidão")
- 💆‍♀️ Cuide do seu bem-estar físico e mental
- 👥 Conecte-se com pessoas que te fazem bem
- 🎯 Estabeleça pequenas metas diárias alcançáveis

---

## 📝 **RESUMO**

| Métrica | Fórmula | Exemplo |
|---------|---------|---------|
| **Humor Médio** | Soma de todos os humores ÷ Total de entradas | (8+9+7+10) ÷ 4 = 8.5 |
| **Dias Felizes** | Contagem de entradas com humor ≥ 8 | 6 entradas com humor 8+ = 6 |
| **Entradas Esta Semana** | Entradas nos últimos 7 dias | 3 entradas na última semana = 3 |

---

**Espero que esta explicação tenha esclarecido como os cálculos funcionam! Se aparecer "255" ou qualquer outro valor estranho, é um bug que precisa ser investigado no banco de dados.** 💜✨

