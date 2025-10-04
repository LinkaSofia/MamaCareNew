import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Download, Eye } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import BottomNavigation from '@/components/layout/bottom-navigation';

export default function BirthPlan() {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');

    return (
      <AnimatedBackground>
      <div className="min-h-screen pb-20">
          <div className="container mx-auto px-4 py-6">
            {/* Botão de Voltar */}
            <Button
              variant="ghost"
              size="icon"
            className="fixed top-4 left-4 z-50 bg-white/95 backdrop-blur-sm shadow-xl rounded-full hover:bg-gray-100 border border-white/20"
            onClick={() => window.history.back()}
              data-testid="button-back"
            >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            
            {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-12">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 drop-shadow-lg">Planos de Parto</h1>
                <p className="text-gray-600">Gerencie seus planos de parto</p>
            </div>
            <Button
              onClick={() => setViewMode('create')}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 shadow-xl border border-white/20 rounded-full px-6 py-2"
              data-testid="button-create-plan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>

          {/* Lista de planos */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-pink-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum plano de parto encontrado
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Crie seu primeiro plano de parto para se preparar para o nascimento do seu bebê.
                  </p>
                  <Button
                  onClick={() => setViewMode('create')}
                  className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 shadow-xl border border-white/20 rounded-full px-6 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                </CardContent>
              </Card>
          </div>
        </div>
        <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}
