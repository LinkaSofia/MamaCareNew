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
          <div className="container mx-auto px-4 py-4">
            {/* Header com botão voltar e título */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
                  onClick={() => viewMode === 'list' ? window.history.back() : setViewMode('list')}
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Planos de Parto
                  </h1>
                  <p className="text-sm text-gray-600">Gerencie seus planos de parto</p>
                </div>
              </div>
              
              {viewMode === 'list' && (
                <Button
                  onClick={() => setViewMode('create')}
                  className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-create-plan"
                >
                  <Plus className="w-5 h-5 text-white" />
                </Button>
              )}
            </div>

          {/* Lista de planos */}
          {viewMode === 'list' && (
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
          )}

          {/* Formulário de criação/edição */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {viewMode === 'create' ? 'Criar Plano de Parto' : 'Editar Plano de Parto'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-pink-400 mb-4 mx-auto" />
                    <p className="text-gray-600">
                      Formulário de plano de parto em construção
                    </p>
                    <Button
                      onClick={() => setViewMode('list')}
                      className="mt-6 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 shadow-xl rounded-full px-6 py-2"
                    >
                      Voltar para Lista
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}
