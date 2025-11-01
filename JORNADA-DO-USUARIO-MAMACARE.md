# 📍 **Mapa de Páginas e Funcionalidades (Analytics)**

Quando o `user_analytics` registra um acesso, ele salva o caminho (`page`). Para gerar relatórios, convertemos esses caminhos nas funcionalidades reais. Use esta tabela como referência e, sempre que adicionar uma página nova, atualize-a aqui e no CASE das queries.

| Caminho (`page`)                     | Funcionalidade / Descrição                                                                                            |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `/`                                  | Dashboard inicial (rota raiz mostra a visão geral).                                                                    |
| `/dashboard`, `/#/`, `/#/dashboard`  | Variações da rota do Dashboard (hash ou histórico).                                                                    |
| `/consultations`                     | Consultas médicas (listagem, cadastro, notificações).                                                                  |
| `/kick-counter`                      | Contador de chutes.                                                                                                    |
| `/diary`                             | Diário da gestação (humor, notas, fotos).                                                                              |
| `/shopping-list`                     | Lista de compras/enxoval e orçamento.                                                                                  |
| `/birth-plan`                        | Plano de parto (wizard + exportação).                                                                                 |
| `/weight-tracking`                   | Controle de peso (registros, gráficos).                                                                                |
| `/photo-album`                       | Álbum de fotos da barriga.                                                                                             |
| `/progress`                          | Evolução/estatísticas da gestação.                                                                                    |
| `/baby-development`                  | Evolução do bebê para a gestante.                                                                                      |
| `/medical-articles`                  | Biblioteca de artigos médicos.                                                                                        |
| `/profile`                           | Perfil da usuária (dados pessoais).                                                                                    |
| `/setup`, `/pregnancy-setup`         | Wizard de configuração inicial da gestação.                                                                            |
| `/login`, `/reset-password`          | Telas de autenticação (login, recuperação).                                                                            |
| `/guide`, `/pdfs/guia-gestante.pdf`  | Materiais de apoio / guia em PDF.                                                                                      |
| `/analytics`                         | Painel interno de analytics (uso administrativo).                                                                      |
| `/system`                            | Painel administrativo do sistema (uso interno).                                                                        |
| `/baby-development-admin`            | Ferramenta admin para conteúdo de desenvolvimento do bebê.                                                             |
| `/photo-album`                       | Álbum de fotos da barriga (timelapse, evolução).                                                                       |
| `/medical-articles`                  | Biblioteca de artigos médicos.                                                                                        |

> **Obs.:** Qualquer rota não mapeada cai na categoria `outros`. Basta adicionar novas linhas e atualizar o CASE das queries para classificá-las corretamente.

# 🤰 **JORNADA DO USUÁRIO - MAMACARE**

## 📱 **Sistema de Acompanhamento Completo da Gestação**

---

# 🌟 **VISÃO GERAL**

O **MamaCare** é um aplicativo PWA (Progressive Web App) que acompanha a gestante durante toda a sua jornada, desde a descoberta da gravidez até o pós-parto, oferecendo ferramentas para:

✅ Monitoramento da evolução do bebê  
✅ Controle financeiro (lista de compras)  
✅ Diário pessoal da gestação  
✅ Gerenciamento de consultas médicas  
✅ Criação de plano de parto  
✅ Controle de peso da gestante  
✅ Registros de sintomas e medicações  
✅ Artigos médicos por semana  

---

# 🚀 **JORNADA COMPLETA DO USUÁRIO**

---

## **FASE 1: DESCOBERTA E CADASTRO** 🎉

### **Momento:** Descoberta da Gravidez

**Ponto de entrada:**
- Gestante descobre que está grávida
- Busca na internet: "app gravidez", "acompanhar gestação"
- Encontra o MamaCare

### **1.1 - Acesso ao App**

**Ação do usuário:**
```
1. Acessa: mamacare.com (ou URL do app)
2. Vê tela de boas-vindas bonita com animações
3. Opções:
   - 📝 Fazer Login
   - 🎉 Criar Conta (novo usuário)
```

**O que o sistema faz (Logs):**
```javascript
// Analytics coletados:
{
  action: 'page_view',
  page: '/',
  timestamp: '2025-10-26...',
  sessionId: 'uuid...',
  userAgent: 'Chrome/Windows...'
}
```

---

### **1.2 - Registro (Primeira Vez)**

**Ação do usuário:**
```
Clica em "Criar Conta"
   ↓
Preenche formulário:
   - Nome completo
   - Email
   - Senha
   - Data de nascimento
   ↓
Clica em "Cadastrar"
```

**O que o sistema faz:**
```javascript
// 1. Cria usuário no banco de dados
INSERT INTO users (id, name, email, password, birth_date)
VALUES ('uuid', 'Maria Silva', 'maria@email.com', 'hash...', '1990-03-15');

// 2. Registra log de acesso
INSERT INTO access_logs (user_id, action, ip_address, success)
VALUES ('uuid', 'register', '192.168.1.100', true);

// 3. Inicia sessão
INSERT INTO user_sessions (user_id, session_id, start_time)
VALUES ('uuid', 'session-uuid', NOW());

// 4. Redireciona para setup
```

**Mensagem na tela:**
```
✅ Bem-vinda ao MamaCare!
Vamos configurar sua gestação...
```

---

### **1.3 - Setup da Gestação** 📅

**Ação do usuário:**
```
Tela de configuração inicial:

"Quando é a data prevista do parto?"
[  ] [  ] / [  ] [  ] / [  ][  ][  ][  ]
     dia      mês          ano

Exemplo: 30/05/2026

   ↓
"Você já sabe o sexo do bebê?"
( ) Menino
( ) Menina
( ) Ainda não sei

   ↓
"Já escolheu o nome?"
[___________________]

   ↓
[Salvar e Continuar]
```

**O que o sistema faz:**
```javascript
// 1. Cria registro de gravidez
INSERT INTO pregnancies (
  id, user_id, expected_due_date, 
  baby_gender, baby_name, is_active
)
VALUES (
  'uuid', 'user-uuid', '2026-05-30',
  'menina', 'Sofia', true
);

// 2. Calcula automaticamente
const hoje = new Date();
const dataPrevista = new Date('2026-05-30');
const semanasGestacao = calcularSemanas(hoje, dataPrevista);

// 3. Redireciona para Dashboard
```

**Mensagem na tela:**
```
🎉 Tudo pronto!
Você está na semana 24 de gestação!
Bem-vinda ao MamaCare, Maria! 💕
```

---

## **FASE 2: USO DIÁRIO/ROTINEIRO** 📱

