import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Camera, Calendar, Trash2, Image } from "lucide-react";
import type { UploadResult } from "@uppy/core";

export default function PhotoAlbum() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [uploadedPhotoURL, setUploadedPhotoURL] = useState("");

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: photosData, isLoading } = useQuery({
    queryKey: ["/api/photos", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photo: any) => {
      const response = await apiRequest("POST", "/api/photos", photo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos", pregnancy?.id] });
      setShowAddForm(false);
      setCaption("");
      setSelectedWeek("");
      setUploadedPhotoURL("");
      toast({
        title: "Foto adicionada!",
        description: "Sua foto foi salva no álbum.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar foto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/photos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos", pregnancy?.id] });
      toast({
        title: "Foto removida",
        description: "Foto foi removida do álbum.",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful[0]) {
      setUploadedPhotoURL(result.successful[0].uploadURL as string);
      toast({
        title: "Upload concluído!",
        description: "Agora adicione uma legenda para salvar a foto.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedPhotoURL) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma foto primeiro",
        variant: "destructive",
      });
      return;
    }

    addPhotoMutation.mutate({
      pregnancyId: pregnancy!.id,
      photoURL: uploadedPhotoURL,
      caption: caption.trim() || null,
      week: selectedWeek ? parseInt(selectedWeek) : null,
      date: new Date().toISOString(),
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

  const photos = photosData?.photos || [];
  const weekOptions = Array.from({ length: 40 }, (_, i) => i + 1);

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
            Álbum de Fotos
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-photo"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {photos.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Álbum vazio</h3>
              <p className="text-gray-600 mb-4">Comece a documentar sua jornada</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-add-first-photo"
              >
                <Camera className="mr-2 h-4 w-4" />
                Adicionar primeira foto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo: any) => (
              <Card key={photo.id} className="shadow-lg overflow-hidden" data-testid={`photo-${photo.id}`}>
                <div className="relative">
                  <img
                    src={photo.objectPath}
                    alt={photo.caption || "Foto da gestação"}
                    className="w-full h-48 object-cover"
                    data-testid={`img-photo-${photo.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => deletePhotoMutation.mutate(photo.id)}
                    data-testid={`button-delete-${photo.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  {photo.caption && (
                    <p className="text-sm text-charcoal mb-2" data-testid={`text-caption-${photo.id}`}>
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {photo.week && (
                      <span className="flex items-center" data-testid={`text-week-${photo.id}`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {photo.week}ª semana
                      </span>
                    )}
                    <span data-testid={`text-date-${photo.id}`}>
                      {new Date(photo.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add photo modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Nova Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-photo">
                <div>
                  <Label className="text-charcoal font-medium mb-2 block">
                    Upload da foto
                  </Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full bg-gradient-to-r from-baby-pink to-baby-blue text-white hover:opacity-90"
                  >
                    <div className="flex items-center justify-center">
                      <Image className="mr-2 h-4 w-4" />
                      {uploadedPhotoURL ? "Foto carregada ✓" : "Selecionar foto"}
                    </div>
                  </ObjectUploader>
                </div>
                
                <div>
                  <Label htmlFor="caption" className="text-charcoal font-medium">
                    Legenda
                  </Label>
                  <Input
                    id="caption"
                    placeholder="Ex: Barriguinha de 20 semanas"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-caption"
                  />
                </div>
                
                <div>
                  <Label htmlFor="week" className="text-charcoal font-medium">
                    Semana da gestação
                  </Label>
                  <select
                    id="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="select-week"
                  >
                    <option value="">Selecione a semana</option>
                    {weekOptions.map((week) => (
                      <option key={week} value={week}>
                        {week}ª semana
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setUploadedPhotoURL("");
                      setCaption("");
                      setSelectedWeek("");
                    }}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={addPhotoMutation.isPending || !uploadedPhotoURL}
                    data-testid="button-save"
                  >
                    {addPhotoMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Camera className="mr-2 h-4 w-4" />
                    )}
                    Salvar
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
