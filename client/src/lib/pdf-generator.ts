import jsPDF from 'jspdf';

export interface BirthPlanData {
  motherName: string;
  partnerName?: string;
  dueDate: string;
  location: string;
  painRelief: {
    natural: boolean;
    epidural: boolean;
    other?: string;
  };
  companions: string;
  specialRequests: string;
  preferences: Record<string, any>;
}

export function generateBirthPlanPDF(data: BirthPlanData): void {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(232, 30, 99); // baby-pink-dark
  pdf.text('Plano de Parto', 20, 30);
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${data.motherName}`, 20, 45);
  
  if (data.dueDate) {
    pdf.setFontSize(12);
    pdf.text(`Data prevista: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`, 20, 55);
  }
  
  let yPosition = 75;
  
  // Section: Local do Parto
  pdf.setFontSize(16);
  pdf.setTextColor(50, 50, 50);
  pdf.text('Local do Parto', 20, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`${data.location || 'Não especificado'}`, 25, yPosition);
  yPosition += 20;
  
  // Section: Métodos de Alívio da Dor
  pdf.setFontSize(16);
  pdf.setTextColor(50, 50, 50);
  pdf.text('Métodos de Alívio da Dor', 20, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  
  if (data.painRelief.natural) {
    pdf.text('✓ Métodos naturais', 25, yPosition);
    yPosition += 10;
  }
  
  if (data.painRelief.epidural) {
    pdf.text('✓ Anestesia epidural', 25, yPosition);
    yPosition += 10;
  }
  
  if (data.painRelief.other) {
    pdf.text(`✓ ${data.painRelief.other}`, 25, yPosition);
    yPosition += 10;
  }
  
  yPosition += 10;
  
  // Section: Acompanhantes
  if (data.companions) {
    pdf.setFontSize(16);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Acompanhantes', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    const companions = pdf.splitTextToSize(data.companions, 170);
    pdf.text(companions, 25, yPosition);
    yPosition += companions.length * 7 + 10;
  }
  
  // Section: Preferências Especiais
  if (data.specialRequests) {
    pdf.setFontSize(16);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Preferências Especiais', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    const requests = pdf.splitTextToSize(data.specialRequests, 170);
    pdf.text(requests, 25, yPosition);
    yPosition += requests.length * 7;
  }
  
  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - MamãeCare`, 20, 280);
  
  // Download the PDF
  pdf.save(`plano-de-parto-${data.motherName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