### **2.1 - Dashboard (Tela Principal)**

**Quando:** Todo dia ao abrir o app

**O que o usuário vê:**

```
╔════════════════════════════════════════╗
║  💕 MamaCare                           ║
║                                        ║
║  Olá, Maria! 👋                        ║
║  Você está na semana 24 de gestação   ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │  🍊 Tamanho do Bebê               │ ║
║  │  Sofia está do tamanho de uma    │ ║
║  │  MELANCIA! (30cm, 600g)          │ ║
║  │  [Ver mais detalhes]              │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  📅 Próxima Consulta:                 ║
║  Pré-natal - 30/10/2025 às 14:00     ║
║  Dr. João - Hospital Unimed           ║
║                                        ║
║  ⚖️ Último Peso: 68.5 kg              ║
║  📸 Última Foto: Há 3 dias            ║
║                                        ║
║  [Contar Chutes] [Adicionar Peso]    ║
║  [Nova Foto]     [Escrever Diário]   ║
║                                        ║
╚════════════════════════════════════════╝
```

**Resumo da mãe ao lado do bebê:**
1. **Humor e bem-estar:** destaque com o último humor registrado e status de bem-estar (sono, energia, estresse).
2. **Sintomas recentes:** cartõezinhos com sintomas ativos nas últimas 24h, ação rápida para registrar novo sintoma.
3. **Medicações e vitaminas:** lista das próximas doses programadas (ex.: “Ácido fólico — 08:00”), botão “Já tomei” e contador de aderência.
4. **Peso e IMC:** cartão com última pesagem, variação semanal e indicação se está dentro da meta definida pelo médico.
5. **Hábitos saudáveis:** lembretes de hidratação, alongamento, caminhada leve ou descanso.
6. **Checklist diário:** mini lista com ações pessoais (tomar água, fazer anotações no diário, contar chutes, tirar foto).
7. **Atalhos rápidos:** botões para registrar sintoma, tomar medicação, abrir o diário, iniciar contador de chutes ou subir foto.

**O que o sistema faz (Logs):**
```javascript
// Analytics a cada acesso
{
  action: 'page_view',
  page: '/dashboard',
  duration: 45000, // 45 segundos na tela
  metadata: {
    week: 24,
    nextConsultation: '2025-10-30T14:00:00'
  }
}
```

---

### **2.2 - Evolução do Bebê** 👶

**Quando:** Toda semana (notificação automática)

**Fluxo:**

```
Segunda-feira, 8h da manhã:
   ↓
📲 NOTIFICAÇÃO:
"🎉 Você entrou na semana 25!
Veja o que mudou na Sofia!"
   ↓
Usuário clica na notificação
   ↓
Abre tela "Desenvolvimento do Bebê"
```

**O que o usuário vê:**

```
╔════════════════════════════════════════╗
║  👶 Semana 25 de Gestação              ║
║                                        ║
║  🍊 Tamanho: Abóbora                   ║
║  📏 Comprimento: 34cm                  ║
║  ⚖️ Peso: 700g                         ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │  DESENVOLVIMENTO DO BEBÊ          │ ║
║  │  • Os pulmões continuam amadurecen│ ║
║  │  • Já consegue ouvir sua voz!     │ ║
║  │  • Movimenta-se bastante          │ ║
║  │  • As sobrancelhas estão visíveis │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │  O QUE ACONTECE COM VOCÊ          │ ║
║  │  • Possível falta de ar           │ ║
║  │  • Pés inchados são comuns        │ ║
║  │  • Dificuldade para dormir        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  📰 Artigos Recomendados:              ║
║  • Como aliviar o inchaço             ║
║  • Posições para dormir melhor        ║
║  • Preparando o quarto do bebê        ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// 1. Busca dados da semana atual
SELECT * FROM baby_development WHERE week = 25;

// 2. Busca artigos da semana
SELECT * FROM medical_articles WHERE week = 25;

// 3. Registra visualização
INSERT INTO user_analytics (user_id, action, page)
VALUES ('user-uuid', 'page_view', '/baby-development/25');
```

---

### **2.3 - Contador de Chutes do Bebê** 👣

**Quando:** Várias vezes por dia (especialmente tarde/noite)

**Fluxo:**

```
Usuário sente o bebê chutar
   ↓
Abre app → Clica em "Contar Chutes"
   ↓
Tela do contador aparece
```

**Interface:**

```
╔════════════════════════════════════════╗
║  👣 Contador de Chutes                 ║
║                                        ║
║  Contando movimentos da Sofia...      ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │                                   │ ║
║  │         🦶  7  🦶                 │ ║
║  │                                   │ ║
║  │     [Toque para contar]           │ ║
║  │                                   │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ⏱️ Tempo: 00:12:45                   ║
║                                        ║
║  Meta: 10 chutes                       ║
║  Progresso: ████████░░ 70%            ║
║                                        ║
║  [Pausar]  [Finalizar]  [Cancelar]   ║
║                                        ║
║  📊 Histórico de Hoje:                 ║
║  • 10:30 - 10 chutes em 8min          ║
║  • 15:45 - 10 chutes em 12min         ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// A cada chute registrado
INSERT INTO kick_counts (
  id, pregnancy_id, count, 
  duration_minutes, notes
)
VALUES (
  'uuid', 'pregnancy-uuid', 10,
  12, 'Bebê bem ativa hoje!'
);

// Se demorar muito (>30min para 10 chutes)
→ Mostra alerta: "⚠️ Considera contatar seu médico"
```

---

### **2.4 - Controle de Peso** ⚖️

**Quando:** Semanalmente (geralmente segundas-feiras)

**Fluxo:**

```
Usuário se pesa em casa
   ↓
Abre app → "Controle de Peso"
   ↓
Clica em "Adicionar Peso"
```

**Interface:**

```
╔════════════════════════════════════════╗
║  ⚖️ Registrar Peso                     ║
║                                        ║
║  Data: [26/10/2025] 📅                 ║
║                                        ║
║  Peso: [68.5] kg                       ║
║                                        ║
║  Notas (opcional):                     ║
║  [Comendo mais frutas...]              ║
║                                        ║
║  [Salvar]  [Cancelar]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

**Após salvar, mostra gráfico:**

```
╔════════════════════════════════════════╗
║  📊 Evolução do Peso                   ║
║                                        ║
║  Peso Inicial: 62kg                    ║
║  Peso Atual: 68.5kg                    ║
║  Ganho Total: +6.5kg                   ║
║                                        ║
║  kg                                    ║
║  70 ┤                             ●    ║
║  68 ┤                       ●     │    ║
║  66 ┤                 ●     │     │    ║
║  64 ┤           ●     │     │     │    ║
║  62 ┤     ●     │     │     │     │    ║
║     └─────┴─────┴─────┴─────┴─────┘    ║
║     S10  S14   S18   S22   S26         ║
║                                        ║
║  ✅ Ganho dentro do esperado!          ║
║  Meta: 9-12kg total                    ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// Salva peso
INSERT INTO weight_entries (
  id, pregnancy_id, weight, date, notes
)
VALUES (
  'uuid', 'pregnancy-uuid', 68.5, 
  '2025-10-26', 'Comendo mais frutas'
);

