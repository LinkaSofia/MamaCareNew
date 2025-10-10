import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export function DateInput({ value, onChange, className, placeholder, required, id }: DateInputProps) {
  return (
    <div className="relative">
      <Input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark",
          "pr-10 cursor-pointer",
          "text-gray-700 font-medium",
          "[color-scheme:light]", // Força tema claro no calendário
          "appearance-none",
          className
        )}
        placeholder={placeholder}
        required={required}
        style={{
          colorScheme: "light",
        }}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400 pointer-events-none" />
    </div>
  );
}

