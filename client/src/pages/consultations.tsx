import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Stethoscope,
  Activity,
  Heart,
  Baby,
  FileText,
  Pill,
  Timer,
  CalendarDays,
  Star,
  ChevronRight,
  Zap,
  Target
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isFuture, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Consultation {
  id: string;
  title: string;
  date: string;
  location?: string;
  doctorName?: string;
  notes?: string;
  completed: boolean;
  type: ConsultationType;
  priority: 'low' | 'medium' | 'high';
  reminders: boolean;
  preparation?: string[];
}

interface ConsultationsData {
  consultations: Consultation[];
  upcoming: Consultation[];
}

type ConsultationType = 'prenatal' | 'ultrasound' | 'exam' | 'specialist' | 'emergency';

const consultationTypes = [
  { 
    type: 'prenatal' as ConsultationType, 
    label: 'Pré-natal', 
    icon: '👶', 
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    description: 'Consulta de rotina com obstetra'
  },
  { 
    type: 'ultrasound' as ConsultationType, 
    label: 'Ultrassom', 
    icon: '📷', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Exame de imagem do bebê'
  },
  { 
    type: 'exam' as ConsultationType, 
    label: 'Exame', 
    icon: '🧪', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Exames laboratoriais'
  },
  { 
    type: 'specialist' as ConsultationType, 
    label: 'Especialista', 
    icon: '👨‍⚕️', 
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Consulta com especialista'
  },
  { 
    type: 'emergency' as ConsultationType, 
    label: 'Urgência', 
    icon: '🚨', 
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Consulta de urgência'
  },
];

