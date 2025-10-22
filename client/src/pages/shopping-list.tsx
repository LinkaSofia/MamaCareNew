import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { 
  ArrowLeft, 
  Plus, 
  ShoppingCart, 
  Trash2, 
  DollarSign, 
  Package, 
  CheckCircle,
  TrendingUp,
  Filter,
  Lightbulb,
  Target,
  PieChart,
  Star,
  Heart,
  Baby,
  Home,
  Shirt,
  Bath,
  Utensils,
  Pill,
  Sparkles,
  Calculator,
  AlertCircle,
  ChevronRight,
  Wallet,
  PiggyBank,
  Pencil
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ShoppingItem {
  id: string;
  name: string;
  price: number | null;
  purchased: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  essential: boolean;
  purchaseDate?: string;
}

interface ShoppingData {
  items: ShoppingItem[];
}

// Comprehensive categories for pregnancy and baby
const categories = [
  { 
    id: 'baby-clothes', 
    name: 'Roupas do Bebê', 
    icon: '👶', 
    color: '#EC4899',
    essentials: ['Body manga longa (6 unidades)', 'Macacão (4 unidades)', 'Meias (6 pares)', 'Touca (2 unidades)', 'Luvas (2 pares)'],
    optionals: ['Roupas festivas', 'Sapatos decorativos', 'Babadores temáticos']
  },
  { 
    id: 'nursery', 
    name: 'Quarto do Bebê', 
    icon: '🏠', 
    color: '#3B82F6',
    essentials: ['Berço', 'Colchão do berço', 'Cômoda', 'Cadeira de amamentação', 'Trocador'],
    optionals: ['Móbile musical', 'Luminária', 'Tapete', 'Quadros decorativos']
  },
  { 
    id: 'hygiene', 
    name: 'Higiene', 
    icon: '🧼', 
    color: '#10B981',
    essentials: ['Fraldas RN', 'Lenços umedecidos', 'Sabonete neutro', 'Shampoo bebê', 'Pomada para assaduras'],
    optionals: ['Óleos de massagem', 'Talco', 'Cortador de unhas especial']
  },
  { 
    id: 'feeding', 
    name: 'Alimentação', 
    icon: '🍼', 
    color: '#F59E0B',
    essentials: ['Mamadeiras', 'Bicos extras', 'Esterilizador', 'Escova para mamadeira', 'Babadores'],
    optionals: ['Aquecedor de mamadeira', 'Dosador de leite', 'Kit de papinha']
  },
  { 
    id: 'mom-care', 
    name: 'Cuidados Maternos', 
    icon: '💖', 
    color: '#EC4899',
    essentials: ['Sutiãs de amamentação', 'Absorventes para seios', 'Pomada para mamilos', 'Camisolas abertas'],
    optionals: ['Almofada de amamentação', 'Bombinha tira-leite', 'Cinta pós-parto']
  },
  { 
    id: 'safety', 
    name: 'Segurança', 
    icon: '🛡️', 
    color: '#EF4444',
    essentials: ['Bebê conforto', 'Protetor de tomada', 'Trava de porta', 'Monitor de bebê'],
    optionals: ['Protetor de quinas', 'Trava de gaveta', 'Cerca de segurança']
  }
];

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export default function ShoppingList() {
  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [budget, setBudget] = useState<number>(() => {
    const savedBudget = localStorage.getItem(`mamacare_budget_${pregnancy?.id}`);
    return savedBudget ? parseFloat(savedBudget) : 2000;
  });
  const [showEssentialsOnly, setShowEssentialsOnly] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    essential: false
  });
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Salvar orçamento no localStorage sempre que mudar
  useEffect(() => {
    if (pregnancy?.id) {
      localStorage.setItem(`mamacare_budget_${pregnancy.id}`, budget.toString());
      console.log(`💰 Orçamento salvo no localStorage: R$ ${budget} para gravidez ${pregnancy.id}`);
    }
  }, [budget, pregnancy?.id]);

  const { data: shoppingData, isLoading, error: queryError, refetch } = useQuery<ShoppingData>({
    queryKey: ["/api/shopping-items", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: async () => {
      console.log("🛒 [SHOPPING] Iniciando busca de itens para pregnancy:", pregnancy?.id);
      console.log("🛒 [SHOPPING] Pregnancy object:", pregnancy);
      console.log("🛒 [SHOPPING] User object:", user);
      
      if (!pregnancy?.id) {
        console.error("❌ [SHOPPING] pregnancy.id está undefined!");
        throw new Error("pregnancy.id está undefined");
      }
      
      try {
        const response = await apiRequest("GET", `/api/shopping-items?pregnancyId=${pregnancy.id}`);
        console.log("🛒 [SHOPPING] Response status:", response.status);
        console.log("🛒 [SHOPPING] Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [SHOPPING] Erro na resposta:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("✅ [SHOPPING] Items carregados:", data);
        console.log("✅ [SHOPPING] Número de items:", data?.items?.length || 0);
        return data;
      } catch (error) {
        console.error("❌ [SHOPPING] ERRO ao buscar items:", error);
        throw error;
      }
    },
  });

  // Salvar orçamento no localStorage quando mudar
  useEffect(() => {
    if (pregnancy?.id) {
      localStorage.setItem(`mamacare_budget_${pregnancy.id}`, budget.toString());
      console.log(`💰 Budget saved to localStorage: ${budget}`);
    }
  }, [budget, pregnancy?.id]);

  // Calculations
  const items = shoppingData?.items || [];
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
      const essentialMatch = !showEssentialsOnly || item.essential;
      return categoryMatch && priorityMatch && essentialMatch;
    });
  }, [items, selectedCategory, selectedPriority, showEssentialsOnly]);

  const pendingItems = filteredItems.filter(item => !item.purchased);
  const purchasedItems = filteredItems.filter(item => item.purchased);
  const totalSpent = items.filter(item => item.purchased).reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
  const totalPending = items.filter(item => !item.purchased).reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
  const budgetUsed = (totalSpent / budget) * 100;

  // Category statistics
  const categoryStats = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category.id);
    const purchased = categoryItems.filter(item => item.purchased).length;
    const total = categoryItems.length;
    const spent = categoryItems.filter(item => item.purchased).reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    return {
      ...category,
      purchased,
      total,
      progress: total > 0 ? (purchased / total) * 100 : 0,
      spent
    };
  });

  // Get suggestions based on pregnancy week
  const getSuggestions = () => {
    if (!weekInfo) return [];
    
    const suggestions = [];
    const week = weekInfo.week;
    
    if (week >= 20 && week <= 28) {
      suggestions.push(
        ...categories.find(c => c.id === 'nursery')?.essentials?.slice(0, 3).map(item => ({
          item,
          reason: 'Segundo trimestre: momento ideal para preparar o quarto',
          category: 'nursery',
          priority: 'high' as const
        })) || []
      );
    }
    
    if (week >= 30) {
      suggestions.push(
        ...categories.find(c => c.id === 'baby-clothes')?.essentials?.slice(0, 3).map(item => ({
          item,
          reason: 'Terceiro trimestre: prepare as roupas do bebê',
          category: 'baby-clothes',
          priority: 'high' as const
        })) || []
      );
    }
    
    if (week >= 35) {
      suggestions.push(
        ...categories.find(c => c.id === 'hygiene')?.essentials?.slice(0, 2).map(item => ({
          item,
          reason: 'Reta final: essenciais para os primeiros dias',
          category: 'hygiene',
          priority: 'high' as const
        })) || []
      );
    }
    
    return suggestions;
  };

  // Pie chart data
  const pieData = categoryStats.filter(cat => cat.spent > 0).map((cat) => {
    const percentOfBudget = budget > 0 ? Math.round(cat.spent / budget * 100) : 0;
    return {
      name: `${cat.name} (${percentOfBudget}%)`,
      value: cat.spent,
      color: cat.color,
      percentOfBudget
    };
  });
  
  // Debug: Log dos dados do gráfico
  console.log('📊 Category Stats:', categoryStats);
  console.log('📊 Pie Data:', pieData);
  console.log('📊 Total Spent:', totalSpent);

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/shopping-items", item);
      return response.json();
    },
    onSuccess: async (data) => {
      // Atualizar o cache IMEDIATAMENTE (otimistic update)
      try {
        queryClient.setQueryData(["/api/shopping-items", pregnancy?.id], (oldData: any) => {
          if (!oldData) return { items: [data.item] };
          
          // Adicionar novo item na lista
          return {
            ...oldData,
            items: [...(oldData.items || []), data.item]
          };
        });
        console.log("🛒 Cache updated immediately with new item");
      } catch (error) {
        console.error("🛒 Error updating cache:", error);
      }
      
      // Invalidar queries e forçar refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      await refetch();
      
      setShowAddForm(false);
      setFormData({ name: "", price: "", category: "", priority: "medium", essential: false });
      toast({
        title: "✅ Item adicionado!",
        description: "Item foi adicionado à sua lista de compras.",
      });
    },
    onError: (error: any) => {
      console.error("🛒 Error adding item:", error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao adicionar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/shopping-items/${id}`, updates);
      return response.json();
    },
    onSuccess: async (_, { id, updates }) => {
      // Atualizar cache IMEDIATAMENTE
      try {
        queryClient.setQueryData(["/api/shopping-items", pregnancy?.id], (oldData: any) => {
          if (!oldData || !oldData.items) return oldData;
          
          return {
            ...oldData,
            items: oldData.items.map((item: any) => 
              item.id === id ? { ...item, ...updates } : item
            )
          };
        });
        console.log("🛒 Item updated in cache immediately");
      } catch (error) {
        console.error("🛒 Error updating cache:", error);
      }
      
      // Refetch em background para sincronizar
      await queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      await refetch();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🛒 Deleting item:", id);
      const response = await apiRequest("DELETE", `/api/shopping-items/${id}`);
      return response.json();
    },
    onSuccess: async (_, id) => {
      console.log("🛒 Item deleted successfully");
      
      // Atualizar cache IMEDIATAMENTE removendo o item
      try {
        queryClient.setQueryData(["/api/shopping-items", pregnancy?.id], (oldData: any) => {
          if (!oldData || !oldData.items) return oldData;
          
          return {
            ...oldData,
            items: oldData.items.filter((item: any) => item.id !== id)
          };
        });
        console.log("🛒 Item removed from cache immediately");
      } catch (error) {
        console.error("🛒 Error updating cache:", error);
      }
      
      // Refetch em background para sincronizar
      await queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      await refetch();
      
      setShowDeleteModal(false);
      setItemToDelete(null);
      
      toast({
        title: "🗑️ Item removido",
        description: "Item foi removido da sua lista.",
      });
    },
    onError: (error) => {
      console.error("🛒 Error deleting item:", error);
      toast({
        title: "❌ Erro ao remover",
        description: "Não foi possível remover o item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (item: ShoppingItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.id) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do item é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!pregnancy?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma gravidez ativa encontrada",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      pregnancyId: pregnancy.id,
      name: formData.name.trim(),
      price: formData.price ? formData.price.toString() : null, // Enviar como STRING
      category: formData.category || null,
      priority: formData.priority,
      essential: formData.essential
    };

    console.log("🛒 Submitting shopping item:", JSON.stringify(itemData, null, 2));
    addItemMutation.mutate(itemData);
  };

  const togglePurchased = (id: string, purchased: boolean) => {
    console.log("🛒 Toggling item:", { id, purchased, newState: purchased });
    
    // Se está marcando como comprado, adicionar purchaseDate
    const updates = purchased 
      ? { purchased: true, purchaseDate: new Date().toISOString() }
      : { purchased: false, purchaseDate: null };
    
    updateItemMutation.mutate({ id, updates });
  };

  const addSuggestion = (suggestion: any) => {
    setFormData({
      name: suggestion.item,
      price: "",
      category: suggestion.category,
      priority: suggestion.priority,
      essential: true
    });
    setShowAddForm(true);
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price ? item.price.toString() : "",
      category: item.category || "",
      priority: item.priority,
      essential: item.essential
    });
    setShowEditForm(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do item é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!editingItem) return;

    const itemData = {
      name: formData.name.trim(),
      price: formData.price ? formData.price.toString() : null,
      category: formData.category || null,
      priority: formData.priority,
      essential: formData.essential
    };

    console.log("🛒 Updating shopping item:", JSON.stringify(itemData, null, 2));
    updateItemMutation.mutate({ 
      id: editingItem.id, 
      updates: itemData 
    });

    // Fechar modal e resetar
    setShowEditForm(false);
    setEditingItem(null);
    setFormData({ name: "", price: "", category: "", priority: "medium", essential: false });
  };

  const resetEditForm = () => {
    setShowEditForm(false);
    setEditingItem(null);
    setFormData({ name: "", price: "", category: "", priority: "medium", essential: false });
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AnimatedBackground>
    );
  }

  if (!user || !pregnancy) {
    console.log("⚠️ Shopping List: User ou pregnancy não encontrado", { user: !!user, pregnancy: !!pregnancy });
    setLocation("/login");
    return null;
  }

  console.log("🛒 [SHOPPING] ===== RENDERIZANDO COMPONENTE =====");
  console.log("🛒 [SHOPPING] Items count:", items.length);
  console.log("🛒 [SHOPPING] isLoading:", isLoading);
  console.log("🛒 [SHOPPING] queryError:", queryError);
  console.log("🛒 [SHOPPING] pregnancy:", { id: pregnancy?.id, exists: !!pregnancy });
  console.log("🛒 [SHOPPING] user:", { id: user?.id, exists: !!user });
  console.log("🛒 [SHOPPING] shoppingData:", shoppingData);
  console.log("🛒 [SHOPPING] =====================================");

  const suggestions = getSuggestions();

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-20">
        <div className="px-4 pt-8 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Lista de Compras
            </h1>
            <p className="text-xs text-gray-600 mt-1">Organize suas compras</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-item"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
            <TabsTrigger value="list" className="flex flex-col items-center justify-center py-1 px-2 text-xs font-medium">
              <ShoppingCart className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex flex-col items-center justify-center py-1 px-2 text-xs font-medium">
              <Lightbulb className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Sugestões</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex flex-col items-center justify-center py-1 px-2 text-xs font-medium">
              <PieChart className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Orçamento</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex flex-col items-center justify-center py-1 px-2 text-xs font-medium">
              <Package className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Categorias</span>
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              {/* Pendentes Card */}
              <Card className="bg-gradient-to-br from-blue-200 to-blue-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col items-center gap-2 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-base text-center">Pendentes</span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-blue-600 text-center">
                    {pendingItems.length}
                  </div>
                </CardContent>
              </Card>
              
              {/* Comprados Card */}
              <Card className="bg-gradient-to-br from-green-200 to-green-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col items-center gap-2 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-base text-center">Comprados</span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-green-600 text-center">
                    {purchasedItems.length}
                  </div>
                </CardContent>
              </Card>

              {/* Gastos Card */}
              <Card className="bg-gradient-to-br from-purple-200 to-purple-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col items-center gap-2 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Wallet className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-base text-center">Gastos</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-purple-600 text-center">
                    R$ {totalSpent.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Restante Card */}
              <Card className="bg-gradient-to-br from-orange-200 to-orange-300 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col items-center gap-2 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <PiggyBank className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-xs md:text-base text-center">Restante</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-orange-600 text-center">
                    R$ {totalPending.toFixed(2)}
                  </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Prioridade</Label>
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="essentials"
                      checked={showEssentialsOnly}
                      onCheckedChange={(checked) => setShowEssentialsOnly(checked as boolean)}
                      className="h-5 w-5 cursor-pointer"
                    />
                    <Label htmlFor="essentials" className="text-base font-medium text-gray-700 cursor-pointer">
                      Apenas essenciais
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            {items.length === 0 && (
              <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <ShoppingCart className="h-20 w-20 text-pink-300" />
                    <h3 className="text-2xl font-bold text-gray-700">
                      Sua lista está vazia
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Comece adicionando itens essenciais para a chegada do seu bebê. 
                      Você também pode usar nossas sugestões personalizadas!
                    </p>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Adicionar Primeiro Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Items */}
            {items.length > 0 && pendingItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5 text-pink-500" />
                    Para Comprar ({pendingItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingItems.map((item) => {
                      const category = categories.find(c => c.id === item.category);
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-shrink-0">
                            <Checkbox
                              checked={item.purchased}
                              onCheckedChange={(checked) => togglePurchased(item.id, checked as boolean)}
                                className="h-6 w-6 rounded-md border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white cursor-pointer"
                            />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{item.name}</span>
                                {item.essential && (
                                  <Badge className="bg-red-100 text-red-700 text-sm px-2 py-1">
                                    Essencial
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                {category && (
                                  <span className="text-gray-600">
                                    {category.icon} {category.name}
                                  </span>
                                )}
                                <Badge className={priorityColors[item.priority]}>
                                  {item.priority === 'high' ? 'Alta' : 
                                   item.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                                {item.price && (
                                  <span className="font-semibold text-green-600">
                                    R$ {(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchased Items */}
            {items.length > 0 && purchasedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Comprados ({purchasedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchasedItems.map((item) => {
                      const category = categories.find(c => c.id === item.category);
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 bg-green-50/95 backdrop-blur-sm border border-green-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-shrink-0">
                            <Checkbox
                              checked={item.purchased}
                              onCheckedChange={(checked) => togglePurchased(item.id, checked as boolean)}
                                className="h-6 w-6 rounded-md border-2 border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white cursor-pointer"
                            />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-green-700 line-through">
                                {item.name}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-green-600">
                                {category && (
                                  <span>{category.icon} {category.name}</span>
                                )}
                                {item.price && (
                                  <span className="font-semibold">
                                    R$ {(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}
                                  </span>
                                )}
                                {item.purchaseDate && (
                                  <span className="text-xs">
                                    em {new Date(item.purchaseDate).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
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
                    Baseado no seu progresso na gestação, aqui estão nossas sugestões prioritárias:
                  </p>
                </CardContent>
              </Card>
            )}

            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-orange-500" />
                    Recomendado para Você
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-orange-800 mb-1">
                              {suggestion.item}
                            </h4>
                            <p className="text-sm text-orange-600 mb-2">
                              {suggestion.reason}
                            </p>
                            <Badge className="bg-orange-100 text-orange-700">
                              Prioridade {suggestion.priority === 'high' ? 'Alta' : 'Média'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addSuggestion(suggestion)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Essential Items by Category */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Itens Essenciais por Categoria
              </h3>
              
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center" style={{ color: category.color }}>
                      <span className="text-xl mr-2">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.essentials.map((essential, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{essential}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addSuggestion({
                              item: essential,
                              category: category.id,
                              priority: 'medium'
                            })}
                            className="text-xs h-6"
                          >
                            +
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5 text-blue-500" />
                    Orçamento
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">R$ {budget.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Meta total</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Input */}
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Definir orçamento total</Label>
                    <Input
                      type="number"
                      value={budget === 0 ? '' : budget}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBudget(value === '' ? 0 : parseFloat(value) || 0);
                      }}
                      placeholder="Digite o orçamento"
                      className="w-full"
                    />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso do orçamento</span>
                      <span>{budgetUsed.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Status */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">R$ {totalSpent.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Gasto</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">R$ {totalPending.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Pendente</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        R$ {(budget - totalSpent - totalPending).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Restante</div>
                    </div>
                  </div>

                  {/* Budget Alert */}
                  {budgetUsed > 80 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          Atenção: você já usou {budgetUsed.toFixed(1)}% do seu orçamento!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-purple-500" />
                  Distribuição de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => {
                            const percent = props.payload.percentOfBudget;
                            return [`R$ ${value.toFixed(2)} (${percent}% do orçamento)`, name];
                          }} 
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center p-6">
                    <div>
                      <PieChart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">
                        Nenhum gasto registrado ainda
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        Marque itens como comprados para visualizar os gastos por categoria
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos Detalhados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.filter(stat => stat.spent > 0).map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{stat.icon}</span>
                        <div>
                          <div className="font-medium">{stat.name}</div>
                          <div className="text-sm text-gray-600">
                            {stat.purchased} de {stat.total} itens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold" style={{ color: stat.color }}>
                          R$ {stat.spent.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {totalSpent > 0 ? ((stat.spent / totalSpent) * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <Card key={stat.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center" style={{ color: stat.color }}>
                        <span className="text-2xl mr-3">{stat.icon}</span>
                        {stat.name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {stat.purchased} / {stat.total} itens
                        </div>
                        <div className="text-sm font-semibold" style={{ color: stat.color }}>
                          R$ {stat.spent.toFixed(2)}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{stat.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${stat.progress}%`, 
                            backgroundColor: stat.color 
                          }}
                        />
                      </div>
                    </div>

                    {/* Essential Items Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Itens essenciais:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {stat.essentials.slice(0, 4).map((essential, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span>{essential}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addSuggestion({
                                item: essential,
                                category: stat.id,
                                priority: 'medium'
                              })}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {stat.essentials.length > 4 && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-6"
                            style={{ color: stat.color }}
                          >
                            Ver todos ({stat.essentials.length})
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add item modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold text-center">
                Novo Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Nome do item *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Body para bebê manga longa"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price" className="text-gray-700 font-medium">
                    Preço (R$)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Categoria
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority" className="text-gray-700 font-medium">
                    Prioridade
                  </Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value as 'high' | 'medium' | 'low' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="essential"
                    checked={formData.essential}
                    onCheckedChange={(checked) => setFormData({ ...formData, essential: checked as boolean })}
                  />
                  <Label htmlFor="essential" className="text-sm text-gray-700">
                    Item essencial
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
                    disabled={addItemMutation.isPending}
                  >
                    {addItemMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Adicionar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit item modal */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold text-center">
                Editar Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-charcoal font-medium">
                    Nome do item *
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Body para bebê manga longa"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-price" className="text-charcoal font-medium">
                    Preço (R$)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-category" className="text-charcoal font-medium">
                    Categoria
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-priority" className="text-charcoal font-medium">
                    Prioridade
                  </Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value as 'high' | 'medium' | 'low' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-essential"
                    checked={formData.essential}
                    onCheckedChange={(checked) => setFormData({ ...formData, essential: checked as boolean })}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="edit-essential" className="text-sm text-charcoal font-medium">
                    Item essencial
                  </Label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetEditForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                    disabled={updateItemMutation.isPending}
                  >
                    {updateItemMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Pencil className="mr-2 h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="max-w-md mx-auto z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente "{itemToDelete?.name}" da sua lista de compras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={cancelDelete} className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}