// Calcula ganho total
const pesoInicial = 62; // kg
const pesoAtual = 68.5;
const ganhoTotal = pesoAtual - pesoInicial; // 6.5kg

// Verifica se está saudável
if (ganhoTotal > 15) {
  alert('⚠️ Ganho acima do esperado. Consulte seu médico.');
}
```

---

### **2.5 - Diário da Gestação** 📖

**Quando:** Sempre que a gestante quiser desabafar, registrar algo especial

**Fluxo:**

```
Algo especial acontece:
"Hoje senti a Sofia mexer muito forte!"
   ↓
Abre app → Diário → "Nova Entrada"
```

**Interface de Criação:**

```
╔════════════════════════════════════════╗
║  📖 Nova Entrada do Diário             ║
║                                        ║
║  Data: 26/10/2025  Semana: 24         ║
║                                        ║
║  Título:                               ║
║  [Primeira vez que senti forte!]       ║
║                                        ║
║  Como você está se sentindo?           ║
║  😊 Feliz    😢 Triste    😰 Ansiosa   ║
║  😴 Cansada  😊 Animada   😐 Normal    ║
║                                        ║
║  Conte-nos mais:                       ║
║  ┌──────────────────────────────────┐ ║
║  │ Hoje a Sofia mexeu muito forte!  │ ║
║  │ Parecia que estava dançando lá   │ ║
║  │ dentro. Meu marido também sentiu │ ║
║  │ pela primeira vez! Momento       │ ║
║  │ mágico... 💕                      │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  🏷️ Tags:                              ║
║  #primeiravez #emocionante #marido    ║
║                                        ║
║  📎 Anexar: [Foto] [Vídeo]            ║
║                                        ║
║  🎯 Meta/Objetivo (opcional):          ║
║  [Continuar fazendo massagem...]       ║
║                                        ║
║  [Salvar Entrada]  [Cancelar]         ║
║                                        ║
╚════════════════════════════════════════╝
```

**Visualização (Lista):**

```
╔════════════════════════════════════════╗
║  📖 Meu Diário da Gestação             ║
║                                        ║
║  📊 Estatísticas:                      ║
║  45 entradas | 3 fotos | 1 vídeo      ║
║                                        ║
║  Filtros:                              ║
║  [Todas] [Feliz] [Triste] [Ansiosa]   ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 26/10 - Semana 24                │ ║
║  │ 😊 Primeira vez que senti forte!  │ ║
║  │ "Hoje a Sofia mexeu muito..."    │ ║
║  │ #primeiravez #emocionante         │ ║
║  │ [Ver mais]                        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 25/10 - Semana 24                │ ║
║  │ 😴 Cansada mas feliz              │ ║
║  │ "Hoje foi um dia difícil..."     │ ║
║  │ #cansada #trabalho                │ ║
║  │ [Ver mais]                        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  📈 Gráfico de Humor:                  ║
║  [Ver tendências emocionais]           ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// Salva entrada
INSERT INTO diary_entries (
  id, pregnancy_id, title, content,
  mood, tags, goal, photo_url
)
VALUES (
  'uuid', 'pregnancy-uuid', 
  'Primeira vez que senti forte!',
  'Hoje a Sofia mexeu muito forte...',
  'feliz', 
  '["primeiravez", "emocionante", "marido"]',
  'Continuar fazendo massagem',
  'https://...'
);

// Anexos separados
INSERT INTO diary_attachments (
  id, diary_entry_id, file_url, file_type
)
VALUES (
  'uuid', 'entry-uuid', 
  'https://storage.../foto.jpg', 
  'image/jpeg'
);

// Analytics
INSERT INTO user_analytics (
  user_id, action, page, metadata
)
VALUES (
  'user-uuid', 'create_diary_entry', '/diary',
  '{"mood": "feliz", "tags": 3, "hasMedia": true}'
);
```

---

### **2.6 - Álbum de Fotos da Barriga** 📸

**Quando:** Semanalmente ou mensalmente

**Fluxo:**

```
Gestante tira foto da barriga
   ↓
Abre app → "Álbum de Fotos"
   ↓
Clica em "Adicionar Foto"
```

**Interface:**

```
╔════════════════════════════════════════╗
║  📸 Nova Foto da Barriga               ║
║                                        ║
║  Semana: 24                            ║
║  Data: 26/10/2025                      ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │                                   │ ║
║  │      [Selecionar Foto]            │ ║
║  │      ou                           │ ║
║  │      [Tirar Foto Agora]           │ ║
║  │                                   │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  Descrição (opcional):                 ║
║  [Barriga crescendo! 💕]               ║
║                                        ║
║  [Upload e Salvar]                    ║
║                                        ║
╚════════════════════════════════════════╝
```

**Visualização (Grade de Fotos):**

```
╔════════════════════════════════════════╗
║  📸 Álbum de Fotos                     ║
║                                        ║
║  Evolução da Barriga                   ║
║  20 fotos | De S12 a S24               ║
║                                        ║
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     ║
║  │ S12 │ │ S14 │ │ S16 │ │ S18 │     ║
║  │ 🌸  │ │ 🌸  │ │ 🌸  │ │ 🌸  │     ║
║  └─────┘ └─────┘ └─────┘ └─────┘     ║
║                                        ║
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     ║
║  │ S20 │ │ S22 │ │ S24 │ │ USB │     ║
║  │ 🌸  │ │ 🌸  │ │ 🌸  │ │ 📷  │     ║
║  └─────┘ └─────┘ └─────┘ └─────┘     ║
║                                        ║
║  [Ver Timelapse]  [Compartilhar]      ║
║                                        ║
╚════════════════════════════════════════╝
```

**Recurso Extra: Timelapse**
```
Clica em "Ver Timelapse"
   ↓
Sistema cria vídeo automático
mostrando evolução da barriga
   ↓
Pode compartilhar ou baixar
```

**O que o sistema faz:**
```javascript
// 1. Upload da foto para Supabase Storage
const fileUrl = await uploadToSupabase(file, 'photos/pregnancies');

