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
  { id: "shopping", path: "/shopping-list", icon: ShoppingCart, label: "Compras" },
  { id: "guide", path: "/guide", icon: BookOpen, label: "Guia" },
  { id: "progress", path: "/progress", icon: TrendingUp, label: "Progresso" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex justify-center w-full px-4">
      <div className="bg-white dark:bg-gray-900 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center py-1.5 px-2 min-w-[55px] transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-lg flex-shrink-0",
                  isActive 
                    ? "text-pink-600 dark:text-pink-400" 
                    : "text-gray-400 dark:text-gray-500 hover:text-pink-600 dark:hover:text-pink-400"
                )}
                onClick={() => setLocation(tab.path)}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-[9px] leading-tight text-center">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
