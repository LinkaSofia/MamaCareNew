import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  className,
  disabled,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      // Criar Date usando timezone LOCAL ao invés de UTC
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day); // Mês é 0-indexed
    }
    return undefined;
  })

  React.useEffect(() => {
    console.log('🔄 DatePicker useEffect - value mudou:', value);
    if (value) {
      // Criar Date usando timezone LOCAL ao invés de UTC
      const [year, month, day] = value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day); // Mês é 0-indexed
      console.log('📅 Setando nova data no DatePicker (LOCAL):', newDate);
      setDate(newDate);
    } else {
      console.log('❌ Value é undefined, limpando data');
      setDate(undefined);
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      // Formatar como YYYY-MM-DD
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            "focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark",
            "hover:bg-pink-50 hover:border-pink-300",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-pink-500 flex-shrink-0" />
          <span className="truncate">
            {date ? (
              format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            ) : (
              placeholder
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-2 border-pink-200 shadow-2xl rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