// 2. Salva referência no banco
INSERT INTO photos (
  id, pregnancy_id, photo_url, 
  week, caption, taken_at
)
VALUES (
  'uuid', 'pregnancy-uuid',
  'https://storage.../foto.jpg',
  24, 'Barriga crescendo! 💕',
  '2025-10-26'
);

// 3. Para timelapse (ao clicar):
SELECT photo_url, week 
FROM photos 
WHERE pregnancy_id = 'uuid'
ORDER BY week ASC;
// Cria vídeo com transições
```

---

### **2.7 - Gerenciamento de Consultas** 📅

**Quando:** Toda vez que agendar consulta médica

**Fluxo 1: Agendar Nova Consulta**

```
Médico agenda consulta
   ↓
Gestante abre app → "Consultas"
   ↓
Clica em "Adicionar Consulta"
```

**Interface de Criação:**

```
╔════════════════════════════════════════╗
║  📅 Agendar Consulta                   ║
║                                        ║
║  Título:                               ║
║  [Pré-natal - Ultrassom morfológico]   ║
║                                        ║
║  Data:                                 ║
║  [30] / [10] / [2025]                  ║
║                                        ║
║  Horário:                              ║
║  [14] : [00]                           ║
║                                        ║
║  Local:                                ║
║  [Hospital Unimed - Sala 302]          ║
║                                        ║
║  Médico:                               ║
║  [Dr. João Silva]                      ║
║                                        ║
║  Tipo:                                 ║
║  ( ) Pré-natal                         ║
║  (●) Ultrassom                         ║
║  ( ) Exame de sangue                   ║
║  ( ) Outro                             ║
║                                        ║
║  Notas:                                ║
║  [Levar exames anteriores]             ║
║                                        ║
║  🔔 Lembrar:                           ║
║  [✓] 1 dia antes                       ║
║  [✓] 1 hora antes                      ║
║                                        ║
║  [Salvar]  [Cancelar]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

**Visualização (Lista de Consultas):**

```
╔════════════════════════════════════════╗
║  📅 Minhas Consultas                   ║
║                                        ║
║  🔜 Próximas Consultas                 ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 30/10/2025 - 14:00 🔔             │ ║
║  │ Pré-natal - Ultrassom morfológico│ ║
║  │ 📍 Hospital Unimed - Sala 302     │ ║
║  │ 👨‍⚕️ Dr. João Silva                 │ ║
║  │ 📝 Levar exames anteriores        │ ║
║  │ [Editar] [Cancelar] [Mapa]        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 15/11/2025 - 10:00                │ ║
║  │ Pré-natal de rotina               │ ║
║  │ 📍 Hospital Unimed                │ ║
║  │ 👨‍⚕️ Dr. João Silva                 │ ║
║  │ [Ver detalhes]                    │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ✅ Consultas Realizadas (12)         ║
║  [Ver histórico]                       ║
║                                        ║
╚════════════════════════════════════════╝
```

**Fluxo 2: Notificação de Lembrete**

```
24h antes da consulta:
   ↓
📲 NOTIFICAÇÃO PUSH:
"📅 Lembrete: Amanhã você tem consulta!
Pré-natal - 30/10 às 14:00
Dr. João Silva - Hospital Unimed"
   ↓
Usuário clica → Abre detalhes
```

**1h antes:**
```
📲 NOTIFICAÇÃO:
"⏰ SUA CONSULTA É DAQUI 1 HORA!
Pré-natal - 14:00
📍 Hospital Unimed - Sala 302
[Ver no mapa] [OK]"
```

**O que o sistema faz:**
```javascript
// 1. Salva consulta
INSERT INTO consultations (
  id, pregnancy_id, title, date,
  location, doctor, type, notes
)
VALUES (
  'uuid', 'pregnancy-uuid',
  'Pré-natal - Ultrassom morfológico',
  '2025-10-30 14:00:00',
  'Hospital Unimed - Sala 302',
  'Dr. João Silva',
  'ultrassom',
  'Levar exames anteriores'
);

// 2. Agenda notificações
INSERT INTO consultation_notifications (
  id, consultation_id, 
  notification_type, scheduled_for, sent
)
VALUES 
  ('uuid1', 'consult-uuid', '24h', '2025-10-29 14:00:00', false),
  ('uuid2', 'consult-uuid', '1h', '2025-10-30 13:00:00', false);

// 3. Cron Job roda a cada hora
// Verifica notificações pendentes
SELECT * FROM consultation_notifications
WHERE scheduled_for <= NOW() AND sent = false;

// 4. Envia push notification
sendPushNotification(subscription, {
  title: '📅 Lembrete: Amanhã você tem consulta!',
  body: 'Pré-natal - 30/10 às 14:00...',
  data: { consultationId: 'uuid' }
});

// 5. Marca como enviada
UPDATE consultation_notifications 
SET sent = true 
WHERE id = 'uuid1';
```

---

### **2.8 - Lista de Compras (Controle de Gastos)** 🛒

**Quando:** Preparando enxoval, organizando compras

**Fluxo:**

```
Gestante pensa:
"Preciso comprar fraldas e roupinhas"
   ↓
Abre app → "Lista de Compras"
   ↓
Clica em "Adicionar Item"
```

**Interface:**

```
╔════════════════════════════════════════╗
║  🛒 Lista de Compras                   ║
║                                        ║
║  💰 Orçamento Total: R$ 5.000,00       ║
║  💸 Já Comprado: R$ 2.350,00 (47%)     ║
║  💵 Restante: R$ 2.650,00              ║
║                                        ║
║  Categorias:                           ║
║  [Todas] [Roupas] [Fraldas] [Móveis]  ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ ROUPAS (8 itens)                  │ ║
║  │                                   │ ║
║  │ [✓] Body manga longa (6un)        │ ║
║  │     R$ 120,00 - Comprado em 10/10 │ ║
║  │                                   │ ║
║  │ [ ] Macacões (3un)                │ ║
║  │     R$ 150,00 - Alta prioridade   │ ║
║  │                                   │ ║
║  │ [ ] Meias (10 pares)              │ ║
║  │     R$ 50,00                      │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ FRALDAS & HIGIENE (5 itens)       │ ║
║  │                                   │ ║
║  │ [✓] Fraldas RN (100un)            │ ║
║  │     R$ 80,00                      │ ║
║  │                                   │ ║
║  │ [ ] Lenços umedecidos (5 pacotes) │ ║
║  │     R$ 45,00                      │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  [+ Adicionar Item]                   ║
║                                        ║
╚════════════════════════════════════════╝
```

**Adicionar Item:**

