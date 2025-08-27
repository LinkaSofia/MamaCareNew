import jsPDF from 'jspdf';
import logoImage from '@assets/image_1756302873641.png';

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

// Helper function to load image as base64
const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export async function generateBirthPlanPDF(data: BirthPlanData): Promise<void> {
  const pdf = new jsPDF();
  let yPosition = 30;
  
  // Colors for modern design
  const colors = {
    primary: [236, 72, 153] as [number, number, number], // rose-500
    secondary: [252, 231, 243] as [number, number, number], // rose-100
    accent: [190, 24, 93] as [number, number, number], // rose-700
    text: [31, 41, 55] as [number, number, number], // gray-800
    textLight: [107, 114, 128] as [number, number, number], // gray-500
    white: [255, 255, 255] as [number, number, number],
    success: [34, 197, 94] as [number, number, number], // green-500
  };

  // Load and add logo
  try {
    const logoBase64 = await loadImageAsBase64(logoImage);
    pdf.addImage(logoBase64, 'PNG', 15, 15, 25, 25);
  } catch (error) {
    console.warn('Logo não pôde ser carregada:', error);
  }

  // Modern header with gradient-like background
  pdf.setFillColor(...colors.secondary);
  pdf.rect(0, 0, 210, 80, 'F');
  
  // Add decorative elements
  pdf.setFillColor(...colors.primary);
  pdf.circle(190, 20, 8, 'F');
  pdf.setFillColor(252, 165, 165); // rose-300
  pdf.circle(185, 35, 4, 'F');
  pdf.circle(195, 32, 3, 'F');

  // Title with modern typography
  pdf.setFontSize(32);
  pdf.setTextColor(...colors.primary);
  pdf.text('Plano de Parto', 50, 35);
  
  // Subtitle
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.textLight);
  pdf.text('Suas preferências para o momento especial', 50, 45);
  
  // Mother's name with elegant styling
  pdf.setFontSize(20);
  pdf.setTextColor(...colors.text);
  pdf.text(data.motherName, 50, 62);
  
  // Due date with icon
  if (data.dueDate) {
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.textLight);
    pdf.text(`📅 Data prevista: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`, 50, 73);
  }
  
  yPosition = 100;

  // Helper function for modern sections
  const addModernSection = (icon: string, title: string, content: string[], color: [number, number, number] = colors.primary) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Section background
    pdf.setFillColor(248, 250, 252); // gray-50
    pdf.roundedRect(15, yPosition - 5, 180, 8 + content.length * 7, 3, 3, 'F');
    
    // Section icon and title
    pdf.setFontSize(16);
    pdf.setTextColor(...color);
    pdf.text(`${icon} ${title}`, 20, yPosition + 5);
    
    yPosition += 15;
    
    // Section content with better spacing
    pdf.setFontSize(11);
    pdf.setTextColor(...colors.text);
    
    content.forEach(item => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Add bullet point
      pdf.setTextColor(...colors.primary);
      pdf.text('•', 25, yPosition);
      
      // Add content
      pdf.setTextColor(...colors.text);
      const lines = pdf.splitTextToSize(item, 160);
      pdf.text(lines, 30, yPosition);
      yPosition += Math.max(lines.length * 5, 6);
    });
    
    yPosition += 12;
  };

  // 1. Informações Básicas
  const basicInfo = [];
  if (data.birthType) basicInfo.push(`Tipo de parto: ${data.birthType}`);
  if (data.hospital) basicInfo.push(`Local: ${data.hospital}`);
  if (data.doctor) basicInfo.push(`Médico: ${data.doctor}`);
  if (data.doula) basicInfo.push(`Doula: ${data.doula}`);
  
  if (basicInfo.length > 0) {
    addModernSection('🏥', 'Informações Básicas', basicInfo);
  }

  // 2. Métodos de Alívio da Dor
  const painReliefMethods = [];
  if (data.painRelief.natural) painReliefMethods.push('Métodos naturais de alívio');
  if (data.painRelief.epidural) painReliefMethods.push('Anestesia epidural');
  if (data.painRelief.nitrous) painReliefMethods.push('Óxido nitroso (gás do riso)');
  if (data.painRelief.massage) painReliefMethods.push('Massagem terapêutica');
  if (data.painRelief.hydrotherapy) painReliefMethods.push('Hidroterapia/banho relaxante');
  if (data.painRelief.other) painReliefMethods.push(`Outros métodos: ${data.painRelief.other}`);
  
  if (painReliefMethods.length > 0) {
    addModernSection('💊', 'Alívio da Dor', painReliefMethods, colors.accent);
  }

  // 3. Ambiente Desejado
  const environmentPrefs = [];
  if (data.environment.lighting) {
    const lightingMap: Record<string, string> = {
      'dim': 'Iluminação baixa e ambiente',
      'natural': 'Luz natural',
      'bright': 'Iluminação normal'
    };
    environmentPrefs.push(`Iluminação: ${lightingMap[data.environment.lighting] || data.environment.lighting}`);
  }
  if (data.environment.music) environmentPrefs.push('Música relaxante durante o trabalho de parto');
  if (data.environment.aromatherapy) environmentPrefs.push('Aromaterapia para relaxamento');
  if (data.environment.photography) environmentPrefs.push('Permitir fotografias do nascimento');
  if (data.environment.videography) environmentPrefs.push('Permitir filmagem do momento');
  if (data.environment.personalItems) {
    environmentPrefs.push(`Itens pessoais: ${data.environment.personalItems}`);
  }
  
  if (environmentPrefs.length > 0) {
    addModernSection('🏡', 'Ambiente', environmentPrefs, colors.success);
  }

  // 4. Equipe de Apoio
  const supportTeam = [];
  if (data.supportTeam.partner) supportTeam.push('Parceiro(a) presente durante o parto');
  if (data.supportTeam.mother) supportTeam.push('Minha mãe como acompanhante');
  if (data.supportTeam.doula) supportTeam.push('Doula para apoio emocional');
  if (data.supportTeam.other) supportTeam.push(`Outros acompanhantes: ${data.supportTeam.other}`);
  if (data.companions) supportTeam.push(`Detalhes especiais: ${data.companions}`);
  
  if (supportTeam.length > 0) {
    addModernSection('👥', 'Acompanhantes', supportTeam, [168, 85, 247] as [number, number, number]); // purple
  }

  // 5. Preferências do Nascimento
  const birthPrefs = [];
  if (data.birthPreferences.position) {
    const positionMap: Record<string, string> = {
      'squatting': 'Posição de cócoras',
      'side-lying': 'Deitada de lado',
      'standing': 'Em pé ou caminhando',
      'back': 'Deitada de costas'
    };
    birthPrefs.push(`Posição preferida: ${positionMap[data.birthPreferences.position] || data.birthPreferences.position}`);
  }
  if (data.birthPreferences.skinToSkin) birthPrefs.push('Contato pele a pele imediato após o nascimento');
  if (data.birthPreferences.cordClamping) {
    const clampingMap: Record<string, string> = {
      'delayed': 'Clampeamento tardio do cordão umbilical',
      'immediate': 'Clampeamento imediato do cordão'
    };
    birthPrefs.push(clampingMap[data.birthPreferences.cordClamping] || data.birthPreferences.cordClamping);
  }
  if (data.birthPreferences.placentaDelivery) {
    const placentaMap: Record<string, string> = {
      'natural': 'Dequitação natural da placenta',
      'managed': 'Dequitação dirigida da placenta'
    };
    birthPrefs.push(placentaMap[data.birthPreferences.placentaDelivery] || data.birthPreferences.placentaDelivery);
  }
  
  if (birthPrefs.length > 0) {
    addModernSection('👶', 'Nascimento', birthPrefs, [59, 130, 246] as [number, number, number]); // blue
  }

  // 6. Pós-parto
  const postBirthPrefs = [];
  if (data.postBirth.breastfeeding) postBirthPrefs.push('Amamentação imediata após o nascimento');
  if (data.postBirth.rooming) postBirthPrefs.push('Alojamento conjunto (bebê no quarto)');
  if (data.postBirth.eyeOintment) postBirthPrefs.push('Aplicação de pomada nos olhos do bebê');
  if (data.postBirth.vitaminK) postBirthPrefs.push('Administração de vitamina K no bebê');
  
  if (postBirthPrefs.length > 0) {
    addModernSection('🛡️', 'Cuidados Pós-parto', postBirthPrefs, [34, 197, 94] as [number, number, number]); // green
  }

  // 7. Pedidos Especiais
  if (data.specialRequests) {
    addModernSection('✨', 'Pedidos Especiais', [data.specialRequests], [251, 146, 60] as [number, number, number]); // orange
  }

  // 8. Emergências
  if (data.emergencyPreferences) {
    addModernSection('🚨', 'Em Caso de Emergência', [data.emergencyPreferences], [239, 68, 68] as [number, number, number]); // red
  }

  // Modern footer with branding
  if (yPosition > 240) {
    pdf.addPage();
    yPosition = 30;
  }
  
  // Footer background
  pdf.setFillColor(...colors.secondary);
  pdf.rect(0, 260, 210, 37, 'F');
  
  // Add small logo in footer
  try {
    const logoBase64 = await loadImageAsBase64(logoImage);
    pdf.addImage(logoBase64, 'PNG', 20, 267, 15, 15);
  } catch (error) {
    // Logo fallback
    pdf.setFillColor(...colors.primary);
    pdf.circle(27, 274, 7, 'F');
  }
  
  // Footer text
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.text('MamãeCare', 40, 275);
  
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.textLight);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 40, 283);
  
  // Beautiful message
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.primary);
  pdf.text('💕 Este é o seu momento especial - você consegue! 💕', 40, 290);
  
  // Download the PDF
  const fileName = `plano-de-parto-${data.motherName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
}
