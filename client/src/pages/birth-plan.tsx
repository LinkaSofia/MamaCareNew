import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateBirthPlanPDF } from "@/lib/pdf-generator";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Download, FileText, Building, Leaf, Users, Music } from "lucide-react";

export default function BirthPlan() {
  const [formData, setFormData] = useState({
    location: "",
    painRelief: {
      natural: false,
      epidural: false,
      other: "",
    },
    companions: "",
    specialRequests: "",
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: birthPlanData, isLoading } = useQuery({
    queryKey: ["/api/birth-plans", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const saveBirthPlanMutation = useMutation({
    mutationFn: async (birthPlan: any) => {
      const response = await apiRequest("POST", "/api/birth-plans", birthPlan);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/birth-plans", pregnancy?.id] });
      toast({
        title: "Plano de parto salvo!",
        description: "Suas preferências foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar plano de parto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Load existing birth plan data
  React.useEffect(() => {
    if (birthPlanData?.birthPlan) {
      const plan = birthPlanData.birthPlan;
      setFormData({
        location: plan.location || "",
        painRelief: plan.painRelief || { natural: false, epidural: false, other: "" },
        companions: plan.companions || "",
        specialRequests: plan.specialRequests || "",
      });
    }
  }, [birthPlanData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveBirthPlanMutation.mutate({
      pregnancyId: pregnancy!.id,
      ...formData,
    });
  };

  const handleGeneratePDF = () => {
    if (!user || !pregnancy) return;

    const pdfData = {
      motherName: user.name,
      dueDate: pregnancy.dueDate,
      ...formData,
    };

    generateBirthPlanPDF(pdfData);
    
    toast({
      title: "PDF gerado!",
      description: "Seu plano de parto foi baixado com sucesso.",
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white pb-20">
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
            Plano de Parto
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={handleGeneratePDF}
            data-testid="button-download-pdf"
          >
            <Download className="h-5 w-5 text-white" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-birth-plan">
          {/* Local do Parto */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Building className="mr-3 h-5 w-5 text-baby-pink-dark" />
                Local do Parto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                className="space-y-3"
                data-testid="radio-birth-location"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="hospital" id="hospital" />
                  <Label htmlFor="hospital" className="text-gray-700">Hospital</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="casa-de-parto" id="casa-de-parto" />
                  <Label htmlFor="casa-de-parto" className="text-gray-700">Casa de Parto</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="domiciliar" id="domiciliar" />
                  <Label htmlFor="domiciliar" className="text-gray-700">Parto Domiciliar</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Métodos de Alívio da Dor */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Leaf className="mr-3 h-5 w-5 text-baby-blue-dark" />
                Métodos de Alívio da Dor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="natural"
                  checked={formData.painRelief.natural}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      painRelief: { ...formData.painRelief, natural: !!checked }
                    })
                  }
                  data-testid="checkbox-natural-pain-relief"
                />
                <Label htmlFor="natural" className="text-gray-700">Métodos naturais</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="epidural"
                  checked={formData.painRelief.epidural}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      painRelief: { ...formData.painRelief, epidural: !!checked }
                    })
                  }
                  data-testid="checkbox-epidural"
                />
                <Label htmlFor="epidural" className="text-gray-700">Anestesia epidural</Label>
              </div>

              <div>
                <Label htmlFor="other-pain-relief" className="text-gray-700">Outros métodos</Label>
                <Input
                  id="other-pain-relief"
                  placeholder="Ex: Massagem, banheira..."
                  value={formData.painRelief.other}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      painRelief: { ...formData.painRelief, other: e.target.value }
                    })
                  }
                  className="mt-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-other-pain-relief"
                />
              </div>
            </CardContent>
          </Card>

          {/* Acompanhantes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Users className="mr-3 h-5 w-5 text-coral" />
                Acompanhantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Nome dos acompanhantes..."
                value={formData.companions}
                onChange={(e) => setFormData({ ...formData, companions: e.target.value })}
                className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                data-testid="input-companions"
              />
            </CardContent>
          </Card>

          {/* Preferências Especiais */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Music className="mr-3 h-5 w-5 text-baby-pink-dark" />
                Preferências Especiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva suas preferências especiais..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="h-24 resize-none focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                data-testid="textarea-special-requests"
              />
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
              disabled={saveBirthPlanMutation.isPending}
              data-testid="button-save-plan"
            >
              {saveBirthPlanMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Salvar Plano de Parto
            </Button>

            <Button 
              type="button"
              variant="outline"
              className="w-full py-3"
              onClick={handleGeneratePDF}
              data-testid="button-generate-pdf"
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF do Plano de Parto
            </Button>
          </div>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
}