```
╔════════════════════════════════════════╗
║  📝 Novo Item                          ║
║                                        ║
║  Nome:                                 ║
║  [Carrinho de bebê]                    ║
║                                        ║
║  Categoria:                            ║
║  [Móveis ▼]                            ║
║                                        ║
║  Quantidade:                           ║
║  [1]                                   ║
║                                        ║
║  Preço estimado:                       ║
║  R$ [800,00]                           ║
║                                        ║
║  Prioridade:                           ║
║  ( ) Baixa  (●) Média  ( ) Alta        ║
║                                        ║
║  Notas:                                ║
║  [Pesquisar modelo 3 rodas]            ║
║                                        ║
║  [Salvar]  [Cancelar]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

**Marcar como Comprado:**

```
Usuário compra o item
   ↓
Clica na checkbox do item
   ↓
Popup: "Valor real pago?"
[R$ 750,00]
"Onde comprou?"
[Magazine Luiza]
[Confirmar]
   ↓
Item marcado como comprado ✅
Valor atualiza automaticamente
```

**O que o sistema faz:**
```javascript
// Adiciona item
INSERT INTO shopping_items (
  id, pregnancy_id, name, 
  category, quantity, estimated_price,
  priority, notes, purchased
)
VALUES (
  'uuid', 'pregnancy-uuid',
  'Carrinho de bebê',
  'moveis', 1, 800.00,
  'media', 'Pesquisar modelo 3 rodas',
  false
);

// Marcar como comprado
UPDATE shopping_items
SET 
  purchased = true,
  actual_price = 750.00,
  purchase_date = NOW(),
  store = 'Magazine Luiza'
WHERE id = 'uuid';

// Calcular totais
SELECT 
  COALESCE(SUM(estimated_price), 0) as orcamento_total,
  COALESCE(SUM(CASE WHEN purchased THEN actual_price ELSE 0 END), 0) as ja_comprado,
  COALESCE(SUM(CASE WHEN NOT purchased THEN estimated_price ELSE 0 END), 0) as restante
FROM shopping_items
WHERE pregnancy_id = 'pregnancy-uuid';
```

---

## **FASE 3: PREPARAÇÃO PARA O PARTO** 🏥

### **3.1 - Plano de Parto** 📋

**Quando:** Entre semana 28-35 (3º trimestre)

**Fluxo:**

```
Gestante decide criar plano de parto
   ↓
Abre app → "Plano de Parto"
   ↓
Clica em "Criar Meu Plano"
```

**Interface (Wizard Multi-Etapas):**

```
╔════════════════════════════════════════╗
║  📋 Criar Plano de Parto               ║
║                                        ║
║  Passo 1 de 7: Informações Básicas    ║
║  ████████░░░░░░░░░░░░░░░░░░░ 14%      ║
║                                        ║
║  📍 Onde você quer dar à luz?          ║
║  ( ) Hospital                          ║
║  ( ) Casa de parto                     ║
║  ( ) Em casa                           ║
║                                        ║
║  🏥 Qual hospital/local?                ║
║  [Hospital Unimed Chapecó]             ║
║                                        ║
║  👨‍⚕️ Nome do seu médico:               ║
║  [Dr. João Silva]                      ║
║                                        ║
║  👶 Tipo de parto desejado:            ║
║  ( ) Normal/Vaginal                    ║
║  ( ) Cesárea                           ║
║  ( ) Ainda não decidi                  ║
║                                        ║
║  [Próximo Passo →]                     ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 2: Alívio da Dor**

```
╔════════════════════════════════════════╗
║  Passo 2 de 7: Alívio da Dor           ║
║  ████████████░░░░░░░░░░░░░░ 28%       ║
║                                        ║
║  💊 Como você prefere aliviar a dor?   ║
║  (Pode selecionar múltiplas opções)    ║
║                                        ║
║  [✓] Métodos naturais (respiração)     ║
║  [✓] Massagem                          ║
║  [✓] Banho quente/hidroterapia         ║
║  [ ] Epidural                          ║
║  [ ] Óxido nitroso                     ║
║  [ ] Outros medicamentos               ║
║                                        ║
║  Observações:                          ║
║  [Gostaria de tentar natural primeiro,│
║   mas aberta para epidural se necessário]║
║                                        ║
║  [← Voltar]  [Próximo →]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 3: Ambiente**

```
╔════════════════════════════════════════╗
║  Passo 3 de 7: Ambiente do Parto       ║
║  ████████████████░░░░░░░░░ 42%        ║
║                                        ║
║  🏠 Como você imagina o ambiente?      ║
║                                        ║
║  💡 Iluminação:                        ║
║  ( ) Luzes fortes                      ║
║  (●) Luzes suaves/baixas               ║
║  ( ) Sem preferência                   ║
║                                        ║
║  🎵 Música:                            ║
║  [✓] Sim, gostaria de música ambiente  ║
║  Tipo: [Clássica/Relaxante]            ║
║                                        ║
║  🌸 Aromaterapia:                      ║
║  [✓] Sim                               ║
║                                        ║
║  📸 Fotos/Vídeos:                      ║
║  [✓] Permitir fotografias              ║
║  [ ] Permitir filmagem                 ║
║                                        ║
║  [← Voltar]  [Próximo →]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 4: Acompanhantes**

```
╔════════════════════════════════════════╗
║  Passo 4 de 7: Acompanhantes           ║
║  ████████████████████░░░░░ 57%        ║
║                                        ║
║  👥 Quem você quer ao seu lado?        ║
║                                        ║
║  [✓] Meu esposo/companheiro            ║
║      Nome: [Carlos Silva]              ║
║                                        ║
║  [✓] Doula                             ║
║      Nome: [Ana Costa]                 ║
║                                        ║
║  [ ] Minha mãe                         ║
║  [ ] Outra pessoa                      ║
║                                        ║
║  [← Voltar]  [Próximo →]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 5: Durante o Parto**

```
╔════════════════════════════════════════╗
║  Passo 5 de 7: Durante o Parto         ║
║  ████████████████████████░ 71%        ║
║                                        ║
║  👶 Suas preferências:                 ║
║                                        ║
║  Posição para dar à luz:               ║
║  ( ) Deitada                           ║
║  (●) De cócoras                        ║
║  ( ) De lado                           ║
║  ( ) Sem preferência                   ║
║                                        ║
║  Corte do cordão umbilical:            ║
║  (●) Clampeamento tardio (1-3min)      ║
║  ( ) Clampeamento imediato             ║
║  [ ] Pai/acompanhante corta cordão     ║
║                                        ║
║  Contato pele a pele:                  ║
║  [✓] Sim, imediatamente após nascer    ║
║                                        ║
║  [← Voltar]  [Próximo →]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 6: Pós-Parto**

