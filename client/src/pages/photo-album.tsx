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
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  ArrowLeft, 
  Plus, 
  Camera, 
  Calendar, 
  Trash2, 
  Image, 
  Heart,
  Star,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  Baby,
  Sparkles,
  Eye,
  Download,
  Share2,
  Clock,
  BarChart3,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import type { UploadResult } from "@uppy/core";
import { format, differenceInWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Photo {
  id: string;
  objectPath: string;
  caption?: string;
  week?: number;
  date: string;
  favorite: boolean;
  milestone?: string;
  pregnancyId: string;
}

interface PhotosData {
  photos: Photo[];
}

// Important pregnancy milestones
const milestones = {
  8: 'Primeiro ultrassom',
  12: 'Fim do 1º trimestre',
  16: 'Descoberta do sexo',
  20: 'Ultrassom morfológico',
  24: 'Viabilidade fetal',
  28: 'Início do 3º trimestre',
  32: 'Pré-natal intensivo',
  36: 'Bebê a termo',
  40: 'Data provável do parto'
};

export default function PhotoAlbum() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTrimester, setSelectedTrimester] = useState<string>('all');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    caption: "",
    week: "",
    milestone: "",
    favorite: false,
    uploadedPhotoURL: ""
  });

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: photosData, isLoading } = useQuery<PhotosData>({
    queryKey: ["/api/photos", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: () => {
      // Mock data for demonstration
      const currentDate = new Date();
      const pregnancyStart = pregnancy?.startDate ? new Date(pregnancy.startDate) : new Date();
      
      const mockData: PhotosData = {
        photos: [
          {
            id: '1',
            objectPath: 'https://images.unsplash.com/photo-1493217465235-252dd9c0d632?w=400&h=600&fit=crop',
            caption: 'Primeira foto da barriguinha!',
            week: 8,
            date: new Date(2024, 0, 15).toISOString(),
            favorite: true,
            milestone: 'Primeiro ultrassom',
            pregnancyId: pregnancy?.id || ''
          },
          {
            id: '2',
            objectPath: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=600&fit=crop',
            caption: 'Crescendo a cada dia ❤️',
            week: 16,
            date: new Date(2024, 2, 10).toISOString(),
            favorite: false,
            milestone: 'Descoberta do sexo',
            pregnancyId: pregnancy?.id || ''
          },
          {
            id: '3',
            objectPath: 'https://images.unsplash.com/photo-1606103909936-b26c5dfe0e41?w=400&h=600&fit=crop',
            caption: 'Metade do caminho! 20 semanas ✨',
            week: 20,
            date: new Date(2024, 3, 20).toISOString(),
            favorite: true,
            milestone: 'Ultrassom morfológico',
            pregnancyId: pregnancy?.id || ''
          },
          {
            id: '4',
            objectPath: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=400&h=600&fit=crop',
            caption: 'Terceiro trimestre chegando!',
            week: 28,
            date: new Date(2024, 5, 15).toISOString(),
            favorite: false,
            milestone: 'Início do 3º trimestre',
            pregnancyId: pregnancy?.id || ''
          },
          {
            id: '5',
            objectPath: 'https://images.unsplash.com/photo-1573496260576-466ec4b3a6e1?w=400&h=600&fit=crop',
            caption: 'Reta final! Ansiosa para conhecê-la 👶',
            week: 36,
            date: new Date(2024, 7, 10).toISOString(),
            favorite: true,
            milestone: 'Bebê a termo',
            pregnancyId: pregnancy?.id || ''
          }
        ]
      };
      return Promise.resolve(mockData);
    },
  });

  // Calculations and filtering
  const photos = photosData?.photos || [];
  
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const trimesterMatch = selectedTrimester === 'all' || 
        (selectedTrimester === '1' && photo.week && photo.week <= 12) ||
        (selectedTrimester === '2' && photo.week && photo.week > 12 && photo.week <= 28) ||
        (selectedTrimester === '3' && photo.week && photo.week > 28);
      
      const weekMatch = selectedWeekFilter === 'all' || photo.week?.toString() === selectedWeekFilter;
      const favoriteMatch = !showFavoritesOnly || photo.favorite;
      
      return trimesterMatch && weekMatch && favoriteMatch;
    });
  }, [photos, selectedTrimester, selectedWeekFilter, showFavoritesOnly]);

  // Statistics
  const stats = useMemo(() => {
    const totalPhotos = photos.length;
    const favoritePhotos = photos.filter(p => p.favorite).length;
    const photosByTrimester = {
      1: photos.filter(p => p.week && p.week <= 12).length,
      2: photos.filter(p => p.week && p.week > 12 && p.week <= 28).length,
      3: photos.filter(p => p.week && p.week > 28).length
    };
    const milestoneCoverage = Object.keys(milestones).filter(week => 
      photos.some(p => p.week === parseInt(week))
    ).length;
    
    const weeksWithPhotos = [...new Set(photos.map(p => p.week).filter(Boolean))].length;
    const totalWeeks = weekInfo ? 40 : 40;
    const coveragePercentage = (weeksWithPhotos / totalWeeks) * 100;
    
    return {
      totalPhotos,
      favoritePhotos,
      photosByTrimester,
      milestoneCoverage,
      totalMilestones: Object.keys(milestones).length,
      coveragePercentage,
      weeksWithPhotos
    };
  }, [photos, weekInfo]);

  // Group photos by trimester for timeline
  const photosByTrimester = useMemo(() => {
    return {
      1: photos.filter(p => p.week && p.week <= 12).sort((a, b) => (a.week || 0) - (b.week || 0)),
      2: photos.filter(p => p.week && p.week > 12 && p.week <= 28).sort((a, b) => (a.week || 0) - (b.week || 0)),
      3: photos.filter(p => p.week && p.week > 28).sort((a, b) => (a.week || 0) - (b.week || 0))
    };
  }, [photos]);

  // Mutations
  const addPhotoMutation = useMutation({
    mutationFn: async (photo: any) => {
      const response = await apiRequest("POST", "/api/photos", photo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({
        caption: "",
        week: "",
        milestone: "",
        favorite: false,
        uploadedPhotoURL: ""
      });
      toast({
        title: "📸 Foto adicionada!",
        description: "Sua foto foi salva no álbum com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar foto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
      const response = await apiRequest("PUT", `/api/photos/${id}`, { favorite });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos", pregnancy?.id] });
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
        title: "🗑️ Foto removida",
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
      setFormData(prev => ({
        ...prev,
        uploadedPhotoURL: result.successful[0].uploadURL as string
      }));
      toast({
        title: "✅ Upload concluído!",
        description: "Agora adicione informações para salvar a foto.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.uploadedPhotoURL) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma foto primeiro",
        variant: "destructive",
      });
      return;
    }

    const week = formData.week ? parseInt(formData.week) : null;
    const milestone = week && milestones[week as keyof typeof milestones] ? milestones[week as keyof typeof milestones] : formData.milestone;

    addPhotoMutation.mutate({
      pregnancyId: pregnancy!.id,
      photoURL: formData.uploadedPhotoURL,
      caption: formData.caption.trim() || null,
      week,
      milestone: milestone || null,
      favorite: formData.favorite,
      date: new Date().toISOString(),
    });
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const getTrimesterName = (num: number) => {
    switch(num) {
      case 1: return "1º Trimestre";
      case 2: return "2º Trimestre"; 
      case 3: return "3º Trimestre";
      default: return "";
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Álbum de Fotos</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-photo"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="gallery" className="flex items-center text-xs">
              <Grid3X3 className="w-3 h-3 mr-1" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Comparar
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            {/* Filters and View Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros e Visualização
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Trimestre</Label>
                    <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">1º Trimestre (1-12 sem)</SelectItem>
                        <SelectItem value="2">2º Trimestre (13-28 sem)</SelectItem>
                        <SelectItem value="3">3º Trimestre (29-40 sem)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Semana</Label>
                    <Select value={selectedWeekFilter} onValueChange={setSelectedWeekFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
                          <SelectItem key={week} value={week.toString()}>
                            {week}ª semana
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="favorites"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="favorites" className="text-sm text-gray-700">
                      Apenas favoritas
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Grid/List */}
            {filteredPhotos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {photos.length === 0 ? 'Álbum vazio' : 'Nenhuma foto encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {photos.length === 0 ? 'Comece a documentar sua jornada' : 'Ajuste os filtros ou adicione mais fotos'}
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {photos.length === 0 ? 'Adicionar primeira foto' : 'Adicionar foto'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}>
                {filteredPhotos.map((photo) => (
                  <Card 
                    key={photo.id} 
                    className={`shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => openPhotoModal(photo)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-32 flex-shrink-0' : ''}`}>
                      <img
                        src={photo.objectPath}
                        alt={photo.caption || "Foto da gestação"}
                        className={`object-cover ${viewMode === 'list' ? 'w-full h-24' : 'w-full h-48'}`}
                      />
                      <div className="absolute top-2 left-2">
                        {photo.favorite && (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteMutation.mutate({
                              id: photo.id,
                              favorite: !photo.favorite
                            });
                          }}
                        >
                          <Heart className={`h-3 w-3 ${photo.favorite ? 'fill-current text-red-400' : ''}`} />
                        </Button>
                      </div>
                      {photo.week && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-pink-500 text-white text-xs">
                            {photo.week}ª sem
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {photo.caption && (
                        <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(photo.date), "dd/MM/yyyy")}
                          </span>
                        </div>
                        {photo.milestone && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Marco
                          </Badge>
                        )}
                      </div>

                      {viewMode === 'list' && photo.milestone && (
                        <p className="text-xs text-purple-600 mt-1">
                          {photo.milestone}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Clock className="mr-2 h-5 w-5" />
                  Sua Jornada Fotográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-600">
                  Acompanhe a evolução da sua gestação através das fotos organizadas por trimestre.
                </p>
              </CardContent>
            </Card>

            {[1, 2, 3].map(trimester => (
              <Card key={trimester}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Baby className="mr-2 h-5 w-5 text-pink-500" />
                      {getTrimesterName(trimester)}
                    </span>
                    <Badge className="bg-pink-100 text-pink-700">
                      {photosByTrimester[trimester as keyof typeof photosByTrimester].length} fotos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {photosByTrimester[trimester as keyof typeof photosByTrimester].length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma foto neste trimestre ainda</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setShowAddForm(true)}
                      >
                        Adicionar foto
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {photosByTrimester[trimester as keyof typeof photosByTrimester].map((photo) => (
                        <div 
                          key={photo.id} 
                          className="relative group cursor-pointer"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <img
                            src={photo.objectPath}
                            alt={photo.caption || "Foto da gestação"}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-white text-gray-800 text-xs">
                              {photo.week}ª sem
                            </Badge>
                          </div>
                          {photo.favorite && (
                            <div className="absolute top-2 right-2">
                              <Heart className="h-4 w-4 text-red-500 fill-current" />
                            </div>
                          )}
                          {photo.milestone && (
                            <div className="absolute bottom-2 left-2 right-2">
                              <Badge className="bg-purple-500 text-white text-xs w-full justify-center">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {photo.milestone}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Comparação de Evolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  Veja como sua barriguinha cresceu ao longo das semanas!
                </p>
                
                {photos.length >= 2 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos
                      .filter(photo => photo.week)
                      .sort((a, b) => (a.week || 0) - (b.week || 0))
                      .map((photo, index, sortedPhotos) => (
                        <div key={photo.id} className="space-y-2">
                          <div className="relative group">
                            <img
                              src={photo.objectPath}
                              alt={`Semana ${photo.week}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                              <div className="text-white">
                                <div className="font-semibold">{photo.week}ª semana</div>
                                {photo.caption && (
                                  <div className="text-sm opacity-90">{photo.caption}</div>
                                )}
                              </div>
                            </div>
                            {photo.favorite && (
                              <div className="absolute top-2 right-2">
                                <Heart className="h-4 w-4 text-red-500 fill-current" />
                              </div>
                            )}
                          </div>
                          
                          {index > 0 && (
                            <div className="text-center">
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                +{(photo.week || 0) - (sortedPhotos[index-1].week || 0)} semanas
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Adicione mais fotos
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você precisa de pelo menos 2 fotos para fazer comparações
                    </p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Adicionar fotos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestone Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Marcos Documentados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(milestones).map(([week, milestone]) => {
                    const hasPhoto = photos.some(p => p.week === parseInt(week));
                    return (
                      <div key={week} className={`flex items-center justify-between p-3 rounded-lg ${
                        hasPhoto ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            hasPhoto ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {hasPhoto ? '✓' : week}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{milestone}</div>
                            <div className="text-xs text-gray-600">{week}ª semana</div>
                          </div>
                        </div>
                        {hasPhoto ? (
                          <Badge className="bg-green-100 text-green-700">
                            Documentado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddForm(true)}
                            className="text-xs h-6"
                          >
                            Adicionar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Camera className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</div>
                  <div className="text-xs text-gray-600">Total de fotos</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{stats.favoritePhotos}</div>
                  <div className="text-xs text-gray-600">Favoritas</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.milestoneCoverage}/{stats.totalMilestones}
                  </div>
                  <div className="text-xs text-gray-600">Marcos documentados</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {stats.coveragePercentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Cobertura</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress by Trimester */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
                  Fotos por Trimestre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(trimester => {
                    const photoCount = stats.photosByTrimester[trimester as keyof typeof stats.photosByTrimester];
                    const maxPhotos = Math.max(...Object.values(stats.photosByTrimester));
                    const percentage = maxPhotos > 0 ? (photoCount / maxPhotos) * 100 : 0;
                    
                    return (
                      <div key={trimester}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{getTrimesterName(trimester)}</span>
                          <span className="font-semibold">{photoCount} fotos</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                  Resumo de Atividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Cobertura da gestação</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Semanas documentadas</span>
                        <span className="font-semibold">{stats.weeksWithPhotos} de 40</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.coveragePercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {stats.coveragePercentage.toFixed(1)}% da gestação documentada
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Marcos importantes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Marcos capturados</span>
                        <span className="font-semibold">
                          {stats.milestoneCoverage} de {stats.totalMilestones}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(stats.milestoneCoverage / stats.totalMilestones) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {((stats.milestoneCoverage / stats.totalMilestones) * 100).toFixed(0)}% dos marcos documentados
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-700">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.coveragePercentage < 50 && (
                    <div className="flex items-start space-x-2">
                      <Camera className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Que tal documentar mais sua jornada? Tente tirar pelo menos uma foto por semana.
                      </p>
                    </div>
                  )}
                  
                  {stats.milestoneCoverage < stats.totalMilestones / 2 && (
                    <div className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Não perca os marcos importantes! Verifique na aba Comparar quais marcos ainda não foram documentados.
                      </p>
                    </div>
                  )}
                  
                  {stats.favoritePhotos === 0 && stats.totalPhotos > 0 && (
                    <div className="flex items-start space-x-2">
                      <Heart className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Marque suas fotos favoritas! Toque no coração para destacar os momentos mais especiais.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Photo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Nova Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">
                    Upload da foto *
                  </Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:opacity-90"
                  >
                    <div className="flex items-center justify-center">
                      <Image className="mr-2 h-4 w-4" />
                      {formData.uploadedPhotoURL ? "Foto carregada ✓" : "Selecionar foto"}
                    </div>
                  </ObjectUploader>
                </div>
                
                <div>
                  <Label htmlFor="caption" className="text-gray-700 font-medium">
                    Legenda
                  </Label>
                  <Input
                    id="caption"
                    placeholder="Ex: Barriguinha de 20 semanas ❤️"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="week" className="text-gray-700 font-medium">
                    Semana da gestação
                  </Label>
                  <Select 
                    value={formData.week} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, week: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a semana" />
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

                <div>
                  <Label htmlFor="milestone" className="text-gray-700 font-medium">
                    Marco personalizado
                  </Label>
                  <Input
                    id="milestone"
                    placeholder="Ex: Primeira consulta, chá de bebê..."
                    value={formData.milestone}
                    onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="favorite"
                    checked={formData.favorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, favorite: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="favorite" className="text-sm text-gray-700">
                    Marcar como favorita
                  </Label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        caption: "",
                        week: "",
                        milestone: "",
                        favorite: false,
                        uploadedPhotoURL: ""
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                    disabled={addPhotoMutation.isPending || !formData.uploadedPhotoURL}
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

      {/* Photo Detail Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-full flex flex-col">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoModal(false)}
                  className="text-white hover:bg-white/20"
                >
                  ← Voltar
                </Button>
                {selectedPhoto.week && (
                  <Badge className="bg-white/20 text-white">
                    {selectedPhoto.week}ª semana
                  </Badge>
                )}
                {selectedPhoto.milestone && (
                  <Badge className="bg-purple-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {selectedPhoto.milestone}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavoriteMutation.mutate({
                    id: selectedPhoto.id,
                    favorite: !selectedPhoto.favorite
                  })}
                  className="text-white hover:bg-white/20"
                >
                  <Heart className={`h-4 w-4 ${selectedPhoto.favorite ? 'fill-current text-red-400' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePhotoMutation.mutate(selectedPhoto.id)}
                  className="text-white hover:bg-red-600/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.objectPath}
                alt={selectedPhoto.caption || "Foto da gestação"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {(selectedPhoto.caption || selectedPhoto.date) && (
              <div className="p-4 bg-black/50">
                {selectedPhoto.caption && (
                  <p className="text-white text-center text-lg mb-2">
                    {selectedPhoto.caption}
                  </p>
                )}
                <p className="text-white/70 text-center text-sm">
                  {format(new Date(selectedPhoto.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}