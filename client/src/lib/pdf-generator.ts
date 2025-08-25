import jsPDF from 'jspdf';

export interface BirthPlanData {
  motherName: string;
  partnerName?: string;
  dueDate: string;
  
  // Informações básicas
  location: string;
  birthType: string;
  hospital: string;
  doctor: string;
  doula: string;
  
  // Alívio da dor
  painRelief: {
    natural: boolean;
    epidural: boolean;
    nitrous: boolean;
    massage: boolean;
    hydrotherapy: boolean;
    other: string;
  };
  
  // Ambiente
  environment: {
    lighting: string;
    music: boolean;
    aromatherapy: boolean;
    personalItems: string;
    photography: boolean;
    videography: boolean;
  };
  
  // Acompanhantes
  companions: string;
  supportTeam: {
    partner: boolean;
    mother: boolean;
    doula: boolean;
    other: string;
  };
  
  // Nascimento
  birthPreferences: {
    position: string;
    skinToSkin: boolean;
    cordClamping: string;
    placentaDelivery: string;
  };
  
  // Pós-parto
  postBirth: {
    breastfeeding: boolean;
    rooming: boolean;
    eyeOintment: boolean;
    vitaminK: boolean;
  };
  
  specialRequests: string;
  emergencyPreferences: string;
  preferences: Record<string, any>;
}

