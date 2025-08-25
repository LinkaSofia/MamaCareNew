export interface BabyDevelopmentData {
  week: number;
  size: string;
  weight: string;
  length_cm?: number;
  weight_grams?: number;
  comparison: string;
  fruit_comparison: string;
  description: string;
  developments: string[];
  development_milestones_baby: string;
  development_milestones_mom: string;
  organs_developing: string[];
}

export const babyDevelopmentData: BabyDevelopmentData[] = [
  {
    week: 1,
    size: "0.1mm",
    weight: "< 1g",
    length_cm: 0,
    weight_grams: 0,
    comparison: "ponto microscópico",
    fruit_comparison: "🔸 Ponto microscópico",
    description: "A fertilização acaba de acontecer",
    developments: ["Óvulo fertilizado", "Início da divisão celular"],
    development_milestones_baby: "Você ainda é apenas um óvulo fertilizado, iniciando uma jornada incrível. As células estão começando a se dividir rapidamente.",
    development_milestones_mom: "Você pode não saber ainda que está grávida. Seu corpo já começou a produzir hormônios da gravidez.",
    organs_developing: ["Células básicas"]
  },
  {
    week: 4,
    size: "2mm",
    weight: "< 1g",
    length_cm: 0.2,
    weight_grams: 0,
    comparison: "semente de papoula",
    fruit_comparison: "🟤 Semente de papoula",
    description: "Seu bebê é do tamanho de uma semente de papoula",
    developments: ["Início da formação do tubo neural", "Desenvolvimento das células básicas"],
    development_milestones_baby: "O tubo neural, que se tornará a medula espinhal e o cérebro, está se formando. O coração primitivo começa a se desenvolver.",
    development_milestones_mom: "Você pode começar a sentir os primeiros sintomas da gravidez, como fadiga e mudanças no olfato.",
    organs_developing: ["Tubo neural", "Coração primitivo", "Sistema nervoso básico"]
  },
  {
    week: 8,
    size: "1.6cm",
    weight: "1g",
    length_cm: 1.6,
    weight_grams: 1,
    comparison: "framboesa",
    fruit_comparison: "🫐 Framboesa",
    description: "Seu bebê é do tamanho de uma framboesa",
    developments: ["Formação dos braços e pernas", "Início do desenvolvimento facial", "Primeiro batimento cardíaco"],
    development_milestones_baby: "Braços e pernas estão se formando, e o coração já está batendo! As características faciais básicas começam a aparecer.",
    development_milestones_mom: "Náuseas matinais podem estar no auge. Você pode notar que os seios estão mais sensíveis.",
    organs_developing: ["Coração", "Membros", "Face", "Sistema digestivo básico"]
  },
  {
    week: 12,
    size: "5.4cm",
    weight: "14g",
    length_cm: 5.4,
    weight_grams: 14,
    comparison: "limão",
    fruit_comparison: "🍋 Limão",
    description: "Seu bebê é do tamanho de um limão",
    developments: ["Reflexos começam a se desenvolver", "Rins funcionando", "Ossos começam a endurecer"],
    development_milestones_baby: "Todos os órgãos principais estão formados! O bebê pode fazer punho, abrir e fechar os dedos, e até mesmo sugar o polegar.",
    development_milestones_mom: "O primeiro trimestre está terminando e você pode sentir mais energia. As náuseas podem diminuir.",
    organs_developing: ["Rins", "Sistema ósseo", "Músculos", "Reflexos neurológicos"]
  },
  {
    week: 16,
    size: "11.6cm",
    weight: "100g",
    length_cm: 11.6,
    weight_grams: 100,
    comparison: "abacate",
    fruit_comparison: "🥑 Abacate",
    description: "Seu bebê é do tamanho de um abacate",
    developments: ["Pode ouvir sua voz", "Movimentos mais coordenados", "Desenvolvimento das impressões digitais"],
    development_milestones_baby: "Os músculos faciais estão se desenvolvendo e o bebê pode fazer expressões! O sistema nervoso está funcionando melhor.",
    development_milestones_mom: "Você pode começar a sentir os primeiros movimentos sutis do bebê. Sua barriga pode começar a aparecer.",
    organs_developing: ["Sistema auditivo", "Músculos faciais", "Impressões digitais", "Sistema muscular"]
  },
  {
    week: 20,
    size: "16.4cm",
    weight: "300g",
    length_cm: 16.4,
    weight_grams: 300,
    comparison: "banana",
    fruit_comparison: "🍌 Banana",
    description: "Seu bebê é do tamanho de uma banana",
    developments: ["Você pode sentir os movimentos", "Cabelo e unhas crescendo", "Sistema nervoso se desenvolvendo"],
    development_milestones_baby: "É a metade da gravidez! O bebê está muito ativo e você pode sentir chutes e socos. O cabelo e as unhas estão crescendo.",
    development_milestones_mom: "Os movimentos do bebê estão mais evidentes. Você pode descobrir o sexo do bebê nesta semana!",
    organs_developing: ["Cabelo", "Unhas", "Pele", "Sistema reprodutivo"]
  },
  {
    week: 24,
    size: "21cm",
    weight: "600g",
    length_cm: 21,
    weight_grams: 600,
    comparison: "espiga de milho",
    fruit_comparison: "🌽 Espiga de milho",
    description: "Seu bebê é do tamanho de uma espiga de milho",
    developments: ["Pulmões se desenvolvendo", "Pode sobreviver fora do útero", "Audição melhorando"],
    development_milestones_baby: "Os pulmões estão se desenvolvendo rapidamente. O bebê pode responder a sons e sua voz. A pele está ficando menos transparente.",
    development_milestones_mom: "Você pode sentir o bebê reagir a sons altos. Sua barriga está crescendo notavelmente.",
    organs_developing: ["Pulmões", "Sistema auditivo", "Cérebro", "Sistema imunológico"]
  },
  {
    week: 28,
    size: "25cm",
    weight: "1kg",
    length_cm: 25,
    weight_grams: 1000,
    comparison: "berinjela",
    fruit_comparison: "🍆 Berinjela",
    description: "Seu bebê é do tamanho de uma berinjela",
    developments: ["Terceiro trimestre começou", "Olhos podem abrir", "Cérebro desenvolvendo rapidamente"],
    development_milestones_baby: "O cérebro está crescendo rapidamente e os olhos podem abrir e fechar. O bebê pode sonhar!",
    development_milestones_mom: "O terceiro trimestre começou. Você pode sentir mais desconforto conforme o bebê cresce.",
    organs_developing: ["Cérebro", "Olhos", "Sistema nervoso", "Tecido gorduroso"]
  },
  {
    week: 32,
    size: "28cm",
    weight: "1.5kg",
    length_cm: 28,
    weight_grams: 1500,
    comparison: "coco",
    fruit_comparison: "🥥 Coco",
    description: "Seu bebê é do tamanho de um coco",
    developments: ["Ossos endurecendo", "Unhas crescendo", "Ganhando peso rapidamente"],
    development_milestones_baby: "Os ossos estão ficando mais duros, exceto o crânio que permanece flexível para o parto. O bebê está ganhando peso rapidamente.",
    development_milestones_mom: "Você pode sentir falta de ar à medida que o bebê pressiona seus pulmões. Braxton Hicks podem começar.",
    organs_developing: ["Sistema ósseo", "Pulmões", "Sistema digestivo", "Coordenação motora"]
  },
  {
    week: 36,
    size: "32cm",
    weight: "2.3kg",
    length_cm: 32,
    weight_grams: 2300,
    comparison: "papaia",
    fruit_comparison: "🥭 Papaia",
    description: "Seu bebê é do tamanho de uma papaia",
    developments: ["Pulmões quase maduros", "Sistema imunológico fortalecendo", "Posição para o parto"],
    development_milestones_baby: "Os pulmões estão quase maduros e o bebê está se posicionando de cabeça para baixo para o nascimento.",
    development_milestones_mom: "Você pode sentir mais pressão na pelve conforme o bebê se prepara para nascer. Consultas médicas são mais frequentes.",
    organs_developing: ["Pulmões maduros", "Sistema imunológico", "Reflexos de sucção", "Regulação térmica"]
  },
  {
    week: 40,
    size: "36cm",
    weight: "3.2kg",
    length_cm: 36,
    weight_grams: 3200,
    comparison: "melancia pequena",
    fruit_comparison: "🍉 Melancia pequena",
    description: "Seu bebê é do tamanho de uma melancia pequena",
    developments: ["Totalmente desenvolvido", "Pronto para nascer", "Sistema respiratório maduro"],
    development_milestones_baby: "Seu bebê está totalmente desenvolvido e pronto para conhecer o mundo! Todos os sistemas estão funcionando.",
    development_milestones_mom: "Você chegou ao fim da gravidez! O trabalho de parto pode começar a qualquer momento. Seu corpo está se preparando para o parto.",
    organs_developing: ["Todos os sistemas maduros", "Pronto para vida extrauterina"]
  }
];

