import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Zap, RotateCcw, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalculationProgress {
  id: string;
  type: 'optimization' | 'simulation' | 'calculation';
  title: string;
  progress: number;
  status: 'running' | 'completed' | 'error';
  details?: string;
  estimatedTime?: number;
}

interface MolecularProgressBarProps {
  className?: string;
}

export const MolecularProgressBar: React.FC<MolecularProgressBarProps> = ({ className }) => {
  const [calculations, setCalculations] = useState<CalculationProgress[]>([]);

  // Simulated calculation progress
  useEffect(() => {
    const demoCalculation: CalculationProgress = {
      id: '1',
      type: 'optimization',
      title: 'Otimização Geométrica',
      progress: 0,
      status: 'running',
      details: 'Iteração 1 de 100',
      estimatedTime: 30
    };

    setCalculations([demoCalculation]);

    // Simulate progress
    const interval = setInterval(() => {
      setCalculations(prev => prev.map(calc => {
        if (calc.status === 'running' && calc.progress < 100) {
          const newProgress = Math.min(calc.progress + Math.random() * 10, 100);
          const iteration = Math.floor((newProgress / 100) * 100);
          return {
            ...calc,
            progress: newProgress,
            details: `Iteração ${iteration} de 100`,
            status: newProgress >= 100 ? 'completed' : 'running'
          };
        }
        return calc;
      }));
    }, 500);

    // Auto-remove completed calculations after 3 seconds
    const cleanupTimer = setTimeout(() => {
      setCalculations(prev => prev.filter(calc => calc.status !== 'completed'));
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(cleanupTimer);
    };
  }, []);

  const removeCalculation = (id: string) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id));
  };

  const getIcon = (type: CalculationProgress['type']) => {
    switch (type) {
      case 'optimization':
        return <RotateCcw className="w-4 h-4 text-green-500" />;
      case 'simulation':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'calculation':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Zap className="w-4 h-4 text-purple-500" />;
    }
  };

  const getStatusColor = (status: CalculationProgress['status']) => {
    switch (status) {
      case 'running':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'completed':
        return 'border-l-green-500 bg-green-50/50';
      case 'error':
        return 'border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  const getProgressColor = (status: CalculationProgress['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (calculations.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 space-y-2 max-w-sm", className)}>
      {calculations.map((calculation) => (
        <Card 
          key={calculation.id}
          className={cn(
            "border-l-4 shadow-lg animate-slide-in-right",
            getStatusColor(calculation.status)
          )}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(calculation.type)}
                  <h4 className="text-sm font-semibold text-card-foreground">
                    {calculation.title}
                  </h4>
                  <Badge 
                    variant={calculation.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {calculation.status === 'running' ? 'Executando' : 
                     calculation.status === 'completed' ? 'Concluído' : 'Erro'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCalculation(calculation.id)}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{calculation.details}</span>
                  <span>{Math.round(calculation.progress)}%</span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={calculation.progress} 
                    className="h-2"
                  />
                  {calculation.status === 'running' && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      style={{ width: '30%' }}
                    />
                  )}
                </div>

                {calculation.estimatedTime && calculation.status === 'running' && (
                  <div className="text-xs text-muted-foreground">
                    Tempo estimado: {Math.round(calculation.estimatedTime * (1 - calculation.progress / 100))}s
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

