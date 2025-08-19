export function calculatePregnancyWeek(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  
  // Calculate weeks from conception (40 weeks total)
  const totalWeeks = 40;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksUntilDue = Math.round((due.getTime() - now.getTime()) / msPerWeek);
  const currentWeek = totalWeeks - weeksUntilDue;
  
  // Ensure week is between 1 and 40
  const week = Math.max(1, Math.min(40, currentWeek));
  
  return {
    week,
    weeksRemaining: Math.max(0, weeksUntilDue),
    daysRemaining: Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))),
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
