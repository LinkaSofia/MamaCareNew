import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Info, Baby, Heart, User, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function PregnancySetup() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    lastMenstrualPeriod: "",
    dueDate: "",
  });
  const [calculationMethod, setCalculationMethod] = useState<"lmp" | "due">("lmp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");

  const calculateDueDate = (lmp: string) => {
    const lmpDate = new Date(lmp);
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280); // 40 semanas
    return dueDate.toISOString().split('T')[0];
  };

  const calculateLMP = (due: string) => {
    const dueDate = new Date(due);
    const lmpDate = new Date(dueDate);
    lmpDate.setDate(lmpDate.getDate() - 280); // 40 semanas atrás
    return lmpDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalDueDate = formData.dueDate;
      let finalLMP = formData.lastMenstrualPeriod;

      if (calculationMethod === "lmp" && formData.lastMenstrualPeriod) {
        finalDueDate = calculateDueDate(formData.lastMenstrualPeriod);
      } else if (calculationMethod === "due" && formData.dueDate) {
        finalLMP = calculateLMP(formData.dueDate);
      }

      await apiRequest("POST", "/api/pregnancies", {
        dueDate: finalDueDate,
        lastMenstrualPeriod: finalLMP,
        isActive: true,
      });

      // Redirecionar para o dashboard após salvar
      setLocation("/");
    } catch (error: any) {
      setError(error.message || "Erro ao salvar dados da gravidez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gradient-bg">
      <Card className="w-full max-w-md glass-effect shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/login")}
              className="text-gray-600 hover:text-gray-800"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex flex-col items-center">
              <div className="mb-3">
                <div className="w-20 h-20 border-4 border-white shadow-lg rounded-full overflow-hidden bg-gradient-to-r from-baby-pink to-baby-blue flex items-center justify-center relative">
                  {profilePhoto || user?.profilePhotoUrl ? (
                    <img 
                      src={profilePhoto || user.profilePhotoUrl} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                  <div className="absolute -bottom-1 -right-1">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880}
                      onGetUploadParameters={async () => {
                        const response = await apiRequest("POST", "/api/uploads/profile-photo");
                        return {
                          method: "PUT" as const,
                          url: response.uploadURL,
                        };
                      }}
                      onComplete={async (result) => {
                        if (result.successful?.[0]) {
                          const uploadURL = result.successful[0].uploadURL;
                          console.log("Upload URL:", uploadURL);
                          setProfilePhoto(uploadURL);
                          
                          try {
                            const response = await apiRequest("PATCH", "/api/auth/profile", {
                              profilePhotoUrl: uploadURL,
                            });
                            console.log("Profile updated:", response);
                          } catch (error) {
                            console.error("Erro ao salvar foto:", error);
                            setError("Erro ao salvar foto de perfil");
                          }
                        }
                      }}
                      buttonClassName="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center p-0 min-w-0 h-8"
                    >
                      <Upload className="w-4 h-4 text-baby-pink-dark" />
                    </ObjectUploader>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-charcoal">
                Dados da Gravidez
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Vamos calcular em que semana você está
              </p>
            </div>
            <div className="w-10" /> {/* Spacer para centralizar título */}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Método de cálculo */}
            <div className="space-y-3">
              <Label className="text-charcoal font-medium">Como você prefere calcular?</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={calculationMethod === "lmp" ? "default" : "outline"}
                  onClick={() => setCalculationMethod("lmp")}
                  className={`flex-1 ${
                    calculationMethod === "lmp" 
                      ? "bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark text-white" 
                      : "border-gray-300"
                  }`}
                  data-testid="button-lmp"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Última Menstruação
                </Button>
                <Button
                  type="button"
                  variant={calculationMethod === "due" ? "default" : "outline"}
                  onClick={() => setCalculationMethod("due")}
                  className={`flex-1 ${
                    calculationMethod === "due" 
                      ? "bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark text-white" 
                      : "border-gray-300"
                  }`}
                  data-testid="button-due"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Data Prevista
                </Button>
              </div>
            </div>

            {/* Data da última menstruação */}
            {calculationMethod === "lmp" && (
              <div>
                <Label className="text-charcoal font-medium">
                  Data da última menstruação *
                </Label>
                <Input
                  type="date"
                  value={formData.lastMenstrualPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastMenstrualPeriod: e.target.value }))}
                  className="mt-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-lmp"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Calculamos automaticamente a data prevista do parto
                </p>
              </div>
            )}

            {/* Data prevista do parto */}
            {calculationMethod === "due" && (
              <div>
                <Label className="text-charcoal font-medium">
                  Data prevista do parto *
                </Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-due"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Calculamos automaticamente a data da última menstruação
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 text-white font-medium py-3"
              disabled={loading || (!formData.lastMenstrualPeriod && !formData.dueDate)}
              data-testid="button-continue"
            >
              {loading ? "Salvando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
