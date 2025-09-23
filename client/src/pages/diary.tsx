import { useState, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { 
  ArrowLeft, 
  Plus, 
  Book, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Heart,
  Sparkles,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  Eye,
  MessageCircle,
  Tag,
  Target,
  Clock,
  Lightbulb,
  Star,
  Activity,
  Zap,
  Sun,
  CloudRain,
  Cloud,
  CloudSnow
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiaryEntry {
  id: string;
  pregnancyId: string;
  title?: string;
  content: string;
  mood: number;
  emotions: string[];
  milestone?: string;
  week?: number;
  date: string;
  prompts?: string[];
}

interface DiaryData {
  entries: DiaryEntry[];
}

// Comprehensive mood system (1-10 scale)
const moods = [
  { value: 1, label: "Terrível", emoji: "😭", color: "#DC2626", bgColor: "#FEF2F2" },
  { value: 2, label: "Muito mal", emoji: "😢", color: "#EF4444", bgColor: "#FEF2F2" },
  { value: 3, label: "Mal", emoji: "😔", color: "#F97316", bgColor: "#FFF7ED" },
  { value: 4, label: "Chateada", emoji: "😕", color: "#EAB308", bgColor: "#FEFCE8" },
  { value: 5, label: "Neutra", emoji: "😐", color: "#6B7280", bgColor: "#F9FAFB" },
  { value: 6, label: "Ok", emoji: "🙂", color: "#10B981", bgColor: "#F0FDF4" },
  { value: 7, label: "Bem", emoji: "😊", color: "#059669", bgColor: "#F0FDF4" },
  { value: 8, label: "Muito bem", emoji: "😄", color: "#0891B2", bgColor: "#F0F9FF" },
  { value: 9, label: "Excelente", emoji: "😍", color: "#7C3AED", bgColor: "#FAF5FF" },
  { value: 10, label: "Radiante", emoji: "🤩", color: "#C2185B", bgColor: "#FCE7F3" }
];

// Emotion tags for categorization
const emotionTags = [
  { value: "gratidao", label: "Gratidão", color: "#10B981" },
  { value: "ansiedade", label: "Ansiedade", color: "#F59E0B" },
  { value: "amor", label: "Amor", color: "#EC4899" },
  { value: "medo", label: "Medo", color: "#EF4444" },
  { value: "esperanca", label: "Esperança", color: "#3B82F6" },
  { value: "cansaco", label: "Cansaço", color: "#6B7280" },
  { value: "empolgacao", label: "Empolgação", color: "#8B5CF6" },
  { value: "nostalgia", label: "Nostalgia", color: "#14B8A6" },
  { value: "preocupacao", label: "Preocupação", color: "#F97316" },
  { value: "paz", label: "Paz", color: "#06B6D4" },
  { value: "curiosidade", label: "Curiosidade", color: "#84CC16" },
  { value: "confianca", label: "Confiança", color: "#A855F7" }
];

// Important pregnancy milestones
const milestones = {
  8: 'Primeiro batimento cardíaco',
  12: 'Fim do primeiro trimestre',
  16: 'Descoberta do sexo',
  20: 'Primeiros movimentos',
  24: 'Viabilidade fetal',
  28: 'Terceiro trimestre',
  32: 'Desenvolvimento pulmonar',
  36: 'Bebê considerado a termo',
  40: 'Data provável do parto'
};

// Writing prompts based on pregnancy week
const getWritingPrompts = (week?: number) => {
  if (!week) return [];
  
  if (week <= 12) {
    return [
      "Como você se sente sabendo que está grávida?",
      "Quais são suas maiores expectativas para esta gestação?",
      "O que você gostaria de dizer para seu bebê neste momento?",
      "Como sua vida mudou desde que descobriu a gravidez?"
    ];
  } else if (week <= 28) {
    return [
      "Como você imagina seu bebê neste momento?",
      "Quais preparativos você está fazendo?",
      "O que você mais espera nos próximos meses?",
      "Como se sente sobre as mudanças no seu corpo?"
    ];
  } else {
    return [
      "Como você se sente sabendo que o encontro está próximo?",
      "O que você quer que seu bebê saiba sobre este período?",
      "Quais são seus maiores medos e esperanças agora?",
      "Como você se imagina sendo mãe?"
    ];
  }
};

export default function Diary() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterMood, setFilterMood] = useState<string>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: 5,
    emotions: [] as string[],
    milestone: "",
    week: ""
  });

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entriesData, isLoading } = useQuery<DiaryData>({
    queryKey: ["/api/diary-entries", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: async () => {
      // Chamada real para a API
      const response = await apiRequest("GET", `/api/diary-entries/${pregnancy?.id}`);
      const data = await response.json();
      
      // Parse emotions e prompts de volta para arrays
      const entries = data.entries.map((entry: any) => ({
        ...entry,
        emotions: typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions || [],
        prompts: typeof entry.prompts === 'string' ? JSON.parse(entry.prompts) : entry.prompts || []
      }));
      
      return { entries };
    },
  });

  // Calculations and filtering
  const entries = entriesData?.entries || [];
  
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const moodMatch = filterMood === 'all' || entry.mood.toString() === filterMood;
      const emotionMatch = filterEmotion === 'all' || entry.emotions.includes(filterEmotion);
      return moodMatch && emotionMatch;
    });
  }, [entries, filterMood, filterEmotion]);

  // Mood analytics
  const moodAnalytics = useMemo(() => {
    const last30Days = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = subDays(new Date(), 30);
        return entryDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const moodTrendData = last30Days.map(entry => ({
      date: format(new Date(entry.date), 'dd/MM'),
      mood: entry.mood,
      title: entry.title || 'Entrada'
    }));

    const averageMood = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
      : 0;

    const moodDistribution = moods.map(mood => ({
      mood: mood.label,
      count: entries.filter(entry => entry.mood === mood.value).length,
      color: mood.color
    })).filter(item => item.count > 0);

    const emotionFrequency = emotionTags.map(emotion => ({
      emotion: emotion.label,
      count: entries.reduce((sum, entry) => 
        sum + (entry.emotions.includes(emotion.value) ? 1 : 0), 0
      ),
      color: emotion.color
    })).filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      moodTrendData,
      averageMood,
      moodDistribution,
      emotionFrequency,
      totalEntries: entries.length,
      entriesThisWeek: entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = subDays(new Date(), 7);
        return entryDate >= weekAgo;
      }).length
    };
  }, [entries]);

  // Calendar data
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(day => {
      const dayEntries = entries.filter(entry => 
        isSameDay(new Date(entry.date), day)
      );
      const averageMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
        : null;

      return {
        date: day,
        entries: dayEntries,
        averageMood,
        hasEntries: dayEntries.length > 0
      };
    });
  }, [entries, selectedDate]);

  // Mutations
  const addEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      console.log("📝 Sending diary entry:", entry);
      const response = await apiRequest("POST", "/api/diary-entries", entry);
      console.log("📝 Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("📝 API Error:", errorData);
        throw new Error(errorData.error || "Failed to save diary entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      handleCloseForm();
      toast({
        title: "📝 Entrada salva!",
        description: "Sua entrada do diário foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("❌ Error saving diary entry:", error);
      toast({
        title: "❌ Erro",
        description: `Erro ao salvar entrada: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: any }) => {
      const response = await apiRequest("PUT", `/api/diary-entries/${id}`, entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      handleCloseForm();
      toast({
        title: "✏️ Entrada atualizada!",
        description: "Sua entrada foi atualizada com sucesso.",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/diary-entries/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      toast({
        title: "🗑️ Entrada removida",
        description: "Entrada foi removida do diário.",
      });
    },
  });

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingEntry(null);
    setFormData({ 
      title: "", 
      content: "", 
      mood: 5, 
      emotions: [], 
      milestone: "", 
      week: "" 
    });
    setSelectedPrompt('');
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || "",
      content: entry.content || "",
      mood: entry.mood || 5,
      emotions: entry.emotions || [],
      milestone: entry.milestone || "",
      week: entry.week?.toString() || "",
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 HandleSubmit called:", { 
      hasPregnancy: !!pregnancy, 
      pregnancyId: pregnancy?.id,
      formData 
    });
    
    if (!pregnancy?.id) {
      console.error("❌ No pregnancy ID found");
      toast({
        title: "Erro",
        description: "Nenhuma gravidez ativa encontrada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pregnancy) {
      toast({
        title: "Erro",
        description: "Nenhuma gravidez ativa encontrada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da entrada é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const week = formData.week ? parseInt(formData.week) : weekInfo?.week;
    const milestone = week && milestones[week as keyof typeof milestones] 
      ? milestones[week as keyof typeof milestones] 
      : formData.milestone;

    const entryData = {
      pregnancyId: pregnancy!.id,
      title: formData.title.trim() || null,
      content: formData.content.trim(),
      mood: formData.mood.toString(),
      emotions: JSON.stringify(formData.emotions),
      milestone: milestone || null,
      week: week || null,
      date: new Date(),
      prompts: JSON.stringify(selectedPrompt ? [selectedPrompt] : [])
    };
    
    console.log("📝 Entry data to send:", JSON.stringify(entryData, null, 2));
    console.log("📝 Pregnancy ID type:", typeof entryData.pregnancyId);
    console.log("📝 Week type:", typeof entryData.week);
    console.log("📝 Date type:", typeof entryData.date);
    console.log("📝 All field types:", {
      pregnancyId: typeof entryData.pregnancyId,
      title: typeof entryData.title,
      content: typeof entryData.content,
      mood: typeof entryData.mood,
      emotions: typeof entryData.emotions,
      milestone: typeof entryData.milestone,
      week: typeof entryData.week,
      date: typeof entryData.date,
      prompts: typeof entryData.prompts
    });
    
    // Verificar se todos os campos obrigatórios estão presentes
    if (!entryData.pregnancyId) {
      console.error("❌ Missing pregnancyId");
      toast({
        title: "Erro",
        description: "ID da gravidez não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    if (!entryData.content) {
      console.error("❌ Missing content");
      toast({
        title: "Erro",
        description: "Conteúdo é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se o pregnancyId é válido (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entryData.pregnancyId)) {
      console.error("❌ Invalid pregnancyId format:", entryData.pregnancyId);
      toast({
        title: "Erro",
        description: "ID da gravidez inválido.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se a data é válida
    if (!entryData.date || isNaN(new Date(entryData.date).getTime())) {
      console.error("❌ Invalid date format:", entryData.date);
      toast({
        title: "Erro",
        description: "Data inválida.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se o week é válido (número ou null)
    if (entryData.week !== null && (isNaN(entryData.week) || entryData.week < 1 || entryData.week > 42)) {
      console.error("❌ Invalid week value:", entryData.week);
      toast({
        title: "Erro",
        description: "Semana inválida (deve ser entre 1 e 42).",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se o mood é válido (string)
    if (entryData.mood && typeof entryData.mood !== 'string') {
      console.error("❌ Invalid mood type:", typeof entryData.mood);
      toast({
        title: "Erro",
        description: "Humor deve ser uma string.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("✅ All validations passed, sending to API...");

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, entry: entryData });
    } else {
      addEntryMutation.mutate(entryData);
    }
  };

  const toggleEmotion = (emotion: string) => {
    const currentEmotions = formData.emotions;
    const newEmotions = currentEmotions.includes(emotion)
      ? currentEmotions.filter(e => e !== emotion)
      : [...currentEmotions, emotion];
    
    setFormData(prev => ({ ...prev, emotions: newEmotions }));
  };

  const getMoodColor = (moodValue: number) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood?.color || '#6B7280';
  };

  const getMoodEmoji = (moodValue: number) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood?.emoji || '😐';
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

  const currentPrompts = getWritingPrompts(weekInfo?.week);

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-20 bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-sm">
      <div className="p-4 pt-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-12">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-md shadow-xl rounded-full hover:bg-pink-100 border border-pink-200/50"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-pink-600" />
          </Button>
          
          <div className="flex-1 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200/50">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Diário da Gestação
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                <Heart className="h-4 w-4 mr-1 text-pink-500" />
                {weekInfo ? `Semana ${weekInfo.week} de gestação` : "Registre seus momentos"}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-entry"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        <Tabs defaultValue="entries" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="entries" className="flex items-center text-xs">
              <Book className="w-3 h-3 mr-1" />
              Entradas
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Humor
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center text-xs">
              <Star className="w-3 h-3 mr-1" />
              Marcos
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Análises
            </TabsTrigger>
          </TabsList>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Book className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{entries.length}</div>
                  <div className="text-xs text-gray-600">Total de entradas</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <Activity className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-600">
                    {moodAnalytics.averageMood.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Humor médio</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {moodAnalytics.entriesThisWeek}
                  </div>
                  <div className="text-xs text-gray-600">Esta semana</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {entries.filter(e => e.mood >= 8).length}
                  </div>
                  <div className="text-xs text-gray-600">Dias felizes</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Humor</Label>
                    <Select value={filterMood} onValueChange={setFilterMood}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os humores</SelectItem>
                        {moods.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value.toString()}>
                            <div className="flex items-center">
                              <span className="mr-2">{mood.emoji}</span>
                              {mood.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Emoção</Label>
                    <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as emoções</SelectItem>
                        {emotionTags.map((emotion) => (
                          <SelectItem key={emotion.value} value={emotion.value}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: emotion.color }}
                              />
                              {emotion.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Writing Prompts */}
            {currentPrompts.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-700">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Inspiração para Escrever
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-600 mb-3">
                    Baseado na sua semana atual ({weekInfo?.week}ª), aqui estão algumas perguntas para inspirar sua escrita:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setShowAddForm(true);
                        }}
                        className="text-left justify-start h-auto p-3 bg-white hover:bg-amber-50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-500" />
                        <span className="text-sm text-amber-800">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entries List */}
            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Book className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {entries.length === 0 ? 'Seu diário está esperando' : 'Nenhuma entrada encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {entries.length === 0 
                      ? 'Comece a documentar seus sentimentos e experiências' 
                      : 'Ajuste os filtros ou adicione novas entradas'
                    }
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    <Book className="mr-2 h-4 w-4" />
                    {entries.length === 0 ? 'Primeira entrada' : 'Nova entrada'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <Card key={entry.id} className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border border-pink-200/50 hover:border-pink-300/70 rounded-2xl overflow-hidden">
                      <CardHeader className="pb-3 bg-gradient-to-r from-pink-50/50 to-purple-50/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                              <CardTitle className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                {entry.title || "Entrada do diário"}
                              </CardTitle>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </div>
                              {entry.week && (
                              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs border border-blue-200/50 shadow-sm">
                                {entry.week}ª semana
                              </Badge>
                              )}
                              <div 
                                className="px-3 py-1 rounded-full text-xs text-white font-medium shadow-sm"
                                style={{ backgroundColor: getMoodColor(entry.mood) }}
                              >
                                {moods.find(m => m.value === entry.mood)?.label}
                              </div>
                            </div>
                            {entry.milestone && (
                              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs mb-2 border border-purple-200/50 shadow-sm">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {entry.milestone}
                              </Badge>
                            )}
                            {entry.emotions && entry.emotions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {entry.emotions.map(emotion => {
                                  const emotionData = emotionTags.find(e => e.value === emotion);
                                  return emotionData ? (
                                    <Badge 
                                      key={emotion} 
                                      className="text-xs"
                                      style={{ 
                                        backgroundColor: emotionData.color + '20',
                                        color: emotionData.color,
                                        borderColor: emotionData.color + '40'
                                      }}
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {emotionData.label}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                              className="text-purple-500 hover:text-purple-700 h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              className="text-red-500 hover:text-red-700 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {entry.content}
                        </p>
                        {entry.prompts && entry.prompts.length > 0 && (
                          <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-300">
                            <p className="text-xs text-amber-600 italic">
                              Inspirado por: "{entry.prompts[0]}"
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Mood Analysis Tab */}
          <TabsContent value="mood" className="space-y-6">
            {/* Mood Trend Chart */}
            {moodAnalytics.moodTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Evolução do Humor (Últimos 30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodAnalytics.moodTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 10]} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value} - ${moods.find(m => m.value === value)?.label}`, 
                            'Humor'
                          ]}
                          labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#8B5CF6" 
                          strokeWidth={3}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-green-500" />
                    Distribuição de Humor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moodAnalytics.moodDistribution.map((item, index) => {
                      const maxCount = Math.max(...moodAnalytics.moodDistribution.map(d => d.count));
                      const percentage = (item.count / maxCount) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <span className="mr-2">
                                {moods.find(m => m.label === item.mood)?.emoji}
                              </span>
                              {item.mood}
                            </span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: item.color 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-purple-500" />
                    Emoções Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moodAnalytics.emotionFrequency.map((emotion, index) => {
                      const maxCount = Math.max(...moodAnalytics.emotionFrequency.map(e => e.count));
                      const percentage = (emotion.count / maxCount) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: emotion.color }}
                              />
                              {emotion.emotion}
                            </span>
                            <span className="font-semibold">{emotion.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: emotion.color 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 text-pink-500" />
                  Calendário de Humor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="text-center text-sm font-medium text-gray-500">Dom</div>
                  <div className="text-center text-sm font-medium text-gray-500">Seg</div>
                  <div className="text-center text-sm font-medium text-gray-500">Ter</div>
                  <div className="text-center text-sm font-medium text-gray-500">Qua</div>
                  <div className="text-center text-sm font-medium text-gray-500">Qui</div>
                  <div className="text-center text-sm font-medium text-gray-500">Sex</div>
                  <div className="text-center text-sm font-medium text-gray-500">Sáb</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {calendarData.map((day, index) => (
                    <div 
                      key={index}
                      className="aspect-square flex items-center justify-center text-xs relative rounded cursor-pointer hover:bg-gray-100"
                      style={{
                        backgroundColor: day.hasEntries && day.averageMood 
                          ? getMoodColor(Math.round(day.averageMood)) + '20' 
                          : 'transparent'
                      }}
                    >
                      <span className="text-gray-700">
                        {format(day.date, 'd')}
                      </span>
                      {day.hasEntries && (
                        <div 
                          className="absolute top-1 right-1 w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: day.averageMood 
                              ? getMoodColor(Math.round(day.averageMood))
                              : '#6B7280'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Humor baixo</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Humor neutro</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Humor alto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Star className="mr-2 h-5 w-5" />
                  Marcos da Sua Gestação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-600">
                  Acompanhe e documente os momentos mais importantes da sua jornada.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {Object.entries(milestones).map(([week, milestone]) => {
                const weekNum = parseInt(week);
                const hasEntry = entries.some(entry => 
                  entry.week === weekNum || 
                  entry.milestone?.toLowerCase().includes(milestone.toLowerCase())
                );
                const entryForMilestone = entries.find(entry => 
                  entry.week === weekNum || 
                  entry.milestone?.toLowerCase().includes(milestone.toLowerCase())
                );
                const currentWeek = weekInfo?.week || 0;
                const isPast = weekNum < currentWeek;
                const isCurrent = weekNum === currentWeek;
                const isFuture = weekNum > currentWeek;

                return (
                  <Card 
                    key={week} 
                    className={`${
                      hasEntry ? 'bg-green-50 border-green-200' : 
                      isCurrent ? 'bg-blue-50 border-blue-200' :
                      isPast ? 'bg-gray-50 border-gray-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            hasEntry ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-blue-500 text-white' :
                            isPast ? 'bg-gray-400 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {hasEntry ? '✓' : week}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{milestone}</h4>
                            <p className="text-sm text-gray-600">{week}ª semana</p>
                            {isCurrent && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                                Semana atual
                              </Badge>
                            )}
                            {hasEntry && entryForMilestone && (
                              <p className="text-sm text-green-700 mt-1 italic">
                                Documentado em {format(new Date(entryForMilestone.date), 'dd/MM/yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {hasEntry ? (
                            <>
                              <Badge className="bg-green-100 text-green-700">
                                Documentado
                              </Badge>
                              {entryForMilestone && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(entryForMilestone)}
                                  className="text-green-600 hover:text-green-800 h-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  week: week.toString(),
                                  milestone: milestone
                                }));
                                setShowAddForm(true);
                              }}
                              className="text-xs h-8"
                              disabled={isFuture}
                            >
                              {isFuture ? 'Em breve' : 'Documentar'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Custom Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                  Marcos Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries
                    .filter(entry => entry.milestone && 
                      !Object.values(milestones).some(m => 
                        m.toLowerCase().includes(entry.milestone!.toLowerCase())
                      )
                    )
                    .map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                            ★
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-800">{entry.milestone}</h4>
                            <p className="text-sm text-purple-600">
                              {entry.week && `${entry.week}ª semana • `}
                              {format(new Date(entry.date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(entry)}
                          className="text-purple-600 hover:text-purple-800 h-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                  {entries.filter(entry => entry.milestone && 
                    !Object.values(milestones).some(m => 
                      m.toLowerCase().includes(entry.milestone!.toLowerCase())
                    )
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum marco personalizado ainda</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setShowAddForm(true)}
                      >
                        Criar marco
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{getMoodEmoji(Math.round(moodAnalytics.averageMood))}</div>
                  <div className="text-lg font-bold text-green-700">
                    {moodAnalytics.averageMood.toFixed(1)}
                  </div>
                  <div className="text-xs text-green-600">Humor médio geral</div>
                </CardContent>
              </Card>
              
              <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4">
                  <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-700">
                    {entries.length > 0 
                      ? Math.round((entries.length / Math.max(weekInfo?.week || 1, 1)) * 10) / 10 
                      : 0}
                  </div>
                  <div className="text-xs text-blue-600">Entradas por semana</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-4">
                  <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-700">
                    {Object.keys(milestones).filter(week => 
                      entries.some(entry => entry.week === parseInt(week))
                    ).length}
                  </div>
                  <div className="text-xs text-purple-600">Marcos documentados</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <CardContent className="p-4">
                  <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-pink-700">
                    {entries.filter(entry => entry.mood >= 8).length}
                  </div>
                  <div className="text-xs text-pink-600">Dias muito felizes</div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-700">
                    <Sun className="mr-2 h-5 w-5" />
                    Padrões Positivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moodAnalytics.averageMood >= 7 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-green-700">
                          Seu humor médio está muito bom ({moodAnalytics.averageMood.toFixed(1)})! 
                          Continue cultivando essa energia positiva.
                        </p>
                      </div>
                    )}
                    
                    {entries.filter(e => e.emotions.includes('gratidao')).length > 2 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-purple-700">
                          Você expressa gratidão com frequência! Isso é ótimo para o bem-estar emocional.
                        </p>
                      </div>
                    )}
                    
                    {moodAnalytics.entriesThisWeek >= 2 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Você tem sido consistente com o diário! Isso ajuda muito no autoconhecimento.
                        </p>
                      </div>
                    )}

                    {entries.filter(e => e.milestone).length > 3 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-indigo-700">
                          Você está documentando bem os marcos importantes. Que memórias preciosas!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <CloudRain className="mr-2 h-5 w-5" />
                    Áreas de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moodAnalytics.averageMood < 5 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-red-700">
                          Seu humor tem estado baixo. Considere conversar com seu médico ou um profissional de saúde mental.
                        </p>
                      </div>
                    )}
                    
                    {entries.filter(e => e.emotions.includes('ansiedade')).length > entries.length * 0.6 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-orange-700">
                          A ansiedade aparece frequentemente. Técnicas de respiração e conversar com profissionais pode ajudar.
                        </p>
                      </div>
                    )}
                    
                    {moodAnalytics.entriesThisWeek === 0 && entries.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-yellow-700">
                          Você não escreveu esta semana. Que tal dedicar alguns minutos para registrar seus sentimentos?
                        </p>
                      </div>
                    )}

                    {entries.length > 0 && entries.filter(e => e.emotions.includes('medo')).length > entries.length * 0.4 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-purple-700">
                          É normal sentir medo durante a gestação. Compartilhe seus sentimentos com pessoas de confiança.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-700">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Recomendações Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-indigo-800 mb-2">Para melhorar o bem-estar:</h4>
                    <ul className="space-y-1 text-sm text-indigo-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Escreva pelo menos 3x por semana</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Use os prompts de escrita quando não souber o que escrever</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Documente os marcos importantes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Pratique gratidão - anote 3 coisas pelas quais é grata</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-indigo-800 mb-2">Temas para explorar:</h4>
                    <ul className="space-y-1 text-sm text-indigo-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Suas esperanças para o futuro com o bebê</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Mudanças que você tem percebido em si</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Memórias que quer compartilhar com seu bebê</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Preparativos e planos para a chegada do bebê</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50/95 to-purple-50/95 backdrop-blur-md border border-pink-200/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-100/80 to-purple-100/80 border-b border-pink-200/50">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <Book className="mr-2 h-6 w-6 text-pink-500" />
                {editingEntry ? "Editar Entrada" : "Nova Entrada"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {editingEntry ? "Atualize sua entrada do diário" : "Registre um momento especial da sua gestação"}
              </p>
            </CardHeader>
            <CardContent className="bg-white/70 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedPrompt && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-medium mb-1">Inspiração:</p>
                    <p className="text-sm text-amber-600 italic">"{selectedPrompt}"</p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium flex items-center">
                    <Star className="mr-2 h-4 w-4 text-pink-500" />
                    Título (opcional)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Um dia especial"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/80 border-pink-200 focus:border-pink-400 focus:ring-pink-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-gray-700 font-medium flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-pink-500" />
                    Conteúdo *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva seus sentimentos, experiências ou reflexões..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="h-32 resize-none bg-white/80 border-pink-200 focus:border-pink-400 focus:ring-pink-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium mb-2 block flex items-center">
                      <Sparkles className="mr-2 h-4 w-4 text-pink-500" />
                      Como você se sente? (1-10)
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl">{getMoodEmoji(formData.mood)}</span>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: getMoodColor(formData.mood) }}>
                            {formData.mood}
                          </div>
                          <div className="text-xs text-gray-600">
                            {moods.find(m => m.value === formData.mood)?.label}
                          </div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.mood}
                        onChange={(e) => setFormData(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #DC2626 0%, #F59E0B 20%, #10B981 50%, #3B82F6 70%, #8B5CF6 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>😭</span>
                        <span>😐</span>
                        <span>🤩</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">
                      Semana da gestação
                    </Label>
                    <Select 
                      value={formData.week} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, week: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={weekInfo ? `${weekInfo.week}ª semana (atual)` : "Selecione a semana"} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
                          <SelectItem key={week} value={week.toString()}>
                            {week}ª semana
                            {milestones[week as keyof typeof milestones] && (
                              <span className="ml-2 text-purple-600">
                                • {milestones[week as keyof typeof milestones]}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium mb-2 block flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-pink-500" />
                    Emoções (selecione as que se aplicam)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {emotionTags.map(emotion => (
                      <Button
                        key={emotion.value}
                        type="button"
                        variant={formData.emotions.includes(emotion.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEmotion(emotion.value)}
                        className={`justify-start h-8 ${
                          formData.emotions.includes(emotion.value) 
                            ? 'text-white' 
                            : ''
                        }`}
                        style={formData.emotions.includes(emotion.value) ? {
                          backgroundColor: emotion.color,
                          borderColor: emotion.color
                        } : {}}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {emotion.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="milestone" className="text-gray-700 font-medium">
                    Marco especial (opcional)
                  </Label>
                  <Input
                    id="milestone"
                    placeholder="Ex: Primeira consulta, ultrassom 3D..."
                    value={formData.milestone}
                    onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCloseForm}
                    className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    disabled={addEntryMutation.isPending || updateEntryMutation.isPending}
                  >
                    {(addEntryMutation.isPending || updateEntryMutation.isPending) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Book className="mr-2 h-4 w-4" />
                    )}
                    {editingEntry ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}