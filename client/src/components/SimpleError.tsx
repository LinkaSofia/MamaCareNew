import { AlertCircle } from "lucide-react";

interface SimpleErrorProps {
  message: string;
  className?: string;
}

export function SimpleError({ message, className = "" }: SimpleErrorProps) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-sm text-red-700">{message}</span>
    </div>
  );
}

