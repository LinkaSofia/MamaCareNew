import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, Activity, Weight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const quickActions = [
    { 
      icon: Activity, 
      label: "Chute Rápido", 
      color: "bg-baby-pink-dark", 
      action: () => setLocation("/kick-counter") 
    },
    { 
      icon: Weight, 
      label: "Peso", 
      color: "bg-baby-blue-dark", 
      action: () => setLocation("/weight-tracking") 
    },
    { 
      icon: Camera, 
      label: "Foto", 
      color: "bg-coral", 
      action: () => setLocation("/photo-album") 
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className="relative">
        {/* Main FAB */}
        <Button
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl text-white transform transition-all duration-300",
            "bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:scale-110",
            isOpen && "rotate-45"
          )}
          onClick={toggleMenu}
          data-testid="button-fab-main"
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        {/* Quick action buttons */}
        <div
          className={cn(
            "absolute bottom-16 right-0 space-y-2 transition-all duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg text-white transform transition-all duration-300",
                  action.color,
                  isOpen ? "scale-100" : "scale-0"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : `${(quickActions.length - index - 1) * 50}ms`
                }}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                data-testid={`button-quick-${action.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