```
╔════════════════════════════════════════╗
║  Passo 6 de 7: Pós-Parto               ║
║  ████████████████████████████ 85%     ║
║                                        ║
║  🍼 Após o nascimento:                 ║
║                                        ║
║  Amamentação:                          ║
║  [✓] Gostaria de amamentar na         ║
║      primeira hora após o parto        ║
║                                        ║
║  Alojamento conjunto:                  ║
║  [✓] Bebê fica comigo no quarto        ║
║                                        ║
║  Procedimentos com o bebê:             ║
║  [✓] Vitamina K                        ║
║  [✓] Colírio nos olhos                 ║
║  [✓] Teste do pezinho                  ║
║  [✓] Vacinas                           ║
║                                        ║
║  [← Voltar]  [Próximo →]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Passo 7: Pedidos Especiais e Emergências**

```
╔════════════════════════════════════════╗
║  Passo 7 de 7: Finalizando             ║
║  ████████████████████████████████ 100%║
║                                        ║
║  ✨ Pedidos especiais:                 ║
║  ┌──────────────────────────────────┐ ║
║  │ Gostaria que meu esposo ficasse   │ ║
║  │ comigo o tempo todo. Quero um     │ ║
║  │ ambiente tranquilo e acolhedor.   │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  🚨 Em caso de emergência/cesárea:     ║
║  ┌──────────────────────────────────┐ ║
║  │ Se cesárea for necessária, gostaria│
║  │ de que meu esposo entre comigo na │ ║
║  │ sala e que eu possa ver o bebê    │ ║
║  │ imediatamente após o nascimento.  │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  [← Voltar]  [Salvar Plano]           ║
║                                        ║
╚════════════════════════════════════════╝
```

**Após salvar:**

```
╔════════════════════════════════════════╗
║  ✅ Plano de Parto Criado!             ║
║                                        ║
║  Seu plano foi salvo com sucesso!      ║
║                                        ║
║  O que fazer agora:                    ║
║                                        ║
║  [📥 Exportar PDF]                     ║
║  [📤 Compartilhar com médico]          ║
║  [✏️ Editar Plano]                     ║
║  [👀 Visualizar]                       ║
║                                        ║
║  💡 Dica: Leve uma cópia impressa      ║
║  do seu plano para o hospital!         ║
║                                        ║
╚════════════════════════════════════════╝
```

**Exportar PDF:**

```
Usuário clica em "Exportar PDF"
   ↓
Sistema gera PDF bonito e formatado
   ↓
Nova janela abre com o plano
   ↓
Usuário pode:
- Salvar como PDF
- Imprimir
- Compartilhar
```

**O que o sistema faz:**
```javascript
// Salva plano (todos os passos)
INSERT INTO birth_plans (
  id, pregnancy_id, location, birth_type,
  hospital, doctor, doula, pain_relief,
  environment, companions, support_team,
  birth_preferences, post_birth,
  special_requests, emergency_preferences
)
VALUES (
  'uuid', 'pregnancy-uuid',
  'hospital', 'normal',
  'Hospital Unimed Chapecó',
  'Dr. João Silva',
  'Ana Costa',
  '{"natural": true, "massage": true, "epidural": false}',
  '{"lighting": "soft", "music": true, "aromatherapy": true}',
  'Esposo e Doula',
  '{"partner": true, "doula": true}',
  '{"position": "squatting", "cordClamping": "delayed", "skinToSkin": true}',
  '{"breastfeeding": true, "rooming": true, "vitaminK": true}',
  'Esposo comigo o tempo todo...',
  'Se cesárea necessária, esposo entra...'
);

// Para exportar PDF:
// Usa método de impressão nativa do navegador
// Gera HTML bonito e formatado
// Abre em nova janela
```

---

### **3.2 - Registros de Sintomas** 🤒

**Quando:** Quando sentir algo diferente

**Fluxo:**

```
Gestante sente dor de cabeça forte
   ↓
Abre app → "Sintomas"
   ↓
Clica em "Registrar Sintoma"
```

**Interface:**

```
╔════════════════════════════════════════╗
║  🤒 Registrar Sintoma                  ║
║                                        ║
║  Data/Hora: 26/10/2025 - 15:30        ║
║                                        ║
║  Tipo de sintoma:                      ║
║  [Dor de cabeça ▼]                     ║
║                                        ║
║  Intensidade:                          ║
║  ○─────●─────○  (Média)                ║
║  Leve    Forte                         ║
║                                        ║
║  Duração:                              ║
║  [2] horas                             ║
║                                        ║
║  Descrição:                            ║
║  [Dor latejante na testa, começou     │
║   depois do almoço]                    ║
║                                        ║
║  O que você fez:                       ║
║  [Tomei paracetamol e deitei]          ║
║                                        ║
║  [Salvar]  [Cancelar]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

**Histórico de Sintomas:**

```
╔════════════════════════════════════════╗
║  🤒 Histórico de Sintomas              ║
║                                        ║
║  📊 Sintomas mais frequentes:          ║
║  1. Azia (15x)                         ║
║  2. Dor nas costas (12x)               ║
║  3. Dor de cabeça (8x)                 ║
║                                        ║
║  📅 Últimos 7 dias:                    ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 26/10 - 15:30                     │ ║
║  │ 🤕 Dor de cabeça (Média)          │ ║
║  │ Duração: 2h                       │ ║
║  │ "Dor latejante na testa..."       │ ║
║  │ [Ver mais]                        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ⚠️ Alerta:                            ║
║  Você teve 3 dores de cabeça esta     ║
║  semana. Considera falar com seu      ║
║  médico na próxima consulta.          ║
║                                        ║
║  [Exportar Relatório]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// Salva sintoma
INSERT INTO symptoms (
  id, pregnancy_id, type, intensity,
  duration_hours, description, 
  what_helped, occurred_at
)
VALUES (
  'uuid', 'pregnancy-uuid',
  'dor_de_cabeca', 7, // intensidade 0-10
  2, 'Dor latejante na testa...',
  'Tomei paracetamol e deitei',
  '2025-10-26 15:30:00'
);

// Detecta padrões
SELECT type, COUNT(*) as count
FROM symptoms
WHERE pregnancy_id = 'uuid'
  AND occurred_at >= NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY count DESC;

// Se sintoma grave (intensidade > 8) ou recorrente
// Mostra alerta para contatar médico
```

---

### **3.3 - Medicações** 💊

**Quando:** Tomando vitaminas, medicamentos

