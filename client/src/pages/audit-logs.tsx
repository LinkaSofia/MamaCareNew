import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Filter, Activity, Database, Eye } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  sessionId: string;
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changedFields: string[] | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    tableName: '',
    recordId: '',
    limit: '50'
  });

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['/api/audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.tableName) params.append('tableName', filters.tableName);
      if (filters.recordId) params.append('recordId', filters.recordId);
      params.append('limit', filters.limit);
      
      const response = await fetch(`/api/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  const getActionBadge = (action: string) => {
    const variants = {
      create: 'default',
      update: 'secondary', 
      delete: 'destructive'
    } as const;
    
    const colors = {
      create: '🆕',
      update: '✏️',
      delete: '🗑️'
    } as const;

    return (
      <Badge variant={variants[action as keyof typeof variants] || 'outline'}>
        {colors[action as keyof typeof colors]} {action.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  const getTableIcon = (tableName: string) => {
    const icons = {
      birth_plans: '👶',
      kick_counts: '🦵',
      weight_entries: '⚖️',
      photos: '📸',
      diary_entries: '📔',
      symptoms: '🏥',
      consultations: '👩‍⚕️',
      default: '📊'
    } as const;
    
    return icons[tableName as keyof typeof icons] || icons.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Logs de Auditoria Completa
            </CardTitle>
            <CardDescription className="text-gray-600">
              Acompanhe todas as modificações de dados em tempo real
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filtros */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tabela</label>
                <Select value={filters.tableName} onValueChange={(value) => setFilters({...filters, tableName: value})}>
                  <SelectTrigger data-testid="select-table-filter">
                    <SelectValue placeholder="Todas as tabelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="birth_plans">👶 Planos de Parto</SelectItem>
                    <SelectItem value="kick_counts">🦵 Contagem de Chutes</SelectItem>
                    <SelectItem value="weight_entries">⚖️ Registros de Peso</SelectItem>
                    <SelectItem value="photos">📸 Fotos</SelectItem>
                    <SelectItem value="diary_entries">📔 Diário</SelectItem>
                    <SelectItem value="symptoms">🏥 Sintomas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">ID do Registro</label>
                <Input 
                  placeholder="ID específico (opcional)"
                  value={filters.recordId}
                  onChange={(e) => setFilters({...filters, recordId: e.target.value})}
                  data-testid="input-record-id-filter"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Limite</label>
                <Select value={filters.limit} onValueChange={(value) => setFilters({...filters, limit: value})}>
                  <SelectTrigger data-testid="select-limit-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 registros</SelectItem>
                    <SelectItem value="50">50 registros</SelectItem>
                    <SelectItem value="100">100 registros</SelectItem>
                    <SelectItem value="200">200 registros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => refetch()} className="bg-pink-500 hover:bg-pink-600" data-testid="button-refresh-logs">
                Atualizar Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Histórico de Modificações ({auditData?.count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando logs...</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {auditData?.auditLogs?.map((log: AuditLog) => (
                    <Card key={log.id} className="border-l-4 border-l-pink-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getActionBadge(log.action)}
                              <Badge variant="outline" className="bg-purple-50">
                                {getTableIcon(log.tableName)} {log.tableName}
                              </Badge>
                              <Badge variant="outline" className="font-mono text-xs">
                                {log.recordId.substring(0, 8)}...
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatTimestamp(log.timestamp)}
                              </p>
                              {log.ipAddress && (
                                <p className="text-xs text-gray-500 mt-1">
                                  IP: {log.ipAddress} | Sessão: {log.sessionId?.substring(0, 8)}...
                                </p>
                              )}
                            </div>

                            {log.changedFields && log.changedFields.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Campos alterados:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {log.changedFields.map((field) => (
                                    <Badge key={field} variant="secondary" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                              <div className="bg-red-50 p-3 rounded-lg mb-2">
                                <p className="text-sm font-medium text-red-800 mb-1">Valores anteriores:</p>
                                <pre className="text-xs text-red-700 overflow-x-auto">
                                  {JSON.stringify(log.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.newValues && Object.keys(log.newValues).length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-1">Novos valores:</p>
                                <pre className="text-xs text-green-700 overflow-x-auto">
                                  {JSON.stringify(log.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {auditData?.auditLogs?.length === 0 && (
                    <div className="text-center py-12">
                      <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log encontrado</h3>
                      <p className="text-gray-600">
                        Ainda não há registros de auditoria para os filtros selecionados.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}