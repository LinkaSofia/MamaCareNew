import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function BabyDevelopmentAdmin() {
  const [isAddingField, setIsAddingField] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const { toast } = useToast();

  const handleAddField = async () => {
    setIsAddingField(true);
    try {
      const response = await fetch('/api/baby-development/add-image-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Add field result:', result);
      
      if (response.ok) {
        toast({
          title: "Campo adicionado!",
          description: "Campo fruit_image_url foi adicionado à tabela baby_development",
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao adicionar campo:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar campo: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingField(false);
    }
  };

  const handleAddImageWeek1 = async () => {
    setIsAddingImage(true);
    try {
      const response = await fetch('/api/baby-development/set-week1-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Add image result:', result);
      
      if (response.ok) {
        toast({
          title: "Imagem inserida!",
          description: `Imagem do grão de areia foi inserida para semana 1: ${result.imageUrl}`,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao inserir imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao inserir imagem: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingImage(false);
    }
  };

  const checkWeek1Data = async () => {
    try {
      const response = await fetch('/api/baby-development/week1-check');
      const result = await response.json();
      console.log('Week 1 data:', result);
      
      if (response.ok && result.success) {
        toast({
          title: "Dados da Semana 1",
          description: `Comparação: ${result.data.fruit_comparison}, Imagem: ${result.data.fruit_image_url || 'Não definida'}`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao verificar dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar dados: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Administração - Desenvolvimento do Bebê</h1>
        <p className="text-gray-600 mt-2">Gerenciar imagens das semanas de desenvolvimento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Campo</CardTitle>
            <CardDescription>Adiciona o campo fruit_image_url na tabela</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAddField}
              disabled={isAddingField}
              className="w-full"
            >
              {isAddingField ? 'Adicionando...' : 'Adicionar Campo fruit_image_url'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semana 1 - Grão de Areia</CardTitle>
            <CardDescription>Inserir imagem do grão de areia para semana 1</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAddImageWeek1}
              disabled={isAddingImage}
              className="w-full mb-2"
            >
              {isAddingImage ? 'Inserindo...' : 'Inserir Imagem Semana 1'}
            </Button>
            <Button 
              onClick={checkWeek1Data}
              variant="outline"
              className="w-full"
            >
              Verificar Dados Semana 1
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Informações sobre o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>
                <strong>Imagem Semana 1:</strong><br />
                @assets/image_1756824586979.png
              </div>
              <div>
                <strong>Comparação:</strong><br />
                Grão de areia
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}