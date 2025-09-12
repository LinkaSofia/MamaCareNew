import { Play, Clock, Heart } from "lucide-react";

interface VideoSectionProps {
  videos: Array<{
    id: string;
    title: string;
    description?: string;
    video_url?: string;
    type: string;
  }>;
  isLoading?: boolean;
  currentWeek: number;
}

export function VideoSection({ videos, isLoading, currentWeek }: VideoSectionProps) {
  const videoContent = videos?.filter(item => item.type === 'video' && item.video_url) || [];

  if (isLoading) {
    return (
      <div className="mx-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="aspect-video bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoContent.length) {
    return null;
  }

  const featuredVideo = videoContent[0];

  return (
    <div className="mx-4 mb-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Vídeo da Semana {currentWeek}
              </h3>
              <p className="text-sm text-gray-600">Conteúdo especial para você</p>
            </div>
          </div>
        </div>

        {/* Video Content */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
            {/* Video iframe */}
            <div className="aspect-video relative">
              <iframe
                src={featuredVideo.video_url}
                title={featuredVideo.title}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full rounded-t-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            
            {/* Video Info */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                {featuredVideo.title}
              </h4>
              {featuredVideo.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {featuredVideo.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Ideal para esta semana</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Conteúdo verificado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Videos */}
          {videoContent.length > 1 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Outros vídeos desta semana
              </h5>
              <div className="space-y-2">
                {videoContent.slice(1).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {video.title}
                      </p>
                      {video.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}