import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, Target, BookOpen, Zap } from 'lucide-react';

interface ComparisonItem {
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export const ComparisonPanel: React.FC = () => {
  const comparisons: ComparisonItem[] = [
    {
      title: "PubMed Search",
      description: "Busca geral de artigos científicos",
      features: [
        "Busca aberta por palavras-chave",
        "Extrai moléculas de qualquer artigo",
        "Filtra artigos com moléculas",
        "Visualização rápida de resultados",
        "Carregamento direto no visualizador 3D"
      ],
      icon: BookOpen
    },
    {
      title: "Análise de Doenças",
      description: "Análise especializada focada em doenças",
      features: [
        "Busca específica por doença",
        "Identifica alvos terapêuticos",
        "Sugere mecanismos de tratamento",
        "Gera relatório estruturado",
        "Propõe moléculas candidatas a fármacos",
        "Exporta análise completa"
      ],
      icon: Brain
    }
  ];

  return (
    <Card className="w-full bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Diferenças entre as Funcionalidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {comparisons.map((item, index) => (
            <Card key={index} className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-primary" />
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <Zap className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Resumo das Diferenças:</h4>
          <div className="text-sm space-y-1">
            <p><strong>PubMed:</strong> Para busca rápida e extração de moléculas de artigos gerais</p>
            <p><strong>Análise de Doenças:</strong> Para análise aprofundada com foco terapêutico e relatórios estruturados</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};