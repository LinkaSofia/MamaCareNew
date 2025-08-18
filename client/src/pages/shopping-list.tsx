import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, ShoppingCart, Trash2, DollarSign, Package, CheckCircle } from "lucide-react";

export default function ShoppingList() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    priority: "medium",
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shoppingData, isLoading } = useQuery({
    queryKey: ["/api/shopping-items", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/shopping-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-items", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({ name: "", price: "", category: "", priority: "medium" });
      toast({
        title: "Item adicionado!",
        description: "Item foi adicionado à sua lista de compras.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
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
        title: "Item removido",
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
    });
  };

  const togglePurchased = (id: string, purchased: boolean) => {
    updateItemMutation.mutate({ id, updates: { purchased } });
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

  const items = shoppingData?.items || [];
  const pendingItems = items.filter((item: any) => !item.purchased);
  const purchasedItems = items.filter((item: any) => item.purchased);
  const totalSpent = purchasedItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0);

  const categories = ["Roupas do bebê", "Quarto do bebê", "Higiene", "Alimentação", "Medicamentos", "Outros"];
  const priorities = [
    { value: "high", label: "Alta", color: "text-red-600" },
    { value: "medium", label: "Média", color: "text-yellow-600" },
    { value: "low", label: "Baixa", color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-charcoal" />
          </Button>
          <h2 className="text-xl font-bold text-charcoal" data-testid="text-page-title">
            Lista de Compras
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-item"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="glass-effect shadow-lg">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 text-baby-pink-dark mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal" data-testid="text-pending-items">
                {pendingItems.length}
              </div>
              <div className="text-sm text-gray-600">Itens pendentes</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect shadow-lg">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-baby-blue-dark mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal" data-testid="text-total-spent">
                R$ {totalSpent.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total gasto</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending items */}
        {pendingItems.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <ShoppingCart className="mr-2 h-5 w-5 text-baby-pink-dark" />
                Itens para comprar ({pendingItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingItems.map((item: any) => {
                  const priority = priorities.find(p => p.value === item.priority);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      data-testid={`pending-item-${item.id}`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => togglePurchased(item.id, true)}
                          data-testid={`checkbox-${item.id}`}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-charcoal">{item.name}</div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {item.category && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {item.category}
                              </span>
                            )}
                            {priority && (
                              <span className={`${priority.color} text-xs font-medium`}>
                                {priority.label}
                              </span>
                            )}
                            {item.price && (
                              <span className="font-medium">R$ {parseFloat(item.price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${item.id}`}
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

        {/* Purchased items */}
        {purchasedItems.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Itens comprados ({purchasedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchasedItems.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    data-testid={`purchased-item-${item.id}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => togglePurchased(item.id, false)}
                        data-testid={`checkbox-purchased-${item.id}`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-green-700 line-through">{item.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          {item.category && (
                            <span className="bg-green-100 px-2 py-1 rounded text-xs">
                              {item.category}
                            </span>
                          )}
                          {item.price && (
                            <span className="font-medium">R$ {parseFloat(item.price).toFixed(2)}</span>
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
                      data-testid={`button-delete-purchased-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {items.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Lista vazia</h3>
              <p className="text-gray-600 mb-4">Adicione itens à sua lista de compras</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-add-first-item"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar primeiro item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add item modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-charcoal">Novo Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-item">
                <div>
                  <Label htmlFor="name" className="text-charcoal font-medium">
                    Nome do item *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Body para bebê"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price" className="text-charcoal font-medium">
                    Preço (R$)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-price"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-charcoal font-medium">
                    Categoria
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority" className="text-charcoal font-medium">
                    Prioridade
                  </Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={addItemMutation.isPending}
                    data-testid="button-save"
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
