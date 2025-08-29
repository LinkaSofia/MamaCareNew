import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export interface TrackingConfig {
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackTime?: boolean;
  sessionId?: string;
}

export function useUserTracking(config: TrackingConfig = {}) {
  const { user } = useAuth();
  const {
    trackPageViews = true,
    trackClicks = true,
    trackTime = true
  } = config;

  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>(window.location.pathname);
  const sessionId = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Rastrear visita de página
  const trackPageVisit = useCallback(async (page: string, duration?: number) => {
    if (!user?.id || !trackPageViews) return;
    
    try {
      await apiRequest("POST", `/api/analytics/page-visit`, {
        page,
        duration: duration || 0
      });
    } catch (error) {
      console.log("Tracking falhou:", error);
    }
  }, [user?.id, trackPageViews]);

  // Rastrear ação do usuário
  const trackAction = useCallback(async (action: string, element?: string) => {
    if (!user?.id || !trackClicks) return;
    
    try {
      await apiRequest("POST", `/api/analytics/action`, {
        action,
        page: window.location.pathname,
        element
      });
    } catch (error) {
      console.log("Tracking de ação falhou:", error);
    }
  }, [user?.id, trackClicks]);

  // Configurar listeners automáticos
  useEffect(() => {
    if (!user?.id) return;

    const startTime = Date.now();
    pageStartTime.current = startTime;
    currentPage.current = window.location.pathname;

    // Rastrear entrada na página
    trackPageVisit(window.location.pathname);

    // Listener para mudanças de página
    const handlePopState = () => {
      if (trackTime) {
        const duration = Date.now() - pageStartTime.current;
        trackPageVisit(currentPage.current, duration);
      }
      
      pageStartTime.current = Date.now();
      currentPage.current = window.location.pathname;
      trackPageVisit(window.location.pathname);
    };

    // Listener para cliques (tracking automático)
    const handleClick = (event: MouseEvent) => {
      if (!trackClicks) return;
      
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || target.tagName;
      const action = target.tagName === 'BUTTON' ? 'button_click' : 
                    target.tagName === 'A' ? 'link_click' : 'click';
      
      trackAction(action, elementId);
    };

    // Rastrear quando o usuário sai da página
    const handleBeforeUnload = () => {
      if (trackTime) {
        const duration = Date.now() - pageStartTime.current;
        trackPageVisit(currentPage.current, duration);
      }
    };

    // Rastrear quando a janela perde/ganha foco
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && trackTime) {
        const duration = Date.now() - pageStartTime.current;
        trackPageVisit(currentPage.current, duration);
      } else if (document.visibilityState === 'visible') {
        pageStartTime.current = Date.now();
      }
    };

    // Adicionar listeners
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup e rastrear tempo final na página
      if (trackTime) {
        const duration = Date.now() - pageStartTime.current;
        trackPageVisit(currentPage.current, duration);
      }
      
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, trackPageVisit, trackAction, trackTime, trackClicks]);

  return {
    trackPageVisit,
    trackAction,
    sessionId: sessionId.current
  };
}