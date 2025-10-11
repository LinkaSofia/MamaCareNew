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
  CloudSnow,
  ChevronLeft,
  ChevronRight
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
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<DiaryEntry | null>(null);
  
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

  const { data: entriesData, isLoading, refetch } = useQuery<DiaryData>({
    queryKey: ["/api/diary-entries", pregnancy?.id],
    enabled: !!pregnancy,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async () => {
      console.log("📝 Fetching diary entries for pregnancy:", pregnancy?.id);
      console.log("📝 Query key:", ["/api/diary-entries", pregnancy?.id]);
      
      // Chamada real para a API
      const response = await apiRequest("GET", `/api/diary-entries/${pregnancy?.id}`);
      const data = await response.json();
      
      console.log("📝 Raw API response:", data);
      
      // Parse emotions e prompts de volta para arrays
      const entries = data.entries.map((entry: any) => ({
        ...entry,
        emotions: typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions || [],
        prompts: typeof entry.prompts === 'string' ? JSON.parse(entry.prompts) : entry.prompts || []
      }));
      
      console.log("📝 Processed entries:", entries);
      console.log("📝 Number of entries:", entries.length);
      return { entries };
    },
  });

  // Calculations and filtering
  const entries = entriesData?.entries || [];
  
  console.log("📝 Current entries count:", entries.length);
  console.log("📝 Entries data:", entries);
  

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
    
    console.log('📊 Mood Distribution Debug:', {
      totalEntries: entries.length,
      allMoods: moods.map(m => ({ value: m.value, label: m.label })),
      entriesMoods: entries.map(e => e.mood),
      distribution: moodDistribution
    });

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
      console.log("📝 User state:", { user: !!user, userId: user?.id, pregnancyId: pregnancy?.id });
      
      // Verificar se o usuário está logado antes de fazer a requisição
      if (!user) {
        throw new Error("Usuário não está logado");
      }
      
      const response = await apiRequest("POST", "/api/diary-entries", entry);
      console.log("📝 Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("📝 API Error:", errorData);
        throw new Error(errorData.error || "Failed to save diary entry");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("📝 Entry saved successfully, updating UI...");
      console.log("📝 Saved entry data:", data);
      
      // Atualizar o cache IMEDIATAMENTE (otimistic update)
      try {
        queryClient.setQueryData(["/api/diary-entries", pregnancy?.id], (oldData: any) => {
          if (!oldData) return { entries: [data.entry] };
          
          // Adicionar nova entrada no início da lista
          return {
            ...oldData,
            entries: [data.entry, ...oldData.entries]
          };
        });
        console.log("📝 Cache updated immediately with new entry");
      } catch (error) {
        console.error("📝 Error updating cache:", error);
      }
      
      // Fechar o formulário
      handleCloseForm();
      
      // Invalidar queries em background para sincronizar
      queryClient.invalidateQueries({ 
        queryKey: ["/api/diary-entries"],
        exact: false 
      });
      
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
      console.log("📝 Updating diary entry:", { id, entry });
      const response = await apiRequest("PUT", `/api/diary-entries/${id}`, entry);
      console.log("📝 Update response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("📝 Update API Error:", errorData);
        throw new Error(errorData.error || "Failed to update diary entry");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("📝 Entry updated successfully, updating UI...");
      console.log("📝 Updated entry data:", data);
      
      // Fechar o formulário primeiro
      handleCloseForm();
      
      // Invalidar e refetch imediatamente
      console.log("📝 Invalidating queries and refetching...");
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/diary-entries"],
        exact: false 
      });
      
      // Forçar refetch imediatamente
      try {
        console.log("📝 Forcing immediate refetch after update...");
        const refetchResult = await refetch();
        console.log("📝 Refetch completed successfully after update");
        console.log("📝 Refetch result:", refetchResult);
        console.log("📝 New entries count after update:", refetchResult.data?.entries?.length);
      } catch (error) {
        console.error("📝 Error refetching data after update:", error);
      }
      
      toast({
        title: "✏️ Entrada atualizada!",
        description: "Sua entrada foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("❌ Error updating diary entry:", error);
      toast({
        title: "❌ Erro",
        description: `Erro ao atualizar entrada: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/diary-entries/${id}`);
      return { id, ...response.json() };
    },
    onSuccess: async (data) => {
      console.log("📝 Entry deleted successfully, updating UI...");
      console.log("📝 Deleted entry ID:", data.id);
      
      // Atualizar o cache diretamente primeiro (mudança instantânea)
      try {
        console.log("📝 Updating cache directly after delete...");
        queryClient.setQueryData<DiaryData>(["/api/diary-entries", pregnancy?.id], (oldData) => {
          if (!oldData) return oldData;
          
          console.log("📝 Old cache data before delete:", oldData);
          const filteredEntries = oldData.entries.filter(entry => entry.id !== data.id);
          console.log("📝 Filtered entries after delete:", filteredEntries);
          
          return {
            ...oldData,
            entries: filteredEntries
          };
        });
        console.log("📝 Cache updated successfully after delete");
      } catch (error) {
        console.error("📝 Error updating cache after delete:", error);
      }
      
      // Invalidar e refetch em background para sincronizar
      console.log("📝 Invalidating queries and refetching in background...");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/diary-entries"],
        exact: false 
      });
      
      // Refetch em background
      try {
        console.log("📝 Background refetch after delete...");
        await refetch();
        console.log("📝 Background refetch completed");
      } catch (error) {
        console.error("📝 Error in background refetch after delete:", error);
      }
      
      toast({
        title: "🗑️ Entrada removida",
        description: "Entrada foi removida do diário.",
      });
    },
    onError: (error) => {
      console.error("❌ Error deleting diary entry:", error);
      toast({
        title: "❌ Erro",
        description: `Erro ao remover entrada: ${error.message}`,
        variant: "destructive",
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
      mood: entry.mood ?? 5,  // Usa ?? em vez de || para preservar valores falsy mas válidos
      emotions: entry.emotions || [],
      milestone: entry.milestone || "",
      week: entry.week?.toString() || "",
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (entry: DiaryEntry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntryMutation.mutate(entryToDelete.id);
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 HandleSubmit called:", { 
      hasPregnancy: !!pregnancy, 
      pregnancyId: pregnancy?.id,
      hasUser: !!user,
      userId: user?.id,
      formData 
    });
    
    // Debug: Verificar status da autenticação
    fetch("/api/debug/session", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log("📝 Session debug:", data);
      })
      .catch(err => {
        console.error("📝 Session debug error:", err);
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
    
    if (!formData.title || !formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da entrada é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content || !formData.content.trim()) {
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
      title: formData.title.trim(),
      content: formData.content.trim(),
      mood: formData.mood ? formData.mood.toString() : null,
      emotions: formData.emotions.length > 0 ? JSON.stringify(formData.emotions) : null,
      milestone: milestone || null,
      week: week || null,
      date: new Date(),
      prompts: selectedPrompt ? JSON.stringify([selectedPrompt]) : null
    };
    
    // Garantir que campos opcionais não sejam undefined
    if (entryData.milestone === undefined) entryData.milestone = null;
    if (entryData.week === undefined) entryData.week = null;
    
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
    if (!entryData.pregnancyId || !entryData.pregnancyId.trim()) {
      console.error("❌ Missing pregnancyId");
      toast({
        title: "Erro",
        description: "ID da gravidez não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    if (!entryData.content || !entryData.content.trim()) {
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
    console.log(`🎭 getMoodEmoji called with value: ${moodValue}, found mood:`, mood);
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
      <div className="min-h-screen pb-20">
      <div className="px-4 pt-4 pb-4 relative">
        {/* Header com Botão de Voltar, Título Centralizado e Botão Add */}
        <div className="flex items-center justify-between mb-10 relative">
          {/* Botão Voltar - Esquerda */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {/* Título - Centro */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Diário de Gestação
              </h1>
            <p className="text-xs text-gray-600 mt-0.5 flex items-center justify-center">
                <Heart className="h-3 w-3 mr-1 text-pink-500" />
              {weekInfo ? `Semana ${weekInfo.week}` : "Registre seus momentos"}
              </p>
          </div>
          
          {/* Botão Adicionar - Direita */}
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-entry"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Entries Section - Tabs removidas, mantida apenas visualização de entradas */}
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
              {/* Total de entradas Card */}
              <Card className="bg-gradient-to-br from-pink-200 to-pink-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Book className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-lg text-center md:text-left">Total de entradas</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-pink-600 text-center md:text-left">
                    {entries.length}
                  </div>
                </CardContent>
              </Card>

              {/* Esta semana Card */}
              <Card className="bg-gradient-to-br from-blue-200 to-blue-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-lg text-center md:text-left">Esta semana</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-blue-600 text-center md:text-left">
                    {moodAnalytics.entriesThisWeek}
                  </div>
                </CardContent>
              </Card>

              {/* Dias felizes Card */}
              <Card className="bg-gradient-to-br from-pink-200 to-rose-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Heart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-lg text-center md:text-left">Dias felizes</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-pink-600 text-center md:text-left">
                    {entries.filter(e => e.mood >= 8).length}
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Writing Prompts */}
            {currentPrompts.length > 0 && (
              <Card className="mb-6 bg-gradient-to-br from-pink-50/90 to-purple-50/90 backdrop-blur-sm border border-pink-200/50 rounded-3xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-3">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                    Inspiração para Escrever
                    </h3>
                    <p className="text-sm text-gray-600 text-center mt-1">
                      Baseado na sua semana atual ({weekInfo?.week}ª)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentPrompts.map((prompt, index) => (
                      <Card
                        key={index}
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setShowAddForm(true);
                        }}
                        className="cursor-pointer bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <MessageCircle className="w-5 h-5 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 leading-relaxed group-hover:text-pink-700 transition-colors">
                                {prompt}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entries List */}
            {entries.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <Card 
                      key={entry.id} 
                      className="relative bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-3xl overflow-hidden flex flex-col h-full"
                      style={{
                        background: `linear-gradient(135deg, ${getMoodColor(entry.mood)}10 0%, white 100%)`
                      }}
                    >
                      {/* Mood Badge no canto superior direito */}
                      <div 
                        className="absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10"
                                style={{ backgroundColor: getMoodColor(entry.mood) }}
                              >
                        <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                              </div>

                      {/* Action buttons sempre visíveis */}
                      <div className="absolute top-4 left-4 flex space-x-2 z-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                          className="bg-white/90 backdrop-blur-sm text-purple-600 hover:text-purple-700 hover:bg-white h-9 w-9 rounded-full shadow-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(entry)}
                          className="bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-white h-9 w-9 rounded-full shadow-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                      <CardContent className="p-6 pt-20 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 pr-8">
                            {entry.title || "Entrada do diário"}
                          </h3>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            {format(new Date(entry.date), "dd MMM yyyy", { locale: ptBR })}
                            {entry.week && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-blue-600 font-medium">{entry.week}ª semana</span>
                              </>
                            )}
                        </div>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                          {entry.content}
                        </p>

                        {/* Milestone Badge */}
                        {entry.milestone && (
                          <div className="mb-3 inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            {entry.milestone}
                          </div>
                        )}

                        {/* Emotions */}
                        {entry.emotions && entry.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-gray-100">
                            {entry.emotions.slice(0, 3).map(emotion => {
                              const emotionData = emotionTags.find(e => e.value === emotion);
                              return emotionData ? (
                                <span 
                                  key={emotion} 
                                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
                                  style={{ 
                                    backgroundColor: emotionData.color + '15',
                                    color: emotionData.color,
                                    borderColor: emotionData.color + '30'
                                  }}
                                >
                                  {emotionData.label}
                                </span>
                              ) : null;
                            })}
                            {entry.emotions.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                +{entry.emotions.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>

                      {/* Mood Label no rodapé */}
                      <div 
                        className="px-6 py-3 text-center text-sm font-semibold text-white mt-auto"
                        style={{ backgroundColor: getMoodColor(entry.mood) }}
                      >
                        {moods.find(m => m.value === entry.mood)?.label}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Mood Analysis Tab */}
          <TabsContent value="mood" className="space-y-6">
            {/* Mood Trend Chart */}
            {moodAnalytics.moodTrendData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Evolução de Humor (Últimos 30 dias)
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {moodAnalytics.moodTrendData.length} entrada{moodAnalytics.moodTrendData.length !== 1 ? 's' : ''} nos últimos 30 dias
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodAnalytics.moodTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 10]} />
                        <Tooltip 
                          formatter={(value: number) => {
                            const mood = moods.find(m => m.value === value);
                            return [`${value} - ${mood?.label || 'Desconhecido'}`, 'Humor'];
                          }}
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
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Sem dados de humor
                  </h3>
                  <p className="text-gray-600">
                    Adicione entradas ao diário para ver a evolução do seu humor
                  </p>
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
                  {moodAnalytics.moodDistribution.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        Nenhum dado para exibir
                      </p>
                    </div>
                  )}
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
                  {moodAnalytics.emotionFrequency.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        Nenhum dado para exibir
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Calendar View */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 text-pink-500" />
                  Calendário de Humor
                </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(subDays(selectedDate, 30))}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-32 text-center">
                      {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextMonth = new Date(selectedDate);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setSelectedDate(nextMonth);
                      }}
                      className="h-8 px-3"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  <div className="text-center text-xs font-medium text-gray-500">Dom</div>
                  <div className="text-center text-xs font-medium text-gray-500">Seg</div>
                  <div className="text-center text-xs font-medium text-gray-500">Ter</div>
                  <div className="text-center text-xs font-medium text-gray-500">Qua</div>
                  <div className="text-center text-xs font-medium text-gray-500">Qui</div>
                  <div className="text-center text-xs font-medium text-gray-500">Sex</div>
                  <div className="text-center text-xs font-medium text-gray-500">Sáb</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {calendarData.map((day, index) => (
                    <div 
                      key={index}
                      className="aspect-square flex flex-col items-center justify-center text-sm relative rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 font-medium">
                        {format(day.date, 'd')}
                      </span>
                      {day.hasEntries && day.averageMood && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full mt-1"
                          style={{ 
                            backgroundColor: getMoodColor(Math.round(day.averageMood))
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center mt-6 gap-6 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-gray-600">Humor baixo (1-3)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Humor neutro (4-6)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-gray-600">Humor bom (7-8)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-gray-600">Humor ótimo (9-10)</span>
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
                  Marcos de Gestação
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
              <Card className="text-center bg-gradient-to-br from-green-100/90 to-emerald-100/90 border-green-300/50 shadow-lg">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                {editingEntry ? "Editar Entrada" : "Nova Entrada"}
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white/70 backdrop-blur-sm pt-6">
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
                    Título *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Um dia especial"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/80 border-pink-200 focus:border-pink-400 focus:ring-pink-200"
                    required
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
                    className="min-h-[150px] resize-none bg-white/80 border-pink-200 focus:border-pink-400 focus:ring-pink-200"
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mood-slider-pink"
                      />
                      <div className="flex justify-between text-base">
                        <span>{moods[0].emoji}</span>
                        <span>{moods[4].emoji}</span>
                        <span>{moods[9].emoji}</span>
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
                  <Label className="text-gray-700 font-medium mb-3 block flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-pink-500" />
                    Emoções (selecione as que se aplicam)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {emotionTags.map(emotion => (
                      <Button
                        key={emotion.value}
                        type="button"
                        variant={formData.emotions.includes(emotion.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEmotion(emotion.value)}
                        className={`justify-start h-10 rounded-full transition-all duration-200 ${
                          formData.emotions.includes(emotion.value) 
                            ? 'text-white shadow-lg transform scale-105' 
                            : 'hover:scale-105 hover:shadow-md'
                        }`}
                        style={formData.emotions.includes(emotion.value) ? {
                          backgroundColor: emotion.color,
                          borderColor: emotion.color
                        } : {
                          borderColor: emotion.color,
                          color: emotion.color
                        }}
                      >
                        <span className="mr-2 text-sm">💭</span>
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

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Excluir Entrada
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir esta entrada do diário? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  data-testid="button-cancel-delete"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteEntryMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteEntryMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}