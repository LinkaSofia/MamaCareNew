import { storage } from "./storage";

const medicalArticlesData = [
  // Semana 4
  {
    week: 4,
    title: "Primeiros Sinais da Gravidez",
    summary: "Conheça os primeiros sinais que indicam uma gravidez e quando procurar orientação médica.",
    content: `
# Primeiros Sinais da Gravidez

Na 4ª semana de gravidez, você pode começar a notar alguns sinais iniciais. É importante estar atenta aos seguintes sintomas:

## Principais Sinais:
- Atraso menstrual (se o ciclo é regular)
- Sensibilidade nos seios
- Náuseas matinais (podem ocorrer a qualquer hora do dia)
- Fadiga e cansaço excessivo
- Mudanças no olfato e paladar

## O que está acontecendo:
O embrião está se implantando no útero e começando a produzir o hormônio hCG, responsável pela maioria dos sintomas iniciais da gravidez.

## Quando procurar o médico:
- Confirme a gravidez com teste
- Agende sua primeira consulta de pré-natal
- Comece a tomar ácido fólico se ainda não iniciou

Lembre-se: cada mulher é única e pode experimentar sintomas diferentes.
    `,
    source: "Hospital Albert Einstein",
    sourceUrl: "https://www.einstein.br/gravidez",
    category: "health",
    importance: "high",
    readingTime: 3,
    tags: ["sintomas", "diagnóstico", "primeiro trimestre"]
  },

  // Semana 8
  {
    week: 8,
    title: "Alimentação Saudável no Primeiro Trimestre",
    summary: "Dicas essenciais de nutrição para garantir o desenvolvimento saudável do bebê.",
    content: `
# Alimentação Saudável no Primeiro Trimestre

Na 8ª semana, a alimentação adequada é fundamental para o desenvolvimento do seu bebê.

## Nutrientes Essenciais:
- **Ácido Fólico**: 400-800mcg diariamente
- **Ferro**: Para prevenir anemia
- **Cálcio**: Para formação dos ossos do bebê
- **Proteínas**: Para crescimento celular

## Alimentos Recomendados:
- Vegetais verdes escuros (espinafre, brócolis)
- Frutas cítricas (laranja, limão)
- Carnes magras e peixes
- Laticínios com baixo teor de gordura
- Cereais integrais

## Alimentos a Evitar:
- Peixes com alto teor de mercúrio
- Carnes cruas ou mal passadas
- Queijos não pasteurizados
- Álcool e cafeína em excesso

## Dica Importante:
Se estiver com náuseas, faça pequenas refeições frequentes e mantenha-se hidratada.
    `,
    source: "Hospital Sírio-Libanês",
    sourceUrl: "https://www.hospitalsiriolibanes.org.br",
    category: "nutrition",
    importance: "high",
    readingTime: 4,
    tags: ["nutrição", "alimentação", "vitaminas"]
  },

  // Semana 12
  {
    week: 12,
    title: "Exames do Primeiro Trimestre",
    summary: "Entenda a importância dos exames realizados nas primeiras 12 semanas de gravidez.",
    content: `
# Exames do Primeiro Trimestre

Aos 3 meses de gravidez, diversos exames são essenciais para monitorar sua saúde e do bebê.

## Exames de Sangue:
- **Hemograma completo**: Detecta anemia e infecções
- **Glicemia**: Verifica diabetes gestacional
- **Tipagem sanguínea**: Importante para o parto
- **Sorologias**: HIV, sífilis, hepatite B, toxoplasmose, rubéola

## Ultrassom:
- Confirma idade gestacional
- Verifica batimentos cardíacos
- Detecta possíveis malformações
- Avalia placenta e líquido amniótico

## Translucência Nucal:
- Realizado entre 11-14 semanas
- Rastreamento de cromossomopatias
- Pode ser combinado com exame de sangue

## Preparação:
- Jejum pode ser necessário para alguns exames
- Leve todos os exames anteriores
- Prepare suas dúvidas para o médico

Todos os exames são importantes para garantir uma gravidez saudável.
    `,
    source: "Maternidade Pro Matre",
    category: "health",
    importance: "high",
    readingTime: 5,
    tags: ["exames", "ultrassom", "pré-natal"]
  },

  // Semana 16
  {
    week: 16,
    title: "Exercícios Seguros na Gravidez",
    summary: "Atividades físicas recomendadas para manter-se ativa e saudável durante a gestação.",
    content: `
# Exercícios Seguros na Gravidez

No segundo trimestre, manter-se ativa traz benefícios para você e seu bebê.

## Benefícios dos Exercícios:
- Melhora o humor e reduz ansiedade
- Fortalece músculos para o parto
- Controla o ganho de peso
- Melhora a qualidade do sono
- Reduz dores nas costas

## Exercícios Recomendados:
- **Caminhada**: 30 minutos diários
- **Natação**: Exercício completo e seguro
- **Yoga pré-natal**: Flexibilidade e relaxamento
- **Pilates**: Fortalecimento do core
- **Exercícios de Kegel**: Fortalecimento do assoalho pélvico

## Cuidados Importantes:
- Mantenha-se hidratada
- Evite exercícios em posição supina após 16 semanas
- Pare se sentir tonturas, falta de ar ou dor
- Use roupas confortáveis e tênis adequado

## Exercícios a Evitar:
- Esportes de contato
- Exercícios com risco de queda
- Mergulho
- Exercícios em altitude elevada

Sempre consulte seu médico antes de iniciar qualquer atividade física.
    `,
    source: "Hospital e Maternidade Santa Joana",
    category: "exercise",
    importance: "medium",
    readingTime: 4,
    tags: ["exercícios", "atividade física", "bem-estar"]
  },

  // Semana 20
  {
    week: 20,
    title: "Ultrassom Morfológico: O que Esperar",
    summary: "Tudo sobre o ultrassom morfológico realizado na metade da gravidez.",
    content: `
# Ultrassom Morfológico: O que Esperar

O ultrassom morfológico é um dos exames mais aguardados da gravidez!

## O que é Avaliado:
- **Anatomia fetal**: Todos os órgãos são examinados
- **Crescimento**: Peso e tamanho estimados
- **Sexo do bebê**: Determinação com maior precisão
- **Placenta**: Posição e funcionamento
- **Líquido amniótico**: Quantidade adequada

## Principais Estruturas Examinadas:
- Sistema nervoso central
- Coração e grandes vasos
- Face e lábios
- Coluna vertebral
- Membros superiores e inferiores
- Órgãos internos

## Como se Preparar:
- Beba água antes do exame
- Vista roupas confortáveis
- Leve acompanhante
- Reserve tempo suficiente (30-45 minutos)

## Momento Especial:
- Muitos pais descobrem o sexo do bebê
- Primeira oportunidade de ver detalhes do rosto
- Imagens mais nítidas devido ao tamanho do bebê

## Após o Exame:
- Discuta os resultados com seu médico
- Guarde as imagens como lembrança
- Continue o pré-natal regularmente

É um momento mágico para conhecer melhor seu bebê!
    `,
    source: "Clínica de Diagnóstico por Imagem (CDPI)",
    category: "health",
    importance: "high",
    readingTime: 4,
    tags: ["ultrassom", "morfológico", "anatomia fetal"]
  },

  // Semana 24
  {
    week: 24,
    title: "Diabetes Gestacional: Prevenção e Controle",
    summary: "Informações importantes sobre diabetes gestacional e como prevenir complicações.",
    content: `
# Diabetes Gestacional: Prevenção e Controle

A diabetes gestacional afeta cerca de 7% das gestantes e requer atenção especial.

## O que é:
Elevação da glicose no sangue que se desenvolve durante a gravidez, geralmente após a 20ª semana.

## Fatores de Risco:
- Idade superior a 25 anos
- Sobrepeso ou obesidade
- Histórico familiar de diabetes
- Diabetes gestacional em gravidez anterior
- Bebês anteriores com mais de 4kg

## Sintomas:
- Sede excessiva
- Fome constante
- Micção frequente
- Fadiga
- Visão embaçada

## Diagnóstico:
- **Teste de tolerância à glicose**: Entre 24-28 semanas
- **Glicemia de jejum**: Pode ser solicitada em qualquer período

## Tratamento:
- **Dieta balanceada**: Rica em fibras, pobre em açúcares simples
- **Exercícios**: Caminhadas após as refeições
- **Monitoramento**: Controle da glicemia
- **Medicação**: Se necessário, conforme orientação médica

## Prevenção:
- Mantenha peso adequado
- Pratique exercícios regularmente
- Alimente-se de forma equilibrada
- Faça acompanhamento médico regular

O controle adequado protege você e seu bebê de complicações.
    `,
    source: "Hospital das Clínicas da USP",
    category: "health",
    importance: "high",
    readingTime: 5,
    tags: ["diabetes", "glicemia", "complicações"]
  },

  // Semana 28
  {
    week: 28,
    title: "Preparação para a Amamentação",
    summary: "Como se preparar desde o terceiro trimestre para uma amamentação bem-sucedida.",
    content: `
# Preparação para a Amamentação

O terceiro trimestre é o momento ideal para se preparar para amamentar.

## Benefícios da Amamentação:
- **Para o bebê**: Nutrição completa, proteção contra infecções
- **Para a mãe**: Recuperação mais rápida, prevenção de doenças

## Preparação dos Seios:
- **Massagem**: Movimentos circulares suaves
- **Hidratação**: Use cremes específicos para mamilos
- **Sutiãs adequados**: Sem bojo, com sustentação
- **Exposição ao sol**: 15 minutos diários nos mamilos

## Conhecimento Importante:
- **Pega correta**: Bebê deve abocanhar toda a aréola
- **Posições**: Várias posições para amamentar
- **Frequência**: Demanda livre, não por horário rígido
- **Sinais de fome**: Choro é sinal tardio

## Preparação Emocional:
- Converse com mães experientes
- Participe de grupos de apoio
- Leia sobre amamentação
- Tenha paciência - é um aprendizado

## Suporte Necessário:
- Apoio da família
- Orientação profissional
- Ambiente tranquilo
- Tempo para se adaptar

## Primeiro Momento:
- Amamentação na primeira hora após o parto
- Colostro é o primeiro alimento do bebê
- Contato pele a pele fortalece o vínculo

A amamentação é natural, mas requer preparo e apoio.
    `,
    source: "Instituto da Criança do Hospital das Clínicas",
    category: "preparation",
    importance: "high",
    readingTime: 6,
    tags: ["amamentação", "preparação", "terceiro trimestre"]
  },

  // Semana 32
  {
    week: 32,
    title: "Sinais de Trabalho de Parto Prematuro",
    summary: "Reconheça os sinais de alerta do trabalho de parto prematuro e saiba quando procurar ajuda.",
    content: `
# Sinais de Trabalho de Parto Prematuro

É importante conhecer os sinais de trabalho de parto antes das 37 semanas.

## Sinais de Alerta:
- **Contrações regulares**: Mais de 4 em uma hora
- **Dor lombar**: Constante e intensa
- **Pressão pélvica**: Sensação de peso
- **Mudança no corrimento**: Aumento ou presença de sangue
- **Ruptura da bolsa**: Vazamento de líquido amniótico

## Quando Procurar Ajuda Imediatamente:
- Contrações a cada 10 minutos ou menos
- Sangramento vaginal
- Perda de líquido amniótico
- Diminuição dos movimentos fetais
- Febre ou calafrios

## Fatores de Risco:
- Gravidez múltipla (gêmeos, trigêmeos)
- Infecções urinárias não tratadas
- Histórico de parto prematuro
- Problemas na placenta ou útero
- Estresse extremo

## Prevenção:
- **Hidratação adequada**: Beba bastante água
- **Repouso**: Evite atividades extenuantes
- **Controle de infecções**: Trate infecções rapidamente
- **Acompanhamento médico**: Consultas regulares

## O que Fazer:
1. **Pare suas atividades** e descanse
2. **Beba água** - desidratação pode causar contrações
3. **Conte as contrações** por uma hora
4. **Entre em contato** com seu médico
5. **Vá ao hospital** se os sintomas persistirem

## Lembretes Importantes:
- Nem toda contração significa trabalho de parto
- Contrações de Braxton Hicks são normais
- Na dúvida, sempre procure orientação médica

O reconhecimento precoce pode fazer toda a diferença.
    `,
    source: "Maternidade Escola da UFRJ",
    category: "health",
    importance: "high",
    readingTime: 4,
    tags: ["parto prematuro", "contrações", "sinais de alerta"]
  },

  // Semana 36
  {
    week: 36,
    title: "Preparando a Mala da Maternidade",
    summary: "Lista completa do que levar para a maternidade no momento do parto.",
    content: `
# Preparando a Mala da Maternidade

A partir da 36ª semana, mantenha sua mala pronta para o grande dia!

## Para a Mamãe:

### Documentos:
- Cartão de pré-natal
- Carteira de identidade
- CPF e carteira do convênio
- Exames recentes

### Roupas:
- 3-4 camisolas que abrem na frente
- 2-3 sutiãs de amamentação
- Calcinhas descartáveis
- Roupão ou robe
- Chinelos antiderrapantes
- Roupa para a alta

### Higiene:
- Shampoo, condicionador e sabonete
- Escova e pasta de dente
- Desodorante
- Absorventes pós-parto
- Pomada para mamilos

## Para o Bebê:

### Roupas:
- 4-6 bodies de manga longa (RN e P)
- 4-6 macacões com pé (RN e P)
- 2-3 casacos de lã
- 6-8 pares de meias
- 2-3 toucas
- 2-3 luvas

### Higiene:
- Fraldas descartáveis RN
- Lenços umedecidos
- Pomada para assadura
- Sabonete neutro
- Shampoo infantil

## Para o Acompanhante:
- Documentos pessoais
- Roupas para 2-3 dias
- Artigos de higiene
- Travesseiro e cobertor
- Chinelos

## Itens Extras:
- Câmera ou celular carregado
- Carregadores
- Almofada de amamentação
- Lista de telefones importantes
- Dinheiro para emergências

## Dicas Importantes:
- Prepare duas malas: uma menor para o trabalho de parto
- Deixe tudo organizado e de fácil acesso
- Informe onde está para familiares
- Verifique o que a maternidade fornece

Ter tudo preparado traz tranquilidade para esse momento especial!
    `,
    source: "Hospital e Maternidade Pro Matre",
    category: "preparation",
    importance: "high",
    readingTime: 5,
    tags: ["mala maternidade", "preparação", "parto"]
  },

  // Semana 40
  {
    week: 40,
    title: "Chegou a Hora: Reconhecendo o Trabalho de Parto",
    summary: "Como identificar quando chegou o momento de ir para a maternidade.",
    content: `
# Chegou a Hora: Reconhecendo o Trabalho de Parto

Na 40ª semana, é fundamental saber identificar os sinais do trabalho de parto real.

## Sinais do Trabalho de Parto Verdadeiro:

### Contrações Regulares:
- **Frequência**: A cada 3-5 minutos
- **Duração**: 45-60 segundos
- **Intensidade**: Aumenta progressivamente
- **Persistência**: Não param com repouso

### Outros Sinais:
- **Tampão mucoso**: Perda de muco com sangue
- **Ruptura da bolsa**: Vazamento contínuo de líquido
- **Dor lombar**: Intensa e constante
- **Pressão retal**: Vontade de evacuar

## Diferenciando Trabalho de Parto Real:

### Trabalho de Parto Real:
- Contrações regulares e intensas
- Dor não alivia com mudança de posição
- Colo do útero dilata
- Apresentação fetal desce

### Falso Trabalho de Parto:
- Contrações irregulares
- Dor alivia com repouso
- Sem dilatação cervical
- Sem descida fetal

## Quando Ir para a Maternidade:

### Primeira Gestação:
- Contrações a cada 5 minutos por 1 hora
- Ruptura da bolsa amniótica
- Sangramento vermelho vivo
- Diminuição dos movimentos fetais

### Gestações Anteriores:
- Contrações a cada 7-10 minutos
- Qualquer sangramento
- Ruptura da bolsa
- Sensação de que "é a hora"

## Fases do Trabalho de Parto:

### Fase Latente (0-3cm):
- Contrações espaçadas
- Pode durar horas ou dias
- Possível ficar em casa

### Fase Ativa (4-7cm):
- Contrações mais intensas e frequentes
- Momento de ir para maternidade
- Dilatação mais rápida

### Transição (8-10cm):
- Contrações muito intensas
- Dilatação completa
- Preparação para nascimento

## O que Levar:
- Mala já preparada
- Documentos importantes
- Plano de parto (se houver)
- Acompanhante escolhido

## Lembre-se:
- Cada trabalho de parto é único
- Confie em seus instintos
- Mantenha-se calma
- Sua equipe médica está preparada

Este é o momento que você esperou por 9 meses - você está pronta!
    `,
    source: "Maternidade Perinatal",
    category: "preparation",
    importance: "high",
    readingTime: 6,
    tags: ["trabalho de parto", "contrações", "nascimento"]
  }
];

export async function seedMedicalArticles(): Promise<boolean> {
  try {
    console.log("🌱 Iniciando população de artigos médicos...");

    for (const article of medicalArticlesData) {
      try {
        await storage.createMedicalArticle(article);
        console.log(`✅ Artigo criado: ${article.title} (Semana ${article.week})`);
      } catch (error) {
        console.log(`⚠️  Artigo já existe: ${article.title} (Semana ${article.week})`);
      }
    }

    console.log("🎉 População de artigos médicos concluída com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao popular artigos médicos:", error);
    return false;
  }
}