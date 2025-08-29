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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
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
  ChevronRight
} from "lucide-react";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [budget, setBudget] = useState<number>(2000);
  const [showEssentialsOnly, setShowEssentialsOnly] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    essential: false
  });

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shoppingData, isLoading } = useQuery<ShoppingData>({
    queryKey: ["/api/shopping-items", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: () => {
      // Mock data for demonstration
      const mockData: ShoppingData = {
        items: [
          {
            id: '1',
            name: 'Body manga longa RN',
            price: 25.90,
            purchased: false,
            category: 'baby-clothes',
            priority: 'high',
            essential: true
          },
          {
            id: '2', 
            name: 'Berço de madeira',
            price: 450.00,
            purchased: false,
            category: 'nursery',
            priority: 'high',
            essential: true
          },
          {
            id: '3',
            name: 'Fraldas RN (pacote)',
            price: 35.90,
            purchased: true,
            category: 'hygiene',
            priority: 'high',
            essential: true,
            purchaseDate: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Mamadeira 250ml',
            price: 18.50,
            purchased: false,
            category: 'feeding',
            priority: 'medium',
            essential: true
          },
          {
            id: '5',
            name: 'Sutiã de amamentação',
            price: 45.00,
            purchased: true,
            category: 'mom-care',
            priority: 'high',
            essential: true,
            purchaseDate: new Date().toISOString()
          }
        ]
      };
      return Promise.resolve(mockData);
    },
  });

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
  const totalSpent = items.filter(item => item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
  const totalPending = items.filter(item => !item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetUsed = (totalSpent / budget) * 100;

  // Category statistics
  const categoryStats = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category.id);
    const purchased = categoryItems.filter(item => item.purchased).length;
    const total = categoryItems.length;
    const spent = categoryItems.filter(item => item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
    
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
  const pieData = categoryStats.filter(cat => cat.spent > 0).map((cat) => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color
  }));

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/shopping-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({ name: "", price: "", category: "", priority: "medium", essential: false });
      toast({
        title: "✅ Item adicionado!",
        description: "Item foi adicionado à sua lista de compras.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao adicionar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/shopping-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/shopping-items/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      toast({
        title: "🗑️ Item removido",
        description: "Item foi removido da sua lista.",
      });
    },
  });

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

    addItemMutation.mutate({
      pregnancyId: pregnancy!.id,
      name: formData.name.trim(),
      price: formData.price ? parseFloat(formData.price) : null,
      category: formData.category || null,
      priority: formData.priority,
      essential: formData.essential
    });
  };

  const togglePurchased = (id: string, purchased: boolean) => {
    updateItemMutation.mutate({ id, updates: { purchased } });
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

  const suggestions = getSuggestions();

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
          <h1 className="text-2xl font-bold text-gray-800">Lista de Compras</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-item"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="list" className="flex items-center text-xs">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center text-xs">
              <PieChart className="w-3 h-3 mr-1" />
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center text-xs">
              <Package className="w-3 h-3 mr-1" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{pendingItems.length}</div>
                  <div className="text-xs text-gray-600">Pendentes</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{purchasedItems.length}</div>
                  <div className="text-xs text-gray-600">Comprados</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">R$ {totalSpent.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Gastos</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">R$ {totalPending.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Restante</div>
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="essentials"
                      checked={showEssentialsOnly}
                      onCheckedChange={(checked) => setShowEssentialsOnly(checked as boolean)}
                    />
                    <Label htmlFor="essentials" className="text-sm text-gray-700">
                      Apenas essenciais
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Items */}
            {pendingItems.length > 0 && (
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
                          className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => togglePurchased(item.id, true)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{item.name}</span>
                                {item.essential && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
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
                                    R$ {item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
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
                          className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => togglePurchased(item.id, false)}
                            />
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
                                    R$ {item.price.toFixed(2)}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Lista vazia</h3>
                  <p className="text-gray-600 mb-4">Comece adicionando itens para seu bebê</p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar primeiro item
                  </Button>
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

            {suggestions.length > 0 ? (
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
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-2">
                    Você está bem preparada!
                  </p>
                  <p className="text-sm text-gray-400">
                    Continue acompanhando suas compras na aba Lista.
                  </p>
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
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
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
            {pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-purple-500" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart data={pieData}>
                        <RechartsPieChart
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        />
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gasto']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
                          {((stat.spent / totalSpent) * 100).toFixed(1)}%
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
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gray-800">Novo Item</CardTitle>
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

      <BottomNavigation />
    </div>
  );
}