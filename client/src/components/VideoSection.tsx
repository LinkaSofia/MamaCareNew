import { Play, Clock, Heart } from "lucide-react";

interface VideoSectionProps {
  videos: Array<{
    id: string;
    title: string;
    description?: string | null;
    video_url?: string | null;
    type?: string;
  }>;
  isLoading?: boolean;
  currentWeek: number;
}

export function VideoSection({ videos, isLoading, currentWeek }: VideoSectionProps) {
  // Remover completamente a renderização da seção de vídeo
  return null;
}