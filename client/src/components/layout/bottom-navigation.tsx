import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Baby, Users, User, Book, Activity, Weight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", path: "/", icon: Home, label: "Início" },
  { id: "kick-counter", path: "/kick-counter", icon: Activity, label: "Chutes" },
  { id: "progress", path: "/progress", icon: TrendingUp, label: "Progresso" },
  { id: "diary", path: "/diary", icon: Book, label: "Diário" },
  { id: "profile", path: "/profile", icon: User, label: "Perfil" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-[100] shadow-lg backdrop-blur-sm isolation-isolate">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center py-2 px-4 transition-colors",
                isActive 
                  ? "text-baby-pink-dark" 
                  : "text-gray-400 hover:text-baby-pink-dark"
              )}
              onClick={() => setLocation(tab.path)}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