export function generateBirthPlanPDF(data: BirthPlanData): void {
  const pdf = new jsPDF();
  let yPosition = 30;
  
  // Helper function to add section
  const addSection = (title: string, content: string[], startNewPage = false) => {
    if (startNewPage || yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Section title
    pdf.setFontSize(18);
    pdf.setTextColor(232, 30, 99); // pink
    pdf.text(title, 20, yPosition);
    yPosition += 15;
    
    // Section content
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    
    content.forEach(item => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      const lines = pdf.splitTextToSize(item, 170);
      pdf.text(lines, 25, yPosition);
      yPosition += lines.length * 6 + 3;
    });
    
    yPosition += 8;
  };

  // Header with decorative elements
  pdf.setFillColor(252, 231, 243); // Light pink background
  pdf.rect(0, 0, 210, 70, 'F');
  
  // Title
  pdf.setFontSize(28);
  pdf.setTextColor(219, 39, 119); // Dark pink
  pdf.text('💖 Plano de Parto 💖', 20, 30);
  
  // Mother's name
  pdf.setFontSize(18);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${data.motherName}`, 20, 45);
  
  // Due date
  if (data.dueDate) {
    pdf.setFontSize(14);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Data prevista: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`, 20, 60);
  }
  
  yPosition = 85;

  // 1. Informações Básicas
  const basicInfo = [];
  if (data.birthType) basicInfo.push(`🏥 Tipo de parto: ${data.birthType}`);
  if (data.hospital) basicInfo.push(`🏨 Local: ${data.hospital}`);
  if (data.doctor) basicInfo.push(`👨‍⚕️ Médico: ${data.doctor}`);
  if (data.doula) basicInfo.push(`🤱 Doula: ${data.doula}`);
  
  if (basicInfo.length > 0) {
    addSection('🏥 Informações Básicas', basicInfo);
  }

  // 2. Métodos de Alívio da Dor
  const painReliefMethods = [];
  if (data.painRelief.natural) painReliefMethods.push('🌿 Métodos naturais');
  if (data.painRelief.epidural) painReliefMethods.push('💉 Anestesia epidural');
  if (data.painRelief.nitrous) painReliefMethods.push('🫧 Óxido nitroso (gás)');
  if (data.painRelief.massage) painReliefMethods.push('👐 Massagem');
  if (data.painRelief.hydrotherapy) painReliefMethods.push('🛁 Hidroterapia/banho');
  if (data.painRelief.other) painReliefMethods.push(`✨ ${data.painRelief.other}`);
  
  if (painReliefMethods.length > 0) {
    addSection('💊 Alívio da Dor', painReliefMethods);
  }

  // 3. Ambiente Desejado
  const environmentPrefs = [];
  if (data.environment.lighting) {
    const lightingMap: Record<string, string> = {
      'dim': '🌙 Luz baixa/ambiente',
      'natural': '☀️ Luz natural',
      'bright': '💡 Luz normal'
    };
    environmentPrefs.push(`Iluminação: ${lightingMap[data.environment.lighting] || data.environment.lighting}`);
  }
  if (data.environment.music) environmentPrefs.push('🎵 Música relaxante');
  if (data.environment.aromatherapy) environmentPrefs.push('🌸 Aromaterapia');
  if (data.environment.photography) environmentPrefs.push('📸 Fotografias permitidas');
  if (data.environment.videography) environmentPrefs.push('🎬 Filmagem permitida');
  if (data.environment.personalItems) {
    environmentPrefs.push(`🎒 Itens pessoais: ${data.environment.personalItems}`);
  }
  
  if (environmentPrefs.length > 0) {
    addSection('🏡 Ambiente', environmentPrefs);
  }

  // 4. Equipe de Apoio
  const supportTeam = [];
  if (data.supportTeam.partner) supportTeam.push('💕 Parceiro(a)');
  if (data.supportTeam.mother) supportTeam.push('👩 Minha mãe');
  if (data.supportTeam.doula) supportTeam.push('🤱 Doula');
  if (data.supportTeam.other) supportTeam.push(`👥 Outros: ${data.supportTeam.other}`);
  if (data.companions) supportTeam.push(`📝 Detalhes: ${data.companions}`);
  
  if (supportTeam.length > 0) {
    addSection('👥 Acompanhantes', supportTeam);
  }

  // 5. Preferências do Nascimento
  const birthPrefs = [];
  if (data.birthPreferences.position) {
    const positionMap: Record<string, string> = {
      'squatting': '🏃‍♀️ Cócoras',
      'side-lying': '🛌 Deitada de lado',
      'standing': '🚶‍♀️ Em pé',
      'back': '🛏️ Deitada de costas'
    };
    birthPrefs.push(`Posição: ${positionMap[data.birthPreferences.position] || data.birthPreferences.position}`);
  }
  if (data.birthPreferences.skinToSkin) birthPrefs.push('🤱 Contato pele a pele imediato');
  if (data.birthPreferences.cordClamping) {
    const clampingMap: Record<string, string> = {
      'delayed': '⏰ Clampeamento tardio',
      'immediate': '⚡ Clampeamento imediato'
    };
    birthPrefs.push(`Cordão umbilical: ${clampingMap[data.birthPreferences.cordClamping] || data.birthPreferences.cordClamping}`);
  }
  if (data.birthPreferences.placentaDelivery) {
    const placentaMap: Record<string, string> = {
      'natural': '🌿 Dequitação natural',
      'managed': '💉 Dequitação dirigida'
    };
    birthPrefs.push(`Placenta: ${placentaMap[data.birthPreferences.placentaDelivery] || data.birthPreferences.placentaDelivery}`);
  }
  
  if (birthPrefs.length > 0) {
    addSection('👶 Nascimento', birthPrefs);
  }

  // 6. Pós-parto
  const postBirthPrefs = [];
  if (data.postBirth.breastfeeding) postBirthPrefs.push('🤱 Amamentação imediata');
  if (data.postBirth.rooming) postBirthPrefs.push('🏨 Alojamento conjunto');
  if (data.postBirth.eyeOintment) postBirthPrefs.push('👁️ Pomada nos olhos do bebê');
  if (data.postBirth.vitaminK) postBirthPrefs.push('💉 Vitamina K para o bebê');
  
  if (postBirthPrefs.length > 0) {
    addSection('🛡️ Pós-parto', postBirthPrefs);
  }

  // 7. Pedidos Especiais
  if (data.specialRequests) {
    addSection('✨ Pedidos Especiais', [data.specialRequests]);
  }

  // 8. Emergências
  if (data.emergencyPreferences) {
    addSection('🚨 Em Caso de Emergência', [data.emergencyPreferences]);
  }

  // Add decorative footer
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 30;
  }
  
  // Footer decoration
  pdf.setFillColor(252, 231, 243);
  pdf.rect(0, 270, 210, 27, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`💕 Gerado com amor em ${new Date().toLocaleDateString('pt-BR')} - MamãeCare 💕`, 20, 285);
  
  // Add heart decoration
  pdf.setFontSize(8);
  pdf.text('💖 Este é o seu momento especial 💖', 65, 292);
  
  // Download the PDF
  const fileName = `plano-de-parto-${data.motherName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
}
