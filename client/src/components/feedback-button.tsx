import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Star } from "lucide-react";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState("/");
  const [location] = useLocation();
  const { toast } = useToast();

  // Capturar página atual quando abrir o modal
  const handleOpen = () => {
    const pagePath = window.location.pathname || location || "/";
    setCurrentPage(pagePath);
    setIsOpen(true);
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
      await apiRequest("POST", "/api/feedback", {
        page: currentPage,
        rating,
        message: message.trim(),
      });

      toast({
        title: "✅ Obrigado!",
        description: "Seu feedback foi enviado com sucesso!",
      });

      // Reset form
      setRating(0);
      setMessage("");
      setIsOpen(false);
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

  return (
    <>
      {/* Botão flutuante fixo no canto inferior direito */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
        aria-label="Enviar feedback"
      >
        <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          !
        </span>
      </button>

      {/* Dialog de feedback */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💬 Sua opinião é importante!
            </DialogTitle>
            <DialogDescription>
              Ajude-nos a melhorar o MamaCare compartilhando sua experiência
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating com estrelas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Como você avalia esta tela?
              </label>
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
              <label className="text-sm font-medium text-gray-700">
                Conte-nos mais sobre sua experiência:
              </label>
              <Textarea
                placeholder="O que você achou? Sugestões de melhoria?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {message.length} / 500 caracteres
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