export default function Consultations() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    doctorName: "",
    notes: "",
    type: 'prenatal' as ConsultationType,
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminders: true,
    preparation: [] as string[]
  });

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: consultationsData, isLoading } = useQuery<ConsultationsData>({
    queryKey: ["/api/consultations", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: () => {
      // Mock data for now - replace with actual API call
      const now = new Date();
      const mockData: ConsultationsData = {
        consultations: [
          {
            id: '1',
            title: 'Consulta Pré-natal - 1º Trimestre',
            date: addDays(now, 3).toISOString(),
            location: 'Hospital Materno',
            doctorName: 'Dra. Maria Silva',
            notes: 'Levar exames anteriores',
            completed: false,
            type: 'prenatal',
            priority: 'high',
            reminders: true,
            preparation: ['Jejum de 8h', 'Levar cartão de vacina', 'Lista de medicamentos']
          },
          {
            id: '2',
            title: 'Ultrassom Morfológico',
            date: addDays(now, 7).toISOString(),
            location: 'Clínica Ultrassom',
            doctorName: 'Dr. João Santos',
            notes: 'Beber água antes do exame',
            completed: false,
            type: 'ultrasound',
            priority: 'medium',
            reminders: true,
            preparation: ['Beber 1L de água 1h antes', 'Não urinar antes do exame']
          },
          {
            id: '3',
            title: 'Exames de Sangue',
            date: addDays(now, -7).toISOString(),
            location: 'Laboratório Central',
            doctorName: '',
            notes: 'Jejum 12h',
            completed: true,
            type: 'exam',
            priority: 'low',
            reminders: false
          }
        ],
        upcoming: []
      };
      
      // Filter upcoming consultations
      mockData.upcoming = mockData.consultations.filter(c => 
        isFuture(parseISO(c.date)) && !c.completed
      );
      
      return Promise.resolve(mockData);
    },
  });

  // Suggested consultations based on pregnancy week
  const getSuggestedConsultations = () => {
    if (!weekInfo) return [];
    
    const suggestions = [];
    const week = weekInfo.week;
    
    if (week >= 8 && week <= 12) {
      suggestions.push({
        title: 'Primeira consulta pré-natal',
        type: 'prenatal',
        reason: 'Importante para confirmar a gravidez e iniciar o acompanhamento',
        priority: 'high'
      });
    }
    
    if (week >= 11 && week <= 14) {
      suggestions.push({
        title: 'Translucência nucal',
        type: 'ultrasound',
        reason: 'Rastreamento de síndrome de Down e outras alterações',
        priority: 'high'
      });
    }
    
    if (week >= 18 && week <= 24) {
      suggestions.push({
        title: 'Ultrassom morfológico',
        type: 'ultrasound',
        reason: 'Avaliação detalhada da anatomia fetal',
        priority: 'high'
      });
    }
    
    return suggestions;
  };

  const addConsultationMutation = useMutation({
    mutationFn: async (consultation: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        doctorName: "",
        notes: "",
        type: 'prenatal',
        priority: 'medium',
        reminders: true,
        preparation: []
      });
      toast({
        title: "✅ Consulta agendada!",
        description: "Sua consulta foi adicionada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao agendar consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleCompletedMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PUT", `/api/consultations/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    addConsultationMutation.mutate({
      pregnancyId: pregnancy!.id,
      title: formData.title,
      date: dateTime.toISOString(),
      location: formData.location || null,
      doctorName: formData.doctorName || null,
      notes: formData.notes || null,
      type: formData.type,
      priority: formData.priority,
      reminders: formData.reminders,
      preparation: formData.preparation
    });
  };

  // Calendar functions
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getConsultationsForDate = (date: Date) => {
    return consultationsData?.consultations.filter(c => 
      format(parseISO(c.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ) || [];
  };

  if (!user || !pregnancy) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const consultations = consultationsData?.consultations || [];
  const upcoming = consultationsData?.upcoming || [];
  const suggestions = getSuggestedConsultations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
      <div className="p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Consultas</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-consultation"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upcoming" className="flex items-center text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Próximas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center text-xs">
              <CalendarDays className="w-3 h-3 mr-1" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center text-xs">
              <Star className="w-3 h-3 mr-1" />
              Dicas
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            {/* Next Consultation Card */}
            {upcoming.length > 0 && (
              <Card className="border-l-4 border-pink-500 bg-gradient-to-r from-pink-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-pink-700">
                    <Bell className="mr-2 h-5 w-5" />
                    Próxima Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcoming.slice(0, 1).map((consultation) => (
                      <div key={consultation.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">
                              {consultationTypes.find(t => t.type === consultation.type)?.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {consultation.title}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(parseISO(consultation.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </div>
                                {consultation.doctorName && (
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {consultation.doctorName}
                                  </div>
                                )}
                                {consultation.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {consultation.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={
                            consultation.priority === 'high' ? 'bg-red-100 text-red-700' :
                            consultation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {consultation.priority === 'high' ? 'Alta' : 
                             consultation.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>

                        {/* Preparation */}
                        {consultation.preparation && consultation.preparation.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              Preparação necessária:
                            </h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                              {consultation.preparation.map((prep, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  {prep}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Reminders */}
                        {consultation.reminders && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Bell className="w-3 h-3 mr-1" />
                            Lembrete ativado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Upcoming */}
            {upcoming.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                    Outras Consultas Agendadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcoming.slice(1).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {consultationTypes.find(t => t.type === consultation.type)?.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{consultation.title}</div>
                            <div className="text-xs text-gray-600">
                              {format(parseISO(consultation.date), "dd/MM 'às' HH:mm")}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-purple-500" />
                  Resumo da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{upcoming.length}</div>
                    <div className="text-xs text-gray-600">Agendadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {consultations.filter(c => c.completed).length}
                    </div>
                    <div className="text-xs text-gray-600">Realizadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                    >
                      ←
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                    >
                      →
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map(day => {
                    const consultationsOnDay = getConsultationsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        className={`
                          p-2 text-sm rounded-lg relative transition-all
                          ${isCurrentMonth 
                            ? 'text-gray-800 hover:bg-gray-100' 
                            : 'text-gray-400'
                          }
                          ${isCurrentDay ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                          ${consultationsOnDay.length > 0 ? 'bg-pink-50 border border-pink-200' : ''}
                        `}
                        onClick={() => setSelectedDate(day)}
                      >
                        {format(day, 'd')}
                        {consultationsOnDay.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                            {consultationsOnDay.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">
                      {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h4>
                    {getConsultationsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-2">
                        {getConsultationsForDate(selectedDate).map(consultation => (
                          <div key={consultation.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                            <div className="text-lg">
                              {consultationTypes.find(t => t.type === consultation.type)?.icon}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{consultation.title}</div>
                              <div className="text-xs text-gray-600">
                                {format(parseISO(consultation.date), "HH:mm")}
                                {consultation.doctorName && ` • ${consultation.doctorName}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma consulta neste dia</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-green-500" />
                  Histórico de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma consulta registrada</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowAddForm(true)}
                    >
                      Agendar primeira consulta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div 
                        key={consultation.id} 
                        className={`p-4 rounded-lg border transition-all ${
                          consultation.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="text-xl">
                              {consultationTypes.find(t => t.type === consultation.type)?.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`font-semibold ${
                                  consultation.completed ? 'text-green-700 line-through' : 'text-gray-800'
                                }`}>
                                  {consultation.title}
                                </h4>
                                {consultation.completed && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                <Badge className={consultationTypes.find(t => t.type === consultation.type)?.color}>
                                  {consultationTypes.find(t => t.type === consultation.type)?.label}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(parseISO(consultation.date), "dd/MM/yyyy 'às' HH:mm")}
                                </div>
                                {consultation.doctorName && (
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {consultation.doctorName}
                                  </div>
                                )}
                                {consultation.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {consultation.location}
                                  </div>
                                )}
                              </div>
                              
                              {consultation.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  {consultation.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCompletedMutation.mutate({
                              id: consultation.id,
                              completed: !consultation.completed
                            })}
                            className="text-pink-600 hover:text-pink-700"
                          >
                            {consultation.completed ? 'Reabrir' : 'Concluir'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-4">
              {/* Current Week Info */}
              {weekInfo && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-700">
                      <Baby className="mr-2 h-5 w-5" />
                      Semana {weekInfo.week} da Gestação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-600 mb-3">
                      Você está na semana {weekInfo.week}. Aqui estão as consultas recomendadas para esta fase:
                    </p>
                    <div className="flex items-center text-sm text-purple-700">
                      <Heart className="w-4 h-4 mr-1" />
                      {weekInfo.daysRemaining} dias para o nascimento
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Consultations */}
              {suggestions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-orange-500" />
                      Consultas Recomendadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-800 mb-2">
                                {suggestion.title}
                              </h4>
                              <p className="text-sm text-orange-600 mb-3">
                                {suggestion.reason}
                              </p>
                              <Badge className={
                                suggestion.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }>
                                Prioridade {suggestion.priority === 'high' ? 'Alta' : 'Média'}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  title: suggestion.title,
                                  type: suggestion.type as ConsultationType,
                                  priority: suggestion.priority as 'high' | 'medium' | 'low'
                                });
                                setShowAddForm(true);
                              }}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Agendar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-2">
                      Você está em dia com suas consultas!
                    </p>
                    <p className="text-sm text-gray-400">
                      Continue mantendo o acompanhamento regular da sua gestação.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* General Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-500" />
                    Dicas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p>Mantenha consultas regulares mensais no 1º e 2º trimestre</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p>No 3º trimestre, as consultas devem ser quinzenais ou semanais</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p>Sempre leve sua carteirinha de pré-natal</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p>Anote suas dúvidas para não esquecer de perguntar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add consultation modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gray-800">Nova Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Consultation Type */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">
                    Tipo de consulta *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {consultationTypes.slice(0, 4).map((type) => (
                      <Button
                        key={type.type}
                        type="button"
                        variant={formData.type === type.type ? "default" : "outline"}
                        className={`
                          p-3 h-auto flex flex-col items-center space-y-1 text-xs
                          ${formData.type === type.type ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white' : ''}
                        `}
                        onClick={() => setFormData({ ...formData, type: type.type })}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span>{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">
                    Título da consulta *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Consulta pré-natal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date" className="text-gray-700 font-medium">
                      Data *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time" className="text-gray-700 font-medium">
                      Horário *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="doctorName" className="text-gray-700 font-medium">
                    Nome do médico
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Ex: Dra. Maria Silva"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-gray-700 font-medium">
                    Local
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Hospital Materno"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">
                    Prioridade
                  </Label>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={formData.priority === priority ? "default" : "outline"}
                        size="sm"
                        className={`
                          flex-1 text-xs
                          ${formData.priority === priority ? 
                            priority === 'high' ? 'bg-red-500 text-white' :
                            priority === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                            : ''
                          }
                        `}
                        onClick={() => setFormData({ ...formData, priority })}
                      >
                        {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-gray-700 font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Levar exames anteriores, jejum necessário..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Reminders */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reminders"
                    checked={formData.reminders}
                    onChange={(e) => setFormData({ ...formData, reminders: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="reminders" className="text-sm text-gray-700">
                    Ativar lembretes
                  </Label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                    disabled={addConsultationMutation.isPending}
                  >
                    {addConsultationMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    Agendar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}