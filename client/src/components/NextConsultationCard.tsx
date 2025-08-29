import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // Temporarily comment out if component doesn't exist
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NextConsultationCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/consultations/next/user'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="w-5 h-5" />
            Próxima Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded mb-2"></div>
            <div className="h-3 bg-blue-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const consultation = data?.nextConsultation;

  if (!consultation) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5" />
            Próxima Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Nenhuma consulta agendada
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Agende sua próxima consulta na aba Consultas
          </p>
        </CardContent>
      </Card>
    );
  }

  const consultationDate = new Date(consultation.date);
  const daysUntil = differenceInDays(consultationDate, new Date());
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  let timeText = "";
  if (isToday) {
    timeText = "Hoje";
  } else if (isTomorrow) {
    timeText = "Amanhã";
  } else if (daysUntil > 0) {
    timeText = `Em ${daysUntil} dias`;
  } else {
    timeText = "Vencida";
  }

  const badgeVariant = isToday ? "destructive" : isTomorrow ? "default" : "secondary";

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="w-5 h-5" />
            Próxima Consulta
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isToday ? "bg-red-100 text-red-800" : 
            isTomorrow ? "bg-blue-100 text-blue-800" : 
            "bg-gray-100 text-gray-800"
          }`}>
            {timeText}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">
            {consultation.title}
          </h4>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(consultationDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>

        {consultation.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {consultation.location}
          </div>
        )}

        {consultation.doctorName && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <User className="w-4 h-4" />
            Dr(a). {consultation.doctorName}
          </div>
        )}

        {consultation.notes && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-700">{consultation.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}