**Interface:**

```
╔════════════════════════════════════════╗
║  💊 Minhas Medicações                  ║
║                                        ║
║  🔔 Lembretes Ativos: 3                ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ Ácido Fólico                      │ ║
║  │ 💊 1 comprimido - 400mcg           │ ║
║  │ ⏰ Todos os dias às 8:00           │ ║
║  │ 📅 Iniciado em: 01/05/2025         │ ║
║  │ 👨‍⚕️ Prescrito por: Dr. João        │ ║
║  │                                   │ ║
║  │ Histórico:                        │ ║
║  │ [✓] 26/10 - 8:05 ✅               │ ║
║  │ [✓] 25/10 - 8:10 ✅               │ ║
║  │ [✗] 24/10 - Não tomado ❌         │ ║
║  │                                   │ ║
║  │ [Editar] [Marcar como tomado]     │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  [+ Adicionar Medicação]              ║
║                                        ║
╚════════════════════════════════════════╝
```

**Notificação de Lembrete:**

```
Todo dia às 8:00:
   ↓
📲 NOTIFICAÇÃO:
"💊 Hora da medicação!
Ácido Fólico - 1 comprimido (400mcg)
[Já tomei] [Lembrar em 30min]"
   ↓
Usuário clica "Já tomei"
   ↓
Sistema registra que foi tomado
```

---

## **FASE 4: COMUNIDADE E SUPORTE** 👥

### **4.1 - Comunidade de Gestantes** 💬

**Quando:** Quando quiser compartilhar, tirar dúvidas, fazer amizades

**Fluxo:**

```
Gestante tem dúvida ou quer compartilhar
   ↓
Abre app → "Comunidade"
   ↓
Vê posts de outras gestantes
```

**Interface (Feed):**

```
╔════════════════════════════════════════╗
║  👥 Comunidade MamaCare                ║
║                                        ║
║  [Nova Publicação]                     ║
║                                        ║
║  Filtrar por:                          ║
║  [Todas] [Seguindo] [Semana 24]       ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 👤 Ana Silva • Semana 25 • 2h     │ ║
║  │                                   │ ║
║  │ Alguém mais com muito inchaço nos │ ║
║  │ pés? O que vocês fazem para       │ ║
║  │ aliviar? 😓                        │ ║
║  │                                   │ ║
║  │ ❤️ 12  💬 8  🔖 Salvar             │ ║
║  │                                   │ ║
║  │ 💬 Comentários (8):                │ ║
║  │ Maria: Elevo as pernas! Ajuda...  │ ║
║  │ Julia: Massagem nos pés...        │ ║
║  │ [Ver todos]                       │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 👤 Carla Oliveira • S 23 • 5h     │ ║
║  │                                   │ ║
║  │ Gente, hoje foi a primeira vez que│ ║
║  │ meu marido sentiu a Sofia chutar! │ ║
║  │ Momento mágico! 💕✨               │ ║
║  │ [📸 foto]                          │ ║
║  │                                   │ ║
║  │ ❤️ 45  💬 15                       │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
╚════════════════════════════════════════╝
```

**Criar Publicação:**

```
╔════════════════════════════════════════╗
║  📝 Nova Publicação                    ║
║                                        ║
║  O que você quer compartilhar?         ║
║  ┌──────────────────────────────────┐ ║
║  │ Meninas, alguém tem dica de      │ ║
║  │ exercício para dor nas costas?   │ ║
║  │ Estou sofrendo muito... 😓        │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  📎 [Adicionar Foto]                   ║
║                                        ║
║  🏷️ Tags:                              ║
║  #dornascostas #ajuda #semana24        ║
║                                        ║
║  [Publicar]  [Cancelar]               ║
║                                        ║
╚════════════════════════════════════════╝
```

**O que o sistema faz:**
```javascript
// Salva post
INSERT INTO community_posts (
  id, user_id, content, tags,
  likes, comments_count
)
VALUES (
  'uuid', 'user-uuid',
  'Meninas, alguém tem dica...',
  '["dornascostas", "ajuda", "semana24"]',
  0, 0
);

// Salva comentário
INSERT INTO community_comments (
  id, post_id, user_id, content
)
VALUES (
  'uuid', 'post-uuid', 'other-user-uuid',
  'Eu faço yoga! Ajuda muito...'
);

// Incrementa contador de comentários
UPDATE community_posts
SET comments_count = comments_count + 1
WHERE id = 'post-uuid';
```

---

## **FASE 5: LOGS E ANALYTICS** 📊

### **O que o sistema registra automaticamente:**

#### **5.1 - Logs de Acesso**

```javascript
// Tabela: access_logs
{
  id: 'uuid',
  userId: 'user-uuid',
  email: 'maria@email.com',
  action: 'login', // login, logout, register, password_reset
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  success: true,
  errorMessage: null,
  sessionId: 'session-uuid',
  createdAt: '2025-10-26 08:00:00'
}
```

**Exemplos de ações registradas:**
- `register` - Usuário criou conta
- `login` - Usuário fez login
- `logout` - Usuário fez logout
- `password_reset` - Usuário resetou senha

---

#### **5.2 - Analytics de Comportamento**

```javascript
// Tabela: user_analytics
{
  id: 'uuid',
  userId: 'user-uuid',
  sessionId: 'session-uuid',
  action: 'page_view', // page_view, click, scroll, focus, blur
  page: '/dashboard', // rota acessada
  element: null, // id do elemento clicado
  duration: 45000, // tempo na página (ms)
  metadata: {
    week: 24,
    nextConsultation: '2025-10-30...'
  },
  timestamp: '2025-10-26 08:05:00'
}
```

**Exemplos de ações:**
- `page_view` - Visualizou página
- `click` - Clicou em botão/link
- `scroll` - Rolou a página
- `focus` - Focou em campo de input
- `blur` - Desfocou de campo

---

#### **5.3 - Sessões de Usuário**

```javascript
// Tabela: user_sessions
{
  id: 'uuid',
  userId: 'user-uuid',
  sessionId: 'session-uuid-123',
  startTime: '2025-10-26 08:00:00',
  endTime: '2025-10-26 08:45:00',
  totalDuration: 2700 // 45 minutos (em segundos)
}
```

---

#### **5.4 - Logs de Auditoria (Modificações)**

```javascript
// Tabela: audit_logs
{
  id: 'uuid',
  userId: 'user-uuid',
  sessionId: 'session-uuid',
  tableName: 'consultations',
  recordId: 'consultation-uuid',
  action: 'update', // create, update, delete
  oldValues: {
    date: '2025-10-30 14:00:00',
    location: 'Hospital A'
  },
  newValues: {
    date: '2025-10-30 15:00:00',
    location: 'Hospital Unimed'
  },
  changedFields: ['date', 'location'],
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2025-10-26 10:00:00'
}
```

