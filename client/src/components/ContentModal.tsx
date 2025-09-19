import { X, ExternalLink, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  source: string;
  videoUrl?: string;
  type: 'video' | 'pdf';
  description?: string;
}

export function ContentModal({ 
  isOpen, 
  onClose, 
  title, 
  source, 
  videoUrl, 
  type, 
  description 
}: ContentModalProps) {
  const getVideoEmbedUrl = (url: string) => {
    // Converter URL do YouTube para embed
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 pr-4">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {source}
          </p>
        </DialogHeader>
        
        <div className="flex-1 p-6">
          {type === 'video' && videoUrl ? (
            <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
              {/* Iframe do vídeo */}
              <iframe
                src={getVideoEmbedUrl(videoUrl)}
                title={title}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Botão para abrir no YouTube */}
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={() => window.open(videoUrl, '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Assistir no YouTube
                </Button>
              </div>
            </div>
          ) : type === 'pdf' ? (
            <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
              {/* Iframe do PDF */}
              <iframe
                src={videoUrl}
                title={title}
                className="w-full h-full rounded-lg"
                frameBorder="0"
              />
              
              {/* Botão para abrir PDF externamente */}
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={() => window.open(videoUrl, '_blank')}
                  className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir PDF
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
