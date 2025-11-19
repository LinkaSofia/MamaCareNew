import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { uploadFileToSupabase } from "@/lib/supabase";
import { MessageSquare, Star, Upload, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState("tela inicial");
  const [location] = useLocation();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [hasModalOpen, setHasModalOpen] = useState(false);

  // Verificar se há modais abertos
  useEffect(() => {
    const checkModals = () => {
      const modals = document.querySelectorAll(
        '[class*="z-50"], [style*="z-index: 50"], [style*="z-index:50"], [class*="fixed"][class*="inset-0"]'
      );
      setHasModalOpen(modals.length > 0 && !isOpen); // Não ocultar se for o próprio modal de feedback
    };

    // Verificar inicialmente
    checkModals();

    // Verificar periodicamente
    const interval = setInterval(checkModals, 100);

    // Observar mudanças no DOM
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [isOpen]);

  // Capturar página atual quando abrir o modal
  const handleOpen = () => {
    let pagePath = "tela inicial"; // Valor padrão
    // Capturar página atual
    if (typeof window !== 'undefined' && window.location && window.location.pathname !== undefined) {
      pagePath = window.location.pathname;
    } else if (location !== undefined && location !== null) {
      pagePath = location;
    }
    // Garantir que não seja vazio
    if (!pagePath || pagePath === "" || pagePath === "undefined" || pagePath === "null") {
      pagePath = "tela inicial";
    }
    // Se for "/" (tela inicial), converter para "tela inicial"
    if (pagePath === "/" || pagePath.trim() === "/") {
      pagePath = "tela inicial";
    }
    console.log("📄 handleOpen - Página capturada:", pagePath);
    setCurrentPage(pagePath);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form
    setRating(0);
    setMessage("");
    setImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validar tamanho (10MB)
    if (file.size > 10485760) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Validar tipo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log("📤 Processando imagem:", file.name, (file.size / 1024).toFixed(2), "KB");
      
      // Upload inteligente: tenta Supabase Storage, se falhar usa base64 otimizado
      const { url } = await uploadFileToSupabase(file, 'diary-attachments');
      
      console.log("✅ Imagem processada:", file.name);
      setImageUrl(url);

      toast({
        title: "Imagem adicionada!",
        description: "A imagem foi anexada com sucesso.",
      });
    } catch (error) {
      console.error("❌ Erro ao processar imagem:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "⚠️ Avalie!",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "⚠️ Mensagem vazia",
        description: "Por favor, escreva sua opinião",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // CAPTURA ROBUSTA DA PÁGINA - GARANTIR QUE "/" SEJA SEMPRE CAPTURADO
      let pageAtSubmit: string = "/"; // Valor padrão
      
      // PRIORIDADE 1: window.location.pathname (MAIS CONFIÁVEL) - ACEITA "/"
      if (typeof window !== 'undefined' && window.location && window.location.pathname !== undefined) {
        const pathname = window.location.pathname;
        if (pathname !== null && pathname !== undefined) {
          pageAtSubmit = pathname; // Pode ser "/" e isso é válido!
        }
      }
      // PRIORIDADE 2: location do wouter - ACEITA "/"
      else if (location !== undefined && location !== null) {
        pageAtSubmit = location; // Pode ser "/" e isso é válido!
      }
      // PRIORIDADE 3: currentPage do state - ACEITA "/"
      else if (currentPage !== undefined && currentPage !== null) {
        pageAtSubmit = currentPage; // Pode ser "/" e isso é válido!
      }
      // PRIORIDADE 4: document.location.pathname - ACEITA "/"
      else if (typeof document !== 'undefined' && document.location && document.location.pathname) {
        pageAtSubmit = document.location.pathname; // Pode ser "/" e isso é válido!
      }
      
      // Se ainda estiver vazio após todas as tentativas, usar "tela inicial"
      if (!pageAtSubmit || pageAtSubmit === "" || pageAtSubmit === "undefined" || pageAtSubmit === "null") {
        pageAtSubmit = "tela inicial";
      }
      
      // NORMALIZAÇÃO FINAL - GARANTIR FORMATO CORRETO
      pageAtSubmit = String(pageAtSubmit || "tela inicial").trim();
      if (pageAtSubmit === "" || pageAtSubmit === "undefined" || pageAtSubmit === "null") {
        pageAtSubmit = "tela inicial";
      }
      
      // Se for "/" (tela inicial), converter para "tela inicial"
      if (pageAtSubmit === "/" || pageAtSubmit === "/" || pageAtSubmit.trim() === "/") {
        pageAtSubmit = "tela inicial";
      }
      
      // Para outras páginas, garantir que comece com "/"
      if (pageAtSubmit !== "tela inicial" && !pageAtSubmit.startsWith("/")) {
        pageAtSubmit = "/" + pageAtSubmit;
      }
      
      // VALIDAÇÃO FINAL - NUNCA ENVIAR VAZIO
      if (!pageAtSubmit || pageAtSubmit.length === 0) {
        pageAtSubmit = "tela inicial";
      }
      
      console.log("📄 CAPTURA DE PÁGINA (ROBUSTA):", {
        windowLocation: window?.location?.pathname,
        wouterLocation: location,
        currentPageState: currentPage,
        documentLocation: typeof document !== 'undefined' ? document?.location?.pathname : 'N/A',
        finalPage: pageAtSubmit,
        pageLength: pageAtSubmit.length,
        isValid: pageAtSubmit.length > 0 && pageAtSubmit.startsWith("/")
      });
      
      const feedbackData = {
        page: pageAtSubmit, // SEMPRE TERÁ VALOR
        rating,
        message: message.trim(),
        imageUrl: imageUrl || null,
      };
      
      // VALIDAÇÃO ANTES DE ENVIAR
      if (!feedbackData.page || feedbackData.page.trim() === "") {
        console.error("❌ ERRO CRÍTICO: Página está vazia antes de enviar!");
        feedbackData.page = "/"; // Forçar "/" se ainda estiver vazio
      }
      
      console.log("💬 ENVIANDO FEEDBACK (FINAL):", { 
        page: feedbackData.page,
        pageLength: feedbackData.page.length,
        pageType: typeof feedbackData.page,
        rating: feedbackData.rating,
        messageLength: feedbackData.message.length,
        imageUrl: imageUrl ? "URL presente" : "null",
        payload: JSON.stringify(feedbackData)
      });
      
      await apiRequest("POST", "/api/feedback", feedbackData);

      toast({
        title: "✅ Obrigado!",
        description: "Seu feedback foi enviado com sucesso!",
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao enviar feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Não mostrar o botão de feedback na tela de login
  if (location === '/login' || location === '/reset-password' || location === '/forgot-password' || location?.includes('/verify')) {
    return null;
  }

  return (
    <>
      {/* Botão flutuante fixo no canto inferior direito - z-index alto quando não há modais, oculto quando há modais */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-24 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group ${
          hasModalOpen ? 'hidden' : ''
        }`}
        aria-label="Enviar feedback"
        style={{ zIndex: hasModalOpen ? 1 : 40 }}
      >
        <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Modal de feedback - seguindo padrão dos outros modais */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Fechar"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </button>
                <CardTitle className="text-lg md:text-xl font-bold flex-1 text-center">
                  💬 Sua opinião é importante!
                </CardTitle>
                <div className="w-9" /> {/* Spacer para centralizar título */}
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-4 sm:px-6 pb-6">
              <div className="space-y-6">
                {/* Rating com estrelas */}
                <div className="space-y-2">
                  <Label className="text-charcoal font-medium">
                    Como você avalia esta tela?
                  </Label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600">
                      {rating === 5 && "⭐ Excelente!"}
                      {rating === 4 && "😊 Muito bom!"}
                      {rating === 3 && "🙂 Bom!"}
                      {rating === 2 && "😐 Pode melhorar"}
                      {rating === 1 && "😔 Precisa melhorar muito"}
                    </p>
                  )}
                </div>

                {/* Textarea para mensagem */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-charcoal font-medium">
                    Conte-nos mais sobre sua experiência:
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="O que você achou? Sugestões de melhoria?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {message.length} / 500 caracteres
                  </p>
                </div>

                {/* Upload de imagem */}
                <div className="space-y-2">
                  <Label className="text-charcoal font-medium">
                    Adicionar imagem (opcional)
                  </Label>
                  {!imageUrl ? (
                    <div className="relative">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:bg-pink-50 transition-colors"
                      >
                        {isUploadingImage ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-gray-600">Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-pink-500" />
                            <span className="text-sm text-gray-600">Clique para adicionar uma imagem</span>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative rounded-lg overflow-hidden border-2 border-pink-200">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                          aria-label="Remover imagem"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0 || !message.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar Feedback
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
