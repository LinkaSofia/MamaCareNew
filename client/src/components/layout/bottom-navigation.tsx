import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Book, Weight, FileText, ShoppingCart, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", path: "/", icon: Home, label: "Início" },
  { id: "consultations", path: "/consultations", icon: Calendar, label: "Consultas" },
  { id: "diary", path: "/diary", icon: Book, label: "Diário" },
  { id: "weight", path: "/weight-tracking", icon: Weight, label: "Peso" },
  { id: "birth-plan", path: "/birth-plan", icon: FileText, label: "Plano" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <>
      {/* Espaçador para evitar sobreposição do conteúdo */}
      <div className="h-16 sm:h-0"></div>
      
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center py-2 px-1 min-w-0 flex-1 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-lg",
                isActive 
                  ? "text-pink-600 dark:text-pink-400" 
                  : "text-gray-400 dark:text-gray-500 hover:text-pink-600 dark:hover:text-pink-400"
              )}
              onClick={() => setLocation(tab.path)}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] leading-tight text-center truncate font-medium">{tab.label}</span>
            </Button>
          );
        })}
        </div>
      </div>
    </>
  );
}