// Função auxiliar para buscar dados por semana
export function getBabyDevelopmentData(week: number): BabyDevelopmentData | undefined {
  return babyDevelopmentData.find(data => data.week === week);
}

// Função para interpolar dados entre semanas
export function getInterpolatedBabyData(week: number): BabyDevelopmentData {
  const exactMatch = getBabyDevelopmentData(week);
  if (exactMatch) return exactMatch;

  // Encontra as semanas mais próximas para interpolar
  const sortedData = babyDevelopmentData.sort((a, b) => a.week - b.week);
  
  let previousData = sortedData[0];
  let nextData = sortedData[sortedData.length - 1];

  for (let i = 0; i < sortedData.length - 1; i++) {
    if (sortedData[i].week <= week && sortedData[i + 1].week > week) {
      previousData = sortedData[i];
      nextData = sortedData[i + 1];
      break;
    }
  }

  // Se a semana for menor que a primeira ou maior que a última, retorna a mais próxima
  if (week <= previousData.week) return previousData;
  if (week >= nextData.week) return nextData;

  // Interpola valores numéricos
  const ratio = (week - previousData.week) / (nextData.week - previousData.week);
  
  const interpolatedLength = previousData.length_cm && nextData.length_cm 
    ? Math.round(previousData.length_cm + (nextData.length_cm - previousData.length_cm) * ratio)
    : previousData.length_cm || nextData.length_cm || 0;
    
  const interpolatedWeight = previousData.weight_grams && nextData.weight_grams 
    ? Math.round(previousData.weight_grams + (nextData.weight_grams - previousData.weight_grams) * ratio)
    : previousData.weight_grams || nextData.weight_grams || 0;

  return {
    week,
    size: interpolatedLength ? `${interpolatedLength}cm` : previousData.size,
    weight: interpolatedWeight ? `${interpolatedWeight}g` : previousData.weight,
    length_cm: interpolatedLength,
    weight_grams: interpolatedWeight,
    comparison: previousData.comparison,
    fruit_comparison: previousData.fruit_comparison,
    description: previousData.description,
    developments: previousData.developments,
    development_milestones_baby: previousData.development_milestones_baby,
    development_milestones_mom: previousData.development_milestones_mom,
    organs_developing: previousData.organs_developing,
  };
}

// Função para obter a fase da gravidez
export function getPregnancyPhase(week: number): { phase: string; color: string; description: string } {
  if (week <= 12) {
    return {
      phase: "Primeiro Trimestre",
      color: "text-pink-600",
      description: "Formação dos órgãos principais"
    };
  } else if (week <= 27) {
    return {
      phase: "Segundo Trimestre",
      color: "text-blue-600", 
      description: "Crescimento e desenvolvimento"
    };
  } else {
    return {
      phase: "Terceiro Trimestre",
      color: "text-purple-600",
      description: "Preparação para o nascimento"
    };
  }
}