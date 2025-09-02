import { db } from "./storage";
import { medicalArticles } from "@shared/schema";

// Artigos principais que devem aparecer na tela principal
const mainArticlesData = [
  {
    week: 8,
    title: "Alimentação Saudável na Gravidez",
    summary: "Dicas essenciais de nutrição para o desenvolvimento saudável do bebê.",
    content: `# Alimentação Saudável na Gravidez

**Nutrientes Essenciais:**
- Ácido Fólico: 400-800mcg diariamente
- Ferro: Para prevenir anemia
- Cálcio: Para formação dos ossos
- Proteínas: Para crescimento celular

**Alimentos Recomendados:**
- Vegetais verdes escuros
- Frutas cítricas
- Carnes magras e peixes
- Laticínios
- Cereais integrais

**Evite:**
- Peixes com mercúrio
- Carnes cruas
- Álcool
- Cafeína em excesso`,
    source: "Hospital Albert Einstein",
    sourceUrl: "https://www.einstein.br",
    category: "nutrition",
    importance: "high",
    readingTime: 5,
    tags: JSON.stringify(["nutrição", "alimentação", "saúde"])
  },
  {
    week: 12,
    title: "Exercícios Seguros na Gravidez",
    summary: "Atividades físicas recomendadas para cada trimestre da gestação.",
    content: `# Exercícios Seguros na Gravidez

**Benefícios:**
- Melhora o bem-estar
- Reduz dores nas costas
- Prepara para o parto
- Controla o peso

**Exercícios Recomendados:**
- Caminhada (30 min/dia)
- Natação
- Yoga pré-natal
- Pilates adaptado

**Sinais de Alerta:**
- Sangramento
- Tontura
- Dor no peito
- Contrações

Sempre consulte seu médico antes de iniciar qualquer atividade física.`,
    source: "Hospital Sírio-Libanês",
    sourceUrl: "https://www.hospitalsiriolibanes.org.br",
    category: "exercise",
    importance: "high",
    readingTime: 4,
    tags: JSON.stringify(["exercícios", "atividade física", "bem-estar"])
  },
  {
    week: 16,
    title: "Desenvolvimento do Bebê no 2º Trimestre",
    summary: "Marcos importantes do desenvolvimento fetal entre 12-24 semanas.",
    content: `# Desenvolvimento do Bebê no 2º Trimestre

**Semana 16-20:**
- Formação completa dos órgãos
- Movimentos mais perceptíveis
- Desenvolvimento do sistema nervoso
- Início da audição

**Semana 20-24:**
- Pele mais desenvolvida
- Cabelo e unhas crescendo
- Padrões de sono definidos
- Resposta a estímulos externos

**Exames Importantes:**
- Ultrassom morfológico
- Exames de sangue
- Teste de tolerância à glicose

Este é um período de grande crescimento e desenvolvimento!`,
    source: "Hospital das Clínicas",
    sourceUrl: "https://www.hc.fm.usp.br",
    category: "development",
    importance: "high",
    readingTime: 4,
    tags: JSON.stringify(["desenvolvimento", "ultrassom", "segundo trimestre"])
  },
  {
    week: 20,
    title: "Preparação para o Parto",
    summary: "Como se preparar física e emocionalmente para o nascimento do bebê.",
    content: `# Preparação para o Parto

**Preparação Física:**
- Exercícios de respiração
- Fortalecimento do assoalho pélvico
- Massagem perineal
- Posições para o trabalho de parto

**Preparação Emocional:**
- Curso de gestantes
- Plano de parto
- Apoio do parceiro
- Técnicas de relaxamento

**Sinais do Trabalho de Parto:**
- Contrações regulares
- Perda do tampão mucoso
- Ruptura da bolsa
- Pressão pélvica

**Quando ir para o hospital:**
- Contrações a cada 5 minutos
- Sangramento intenso
- Ruptura da bolsa amniótica`,
    source: "Maternidade Santa Joana",
    sourceUrl: "https://www.santajoana.com.br",
    category: "birth",
    importance: "high",
    readingTime: 6,
    tags: JSON.stringify(["parto", "preparação", "trabalho de parto"])
  },
  {
    week: 24,
    title: "Diabetes Gestacional: Prevenção e Cuidados",
    summary: "Informações importantes sobre diabetes na gravidez e como prevenir.",
    content: `# Diabetes Gestacional

**O que é:**
- Aumento da glicose no sangue durante a gravidez
- Afeta 7-25% das gestantes
- Geralmente aparece após 20 semanas

**Fatores de Risco:**
- Sobrepeso
- Histórico familiar
- Idade superior a 35 anos
- Gravidez anterior com diabetes

**Prevenção:**
- Dieta equilibrada
- Exercícios regulares
- Controle do peso
- Acompanhamento médico

**Tratamento:**
- Dieta específica
- Monitoramento da glicose
- Exercícios orientados
- Medicação se necessário

O diagnóstico precoce é fundamental para a saúde da mãe e do bebê.`,
    source: "Hospital Israelita Albert Einstein",
    sourceUrl: "https://www.einstein.br/diabetes-gestacional",
    category: "health",
    importance: "high",
    readingTime: 5,
    tags: JSON.stringify(["diabetes", "glicose", "prevenção"])
  }
];

export async function populateMainArticles(): Promise<boolean> {
  try {
    console.log("📝 Inserindo artigos principais no banco de dados...");
    
    for (const article of mainArticlesData) {
      await db.insert(medicalArticles).values(article).onConflictDoNothing();
    }
    
    console.log("✅ Artigos principais inseridos com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inserir artigos principais:", error);
    return false;
  }
}