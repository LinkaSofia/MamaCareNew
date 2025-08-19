import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, HandMetal, Activity } from "lucide-react";

export default function KickCounter() {
  const [kicks, setKicks] = useState<string[]>([]);
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: kickData, isLoading } = useQuery({
    queryKey: ["/api/kick-counts", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const recordKickMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const response = await apiRequest("POST", "/api/kick-counts", {
        pregnancyId: pregnancy!.id,
        date: now.toISOString(),
        count: 1,
        times: [now.toTimeString().slice(0, 5)],
      });
      return response.json();
    },
    onSuccess: () => {
      const now = new Date();
      setKicks(prev => [...prev, now.toTimeString().slice(0, 5)]);
      queryClient.invalidateQueries({ queryKey: ["/api/kick-counts", pregnancy?.id] });
      toast({
        title: "Chute registrado!",
        description: `Registrado às ${now.toTimeString().slice(0, 5)}`,
      });
    },
  });

  if (!user || !pregnancy) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const todayCount = (kickData?.count || 0) + kicks.length;
  const recentKicks = [...kicks].reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-baby-pink via-white to-baby-blue pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-charcoal" />
          </Button>
          <h2 className="text-xl font-bold text-charcoal" data-testid="text-page-title">Contador de Chutes</h2>
          <div className="w-10" />
        </div>

        <div className="text-center mb-8">
          <Card className="w-40 h-40 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center mb-4 animate-pulse-slow">
            <CardContent className="p-0">
              <div className="text-center">
                <div className="text-4xl font-bold text-baby-pink-dark" data-testid="text-kick-count">
                  {todayCount}
                </div>
                <div className="text-sm text-gray-600">chutes hoje</div>
              </div>
            </CardContent>
          </Card>
          <p className="text-gray-600" data-testid="text-kick-instruction">
            Toque no botão quando sentir um chute!
          </p>
        </div>

        <div className="px-6 mb-8">
          <Button 
            className="w-full py-4 text-lg font-bold rounded-2xl shadow-xl transform active:scale-95 transition-all bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
            onClick={() => recordKickMutation.mutate()}
            disabled={recordKickMutation.isPending}
            data-testid="button-record-kick"
          >
            {recordKickMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <HandMetal className="mr-2 h-6 w-6" />
            )}
            Registrar Chute
          </Button>
        </div>

        {/* Recent kicks timeline */}
        {recentKicks.length > 0 && (
          <div className="px-4">
            <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Chutes Recentes
            </h3>
            <div className="space-y-3">
              {recentKicks.map((time, index) => (
                <Card key={index} className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-baby-pink-dark rounded-full mr-3" />
                        <span className="text-sm text-gray-600" data-testid={`text-kick-time-${index}`}>
                          {time}
                        </span>
                      </div>
                      <span className="text-sm text-baby-blue-dark font-medium">
                        Forte
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
