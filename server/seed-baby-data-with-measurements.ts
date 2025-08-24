// Script para popular dados reais de desenvolvimento do bebê com medidas
import { storage } from './storage';

const babyDevelopmentData = [
  {
    week: 1,
    size: "0.1 mm",
    weight: "< 1g", 
    fruit_comparison: "Como uma semente",
    length_cm: 0.1,
    weight_grams: 0.1,
    development_milestones_baby: "Fertilização acontece. O óvulo fertilizado se implanta no útero.",
    development_milestones_mom: "Você pode não saber que está grávida ainda. Últimos dias da menstruação."
  },
  {
    week: 4, 
    size: "2 mm",
    weight: "< 1g",
    fruit_comparison: "Como uma semente de papoula", 
    length_cm: 0.2,
    weight_grams: 0.1,
    development_milestones_baby: "O embrião tem cerca de 2mm. Coração primitivo começa a se formar.",
    development_milestones_mom: "Período menstrual em atraso. Hormônios da gravidez começam a circular."
  },
  {
    week: 8,
    size: "1.6 cm", 
    weight: "1g",
    fruit_comparison: "Como um feijão",
    length_cm: 1.6,
    weight_grams: 1,
    development_milestones_baby: "Braços e pernas estão se desenvolvendo. Coração bate cerca de 150 vezes por minuto. Dedos dos pés e das mãos começam a se formar.",
    development_milestones_mom: "Náuseas matinais podem começar. Seios ficam mais sensíveis. Pode sentir mais cansaço que o normal."
  },
  {
    week: 12,
    size: "5.4 cm",
    weight: "14g", 
    fruit_comparison: "Como uma ameixa",
    length_cm: 5.4,
    weight_grams: 14,
    development_milestones_baby: "Órgãos vitais estão funcionando. Pode sugar o polegar. Unhas dos pés e das mãos estão se desenvolvendo.",
    development_milestones_mom: "Náuseas podem diminuir. Útero cresce além da pelve. Pode começar a 'mostrar' a barriga."
  },
  {
    week: 16,
    size: "11.6 cm",
    weight: "100g",
    fruit_comparison: "Como um abacate",
    length_cm: 11.6, 
    weight_grams: 100,
    development_milestones_baby: "Pode ouvir sua voz. Movimentos coordenados dos braços e pernas. Cabelo e sobrancelhas estão crescendo.",
    development_milestones_mom: "Pode sentir os primeiros movimentos do bebê. Energia volta. Pele pode ficar mais brilhante."
  },
  {
    week: 20,
    size: "16.4 cm", 
    weight: "300g",
    fruit_comparison: "Como uma banana",
    length_cm: 16.4,
    weight_grams: 300,
    development_milestones_baby: "Pode ouvir sons externos. Cabelo, sobrancelhas e cílios estão visíveis. Sistema digestivo está funcionando.",
    development_milestones_mom: "Meio da gravidez! Ultrassom morfológico pode revelar o sexo. Movimentos do bebê ficam mais fortes."
  },
  {
    week: 24,
    size: "21 cm",
    weight: "630g", 
    fruit_comparison: "Como uma espiga de milho",
    length_cm: 21,
    weight_grams: 630,
    development_milestones_baby: "Pulmões estão se desenvolvendo. Pode responder à luz e som. Impressões digitais estão se formando.",
    development_milestones_mom: "Barriga está crescendo rapidamente. Pode ter azia ou indigestão. Teste de diabetes gestacional."
  },
  {
    week: 28,
    size: "25 cm",
    weight: "1000g",
    fruit_comparison: "Como uma berinjela",
    length_cm: 25,
    weight_grams: 1000,
    development_milestones_baby: "Pode abrir e fechar os olhos. Cérebro está desenvolvendo rapidamente. Padrões de sono mais regulares.",
    development_milestones_mom: "Terceiro trimestre! Pode sentir contrações de Braxton Hicks. Consultas pré-natais ficam mais frequentes."
  },
  {
    week: 32,
    size: "28 cm",
    weight: "1700g", 
    fruit_comparison: "Como uma jaca",
    length_cm: 28,
    weight_grams: 1700,
    development_milestones_baby: "Ossos estão endurecendo. Pode virar de cabeça para baixo. Unhas estão crescendo.",
    development_milestones_mom: "Falta de ar pode aumentar. Barriga está bem grande. Pode ter dificuldade para dormir."
  },
  {
    week: 36,
    size: "32.2 cm",
    weight: "2600g",
    fruit_comparison: "Como um melão cantalupo",
    length_cm: 32.2,
    weight_grams: 2600, 
    development_milestones_baby: "Considerado quase a termo. Pulmões estão quase maduros. Ganha cerca de 200g por semana.",
    development_milestones_mom: "Consultas semanais começam. Bebê pode 'encaixar'. Bolsa hospitalar deve estar pronta."
  },
  {
    week: 40,
    size: "36.2 cm", 
    weight: "3400g",
    fruit_comparison: "Como uma melancia pequena",
    length_cm: 36.2,
    weight_grams: 3400,
    development_milestones_baby: "Totalmente desenvolvido e pronto para nascer. Intestinos cheios de mecônio. Crânio ainda mole para facilitar o parto.",
    development_milestones_mom: "Data provável do parto! Sinais de trabalho de parto podem começar. Ansiedade e expectativa para conhecer o bebê."
  }
];

export async function seedBabyDataWithMeasurements() {
  console.log('🌱 Populando dados de desenvolvimento com medidas...');

  for (const data of babyDevelopmentData) {
    try {
      console.log(`📝 Inserindo dados da semana ${data.week}...`);
      
      await storage.createBabyDevelopment({
        week: data.week,
        size: data.size,
        weight: data.weight,
        fruit_comparison: data.fruit_comparison,
        development_milestones_baby: data.development_milestones_baby,
        development_milestones_mom: data.development_milestones_mom,
        baby_description: "",
        mom_description: "",
        length_cm: data.length_cm,
        weight_grams: data.weight_grams,
      });
      
      console.log(`✅ Semana ${data.week} inserida com sucesso!`);
    } catch (error) {
      console.log(`⚠️ Semana ${data.week} já existe ou erro:`, error);
    }
  }

  console.log('✅ Processo de inserção concluído!');
}

// Executar se chamado diretamente
if (require.main === module) {
  seedBabyDataWithMeasurements().then(() => {
    console.log('🎉 Dados populados com sucesso!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  });
}