// ========================================
// SCRIPT PARA VER LOGS EM TEMPO REAL
// ========================================
// Execute este script no console do browser (F12)

console.log('🔍 INICIANDO MONITORAMENTO DE LOGS...');

// 1. INTERCEPTAR LOGS DO CONSOLE
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

const logs = [];

console.log = function(...args) {
  logs.push({ type: 'LOG', timestamp: new Date(), message: args.join(' ') });
  originalLog.apply(console, args);
};

console.error = function(...args) {
  logs.push({ type: 'ERROR', timestamp: new Date(), message: args.join(' ') });
  originalError.apply(console, args);
};

console.warn = function(...args) {
  logs.push({ type: 'WARN', timestamp: new Date(), message: args.join(' ') });
  originalWarn.apply(console, args);
};

// 2. FUNÇÕES ÚTEIS PARA ANÁLISE
window.analytics = {
  // Ver todos os logs capturados
  getAllLogs: () => {
    console.table(logs);
    return logs;
  },

  // Filtrar logs por tipo
  filterLogs: (type) => {
    const filtered = logs.filter(log => log.type === type);
    console.table(filtered);
    return filtered;
  },

  // Ver logs de debug (que começam com 🔍)
  getDebugLogs: () => {
    const debugLogs = logs.filter(log => log.message.includes('🔍'));
    console.table(debugLogs);
    return debugLogs;
  },

  // Ver logs de sucesso (que começam com ✅)
  getSuccessLogs: () => {
    const successLogs = logs.filter(log => log.message.includes('✅'));
    console.table(successLogs);
    return successLogs;
  },

  // Ver logs de erro (que começam com ❌)
  getErrorLogs: () => {
    const errorLogs = logs.filter(log => log.message.includes('❌'));
    console.table(errorLogs);
    return errorLogs;
  },

  // Ver atividade do usuário
  getUserActivity: () => {
    const userLogs = logs.filter(log => 
      log.message.includes('Auth via token') || 
      log.message.includes('Diary Entry') ||
      log.message.includes('Page Visit') ||
      log.message.includes('Upload')
    );
    console.table(userLogs);
    return userLogs;
  },

  // Estatísticas dos logs
  getStats: () => {
    const stats = {
      total: logs.length,
      logs: logs.filter(l => l.type === 'LOG').length,
      errors: logs.filter(l => l.type === 'ERROR').length,
      warnings: logs.filter(l => l.type === 'WARN').length,
      debug: logs.filter(l => l.message.includes('🔍')).length,
      success: logs.filter(l => l.message.includes('✅')).length,
      errors_found: logs.filter(l => l.message.includes('❌')).length
    };
    
    console.log('📊 ESTATÍSTICAS DOS LOGS:');
    console.table(stats);
    return stats;
  },

  // Limpar logs
  clearLogs: () => {
    logs.length = 0;
    console.log('🧹 Logs limpos!');
  },

  // Exportar logs como JSON
  exportLogs: () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('📁 Logs exportados!');
  }
};

// 3. MONITORAMENTO AUTOMÁTICO DE ATIVIDADES
let userActivities = [];

// Interceptar cliques
document.addEventListener('click', (e) => {
  userActivities.push({
    type: 'CLICK',
    timestamp: new Date(),
    target: e.target.tagName,
    text: e.target.textContent?.substring(0, 50),
    href: e.target.href || null
  });
});

// Interceptar mudanças de página (se usando SPA)
let currentPage = location.pathname;
setInterval(() => {
  if (location.pathname !== currentPage) {
    userActivities.push({
      type: 'NAVIGATION',
      timestamp: new Date(),
      from: currentPage,
      to: location.pathname
    });
    currentPage = location.pathname;
  }
}, 1000);

// Interceptar formulários
document.addEventListener('submit', (e) => {
  userActivities.push({
    type: 'FORM_SUBMIT',
    timestamp: new Date(),
    form: e.target.tagName,
    action: e.target.action || null
  });
});

// 4. FUNÇÕES PARA ANÁLISE DE ATIVIDADE
window.activityTracker = {
  // Ver todas as atividades
  getActivities: () => {
    console.table(userActivities);
    return userActivities;
  },

  // Ver cliques
  getClicks: () => {
    const clicks = userActivities.filter(a => a.type === 'CLICK');
    console.table(clicks);
    return clicks;
  },

  // Ver navegação
  getNavigation: () => {
    const navigation = userActivities.filter(a => a.type === 'NAVIGATION');
    console.table(navigation);
    return navigation;
  },

  // Ver formulários
  getFormSubmits: () => {
    const forms = userActivities.filter(a => a.type === 'FORM_SUBMIT');
    console.table(forms);
    return forms;
  },

  // Estatísticas de atividade
  getActivityStats: () => {
    const stats = {
      total_activities: userActivities.length,
      clicks: userActivities.filter(a => a.type === 'CLICK').length,
      navigation: userActivities.filter(a => a.type === 'NAVIGATION').length,
      form_submits: userActivities.filter(a => a.type === 'FORM_SUBMIT').length,
      session_duration: userActivities.length > 0 ? 
        (new Date() - userActivities[0].timestamp) / 1000 / 60 : 0 // em minutos
    };
    
    console.log('📊 ESTATÍSTICAS DE ATIVIDADE:');
    console.table(stats);
    return stats;
  },

  // Limpar atividades
  clearActivities: () => {
    userActivities.length = 0;
    console.log('🧹 Atividades limpas!');
  },

  // Exportar atividades
  exportActivities: () => {
    const dataStr = JSON.stringify(userActivities, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('📁 Atividades exportadas!');
  }
};

// 5. INSTRUÇÕES DE USO
console.log(`
🚀 MONITORAMENTO ATIVO!

📋 COMANDOS DISPONÍVEIS:

🔍 LOGS:
- analytics.getAllLogs() - Ver todos os logs
- analytics.getDebugLogs() - Ver logs de debug
- analytics.getSuccessLogs() - Ver logs de sucesso  
- analytics.getErrorLogs() - Ver logs de erro
- analytics.getUserActivity() - Ver atividade do usuário
- analytics.getStats() - Estatísticas dos logs
- analytics.clearLogs() - Limpar logs
- analytics.exportLogs() - Exportar logs

🎯 ATIVIDADES:
- activityTracker.getActivities() - Ver todas as atividades
- activityTracker.getClicks() - Ver cliques
- activityTracker.getNavigation() - Ver navegação
- activityTracker.getFormSubmits() - Ver formulários
- activityTracker.getActivityStats() - Estatísticas
- activityTracker.clearActivities() - Limpar atividades
- activityTracker.exportActivities() - Exportar atividades

💡 DICAS:
- Use console.table() para ver dados organizados
- Os logs são capturados automaticamente
- As atividades são rastreadas em tempo real
- Use F12 → Console para executar os comandos
`);

// 6. RELATÓRIO AUTOMÁTICO A CADA 5 MINUTOS
setInterval(() => {
  if (logs.length > 0 || userActivities.length > 0) {
    console.log(`
📊 RELATÓRIO AUTOMÁTICO (${new Date().toLocaleTimeString()}):
- Logs capturados: ${logs.length}
- Atividades rastreadas: ${userActivities.length}
- Erros encontrados: ${logs.filter(l => l.message.includes('❌')).length}
- Sucessos: ${logs.filter(l => l.message.includes('✅')).length}
    `);
  }
}, 5 * 60 * 1000); // 5 minutos

console.log('✅ Monitoramento iniciado com sucesso!');
