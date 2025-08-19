export interface BabyDevelopmentData {
  week: number;
  size: string;
  weight: string;
  comparison: string;
  description: string;
  developments: string[];
}

export const babyDevelopmentData: BabyDevelopmentData[] = [
  {
    week: 4,
    size: "2mm",
    weight: "< 1g",
    comparison: "semente de papoula",
    description: "Seu bebê é do tamanho de uma semente de papoula",
    developments: ["Início da formação do tubo neural", "Desenvolvimento das células básicas"]
  },
  {
    week: 8,
    size: "1,6cm",
    weight: "1g",
    comparison: "framboesa",
    description: "Seu bebê é do tamanho de uma framboesa",
    developments: ["Formação dos braços e pernas", "Início do desenvolvimento facial", "Primeiro batimento cardíaco"]
  },
  {
    week: 12,
    size: "5,4cm",
    weight: "14g",
    comparison: "limão",
    description: "Seu bebê é do tamanho de um limão",
    developments: ["Reflexos começam a se desenvolver", "Rins funcionando", "Ossos começam a endurecer"]
  },
  {
    week: 16,
    size: "11,6cm",
    weight: "100g",
    comparison: "abacate",
    description: "Seu bebê é do tamanho de um abacate",
    developments: ["Pode ouvir sua voz", "Movimentos mais coordenados", "Desenvolvimento das impressões digitais"]
  },
  {
    week: 20,
    size: "16,4cm",
    weight: "300g",
    comparison: "banana",
    description: "Seu bebê é do tamanho de uma banana",
    developments: ["Você pode sentir os movimentos", "Cabelo e unhas crescendo", "Sistema nervoso se desenvolvendo"]
  },
  {
    week: 24,
    size: "21cm",
    weight: "600g",
    comparison: "espiga de milho",
    description: "Seu bebê é do tamanho de uma espiga de milho",
    developments: ["Pulmões se desenvolvendo", "Pode responder a sons", "Pele fica menos transparente"]
  },
  {
    week: 28,
    size: "25cm",
    weight: "1kg",
    comparison: "berinjela",
    description: "Seu bebê é do tamanho de uma berinjela",
    developments: ["Abre e fecha os olhos", "Pode sonhar", "Cérebro se desenvolvendo rapidamente"]
  },
  {
    week: 32,
    size: "28cm",
    weight: "1,7kg",
    comparison: "coco",
    description: "Seu bebê é do tamanho de um coco",
    developments: ["Ossos endurecendo", "Unhas dos pés crescendo", "Sistema imunológico se desenvolvendo"]
  },
  {
    week: 36,
    size: "32cm",
    weight: "2,6kg",
    comparison: "melão cantalupo",
    description: "Seu bebê é do tamanho de um melão cantalupo",
    developments: ["Pulmões quase maduros", "Gordura se acumulando", "Posicionando-se para o nascimento"]
  },
  {
    week: 40,
    size: "36cm",
    weight: "3,4kg",
    comparison: "abóbora",
    description: "Seu bebê é do tamanho de uma abóbora",
    developments: ["Pronto para nascer", "Sistema digestivo maduro", "Reflexos totalmente desenvolvidos"]
  }
];

export function getBabyDataForWeek(week: number): BabyDevelopmentData | null {
  // Find the closest week data (rounds down to nearest available week)
  const availableWeeks = babyDevelopmentData.map(data => data.week);
  const closestWeek = availableWeeks.reduce((prev, curr) => {
    return (Math.abs(curr - week) < Math.abs(prev - week) && curr <= week) ? curr : prev;
  });
  
  return babyDevelopmentData.find(data => data.week === closestWeek) || null;
}
