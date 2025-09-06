export function calculatePregnancyWeek(dueDate: string, lastMenstrualPeriod?: string) {
  const now = new Date();
  
  // Usar UTC ao meio-dia para evitar problemas de fuso horário
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
  
  let week: number;
  let weeksUntilDue: number;
  
  if (lastMenstrualPeriod) {
    // Calcular usando DUM (Data da Última Menstruação) - método mais preciso
    const lmp = new Date(lastMenstrualPeriod);
    const lmpUTC = new Date(Date.UTC(lmp.getFullYear(), lmp.getMonth(), lmp.getDate(), 12));
    
    const daysSinceLMP = Math.floor((todayUTC.getTime() - lmpUTC.getTime()) / (24 * 60 * 60 * 1000));
    week = Math.floor(daysSinceLMP / 7) + 1;
    
    // Calcular semanas restantes (280 dias = 40 semanas)
    const totalDays = 280;
    const daysRemaining = totalDays - daysSinceLMP;
    weeksUntilDue = Math.max(0, Math.ceil(daysRemaining / 7));
  } else {
    // Calcular usando DPP (Data Prevista do Parto)
    const due = new Date(dueDate);
    const dueUTC = new Date(Date.UTC(due.getFullYear(), due.getMonth(), due.getDate(), 12));
    
    const totalWeeks = 40;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    weeksUntilDue = Math.round((dueUTC.getTime() - todayUTC.getTime()) / msPerWeek);
    week = totalWeeks - weeksUntilDue;
  }
  
  // Garantir que a semana esteja entre 1 e 40
  week = Math.max(1, Math.min(40, week));
  weeksUntilDue = Math.max(0, weeksUntilDue);
  
  return {
    week,
    weeksRemaining: weeksUntilDue,
    daysRemaining: Math.max(0, Math.ceil((new Date(dueDate).getTime() - todayUTC.getTime()) / (24 * 60 * 60 * 1000))),
  };
}

export function calculateProgress(currentWeek: number) {
  const totalWeeks = 40;
  const percentage = Math.round((currentWeek / totalWeeks) * 100);
  
  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3,
  };
}

export function calculateDueDateFromLMP(lmpDate: string) {
  const lmp = new Date(lmpDate);
  const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000)); // Add 280 days
  return dueDate.toISOString();
}