**O que é auditado:**
- ✅ Criação/edição/exclusão de consultas
- ✅ Modificações no plano de parto
- ✅ Edições no perfil
- ✅ Alterações na gravidez (nome do bebê, sexo, etc.)
- ✅ Exclusões de fotos/diário

---

### **5.5 - Consultas SQL para Análise**

**Usuários mais ativos:**
```sql
SELECT 
  u.name,
  u.email,
  COUNT(*) as total_actions,
  SUM(CASE WHEN ua.action = 'page_view' THEN 1 ELSE 0 END) as page_views,
  SUM(CASE WHEN ua.action = 'click' THEN 1 ELSE 0 END) as clicks
FROM user_analytics ua
JOIN users u ON ua.user_id = u.id
WHERE ua.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.name, u.email
ORDER BY total_actions DESC
LIMIT 10;
```

**Páginas mais visitadas:**
```sql
SELECT 
  page,
  COUNT(*) as total_visits,
  AVG(duration) as avg_duration_ms,
  AVG(duration) / 1000 as avg_duration_sec
FROM user_analytics
WHERE action = 'page_view'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page
ORDER BY total_visits DESC;
```

**Taxa de engajamento por funcionalidade:**
```sql
SELECT 
  CASE 
    WHEN page LIKE '%kick-counter%' THEN 'Contador de Chutes'
    WHEN page LIKE '%consultations%' THEN 'Consultas'
    WHEN page LIKE '%diary%' THEN 'Diário'
    WHEN page LIKE '%birth-plan%' THEN 'Plano de Parto'
    WHEN page LIKE '%weight%' THEN 'Controle de Peso'
    WHEN page LIKE '%photo%' THEN 'Álbum de Fotos'
    WHEN page LIKE '%shopping%' THEN 'Lista de Compras'
    WHEN page LIKE '%community%' THEN 'Comunidade'
    ELSE 'Outros'
  END as funcionalidade,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  COUNT(*) as total_acessos,
  AVG(duration) / 1000 as tempo_medio_seg
FROM user_analytics
WHERE action = 'page_view'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY funcionalidade
ORDER BY total_acessos DESC;
```

**Retenção de usuários:**
```sql
SELECT 
  DATE(start_time) as dia,
  COUNT(DISTINCT user_id) as usuarios_ativos,
  AVG(total_duration) / 60 as tempo_medio_min
FROM user_sessions
WHERE start_time >= NOW() - INTERVAL '30 days'
GROUP BY dia
ORDER BY dia DESC;
```

---

## **FASE 6: NOTIFICAÇÕES E LEMBRETES** 🔔

### **6.1 - Tipos de Notificações**

**1. Consultas (24h e 1h antes)**
```
📅 Lembrete de Consulta
Pré-natal amanhã às 14:00
Dr. João - Hospital Unimed
```

**2. Evolução Semanal**
```
🎉 Nova Semana de Gestação!
Você entrou na semana 25!
Veja o que mudou na Sofia →
```

**3. Medicações**
```
💊 Hora da Medicação
Ácido Fólico - 1 comprimido
```

**4. Lembrete de Peso**
```
⚖️ Que tal registrar seu peso?
Faz 7 dias desde o último registro
```

**5. Chutes do Bebê**
```
👣 Conte os chutes hoje!
Já contou os movimentos da Sofia?
```

**6. Comunidade**
```
💬 Novo comentário no seu post
Ana Silva comentou: "Eu também..."
```

---

## **FASE 7: PÓS-PARTO (FUTURO)** 👶

*Funcionalidades planejadas para após o nascimento:*

- ✅ Registro de amamentação
- ✅ Controle de trocas de fraldas
- ✅ Diário do bebê
- ✅ Álbum de fotos do bebê
- ✅ Acompanhamento de desenvolvimento
- ✅ Vacinação

---

## 📊 **RESUMO DA JORNADA**

```
DESCOBERTA DA GRAVIDEZ
   ↓
CADASTRO NO APP
   ↓
SETUP DA GESTAÇÃO (DPP, nome, sexo)
   ↓
USO DIÁRIO:
├── Ver evolução do bebê (semanal)
├── Contar chutes (diário)
├── Registrar peso (semanal)
├── Escrever diário (quando quiser)
├── Tirar fotos da barriga (periódico)
├── Gerenciar consultas (conforme agenda)
├── Lista de compras (preparação)
├── Registrar sintomas (quando necessário)
└── Interagir na comunidade (quando quiser)
   ↓
PREPARAÇÃO (3º TRIMESTRE):
├── Criar plano de parto
├── Finalizar compras
└── Preparar bolsa maternidade
   ↓
PARTO
   ↓
PÓS-PARTO (futuro)
```

---

## 🎯 **PROBLEMAS QUE O MAMACARE RESOLVE**

✅ **Organização:** Tudo sobre a gestação em um único lugar  
✅ **Lembretes:** Nunca esquecer consultas ou medicações  
✅ **Acompanhamento:** Ver evolução do bebê semana a semana  
✅ **Memórias:** Registrar momentos especiais no diário  
✅ **Controle:** Gastos, peso, sintomas tudo monitorado  
✅ **Preparação:** Plano de parto bem estruturado  
✅ **Segurança:** Contador de chutes para monitorar bebê  
✅ **Comunidade:** Suporte de outras gestantes  
✅ **Informação:** Artigos médicos relevantes por semana  

---

## 💡 **DIFERENCIAIS DO MAMACARE**

1. **PWA (Progressive Web App):**
   - Funciona offline
   - Instalável no celular
   - Notificações push
   - Não precisa baixar da Play Store/App Store

2. **Completo:**
   - Não é só um tracker, é um companion completo
   - Integra múltiplas funcionalidades

3. **Inteligente:**
   - Detecta padrões (sintomas recorrentes)
   - Alertas personalizados
   - Cálculos automáticos (semana gestacional, ganho de peso)

4. **Comunidade:**
   - Conecta gestantes
   - Compartilha experiências
   - Suporte mútuo

5. **Privacidade:**
   - Dados criptografados
   - Cada usuária vê apenas seus dados
   - Logs de auditoria completos

---

## 🎉 **FIM DA JORNADA**

O **MamaCare** acompanha a gestante do início ao fim, oferecendo ferramentas práticas, informações confiáveis e uma comunidade acolhedora para tornar a jornada da maternidade mais tranquila, organizada e especial! 💕

