import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useMolecularStore } from '../../store/molecularStore';
import { Settings, Play, Pause, RotateCcw, Zap, Target, Atom } from 'lucide-react';
import { toast } from 'sonner';

export const MolecularOptimizer: React.FC = () => {
  const { 
    molecules, 
    activeMoleculeId, 
    optimizeGeometry, 
    calculateMoleculeProperties, 
    calculateAdvancedPhysics 
  } = useMolecularStore();
  
  const [optimizationSteps, setOptimizationSteps] = useState([500]);
  const [temperature, setTemperature] = useState([300]);
  const [convergence, setConvergence] = useState([0.001]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [initialEnergy, setInitialEnergy] = useState<number | null>(null);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  const handleOptimization = async () => {
    if (!activeMolecule) {
      toast.error('Nenhuma molécula selecionada');
      return;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);
    setInitialEnergy(activeMolecule.energy || null);
    
    try {
      // Simular progresso da otimização
      const progressSteps = [
        { step: 'Calculando propriedades iniciais...', progress: 20 },
        { step: 'Otimizando geometria...', progress: 60 },
        { step: 'Calculando física avançada...', progress: 90 },
        { step: 'Finalizando...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setOptimizationProgress(progress);
        
        if (progress === 20) {
          calculateMoleculeProperties(activeMolecule.id);
        } else if (progress === 60) {
          optimizeGeometry(activeMolecule.id);
        } else if (progress === 90) {
          calculateAdvancedPhysics(activeMolecule.id);
        }
        
        // Pequeno delay para mostrar o progresso
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success('Otimização concluída! 🧬', {
        description: `Geometria da ${activeMolecule.name} otimizada com sucesso`
      });
    } catch (error) {
      toast.error('Erro na otimização', {
        description: 'Não foi possível otimizar a molécula'
      });
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  if (!activeMolecule) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Atom className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Selecione uma molécula para otimizar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md molecular-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Otimizador Molecular
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeMolecule.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {activeMolecule.atoms.length} átomos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parâmetros de Otimização */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Passos de Otimização: {optimizationSteps[0]}
            </label>
            <Slider
              value={optimizationSteps}
              onValueChange={setOptimizationSteps}
              min={100}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Temperatura: {temperature[0]} K
            </label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              min={0}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Critério de Convergência: {convergence[0]}
            </label>
            <Slider
              value={convergence}
              onValueChange={setConvergence}
              min={0.0001}
              max={0.01}
              step={0.0001}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Propriedades Atuais */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Propriedades Atuais
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Energia:</span>
              <span className="font-mono">
                {activeMolecule.energy?.toFixed(2) || '--'} kcal/mol
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dipolo:</span>
              <span className="font-mono">
                {activeMolecule.dipoleMoment?.toFixed(3) || '--'} D
              </span>
            </div>
            {initialEnergy && activeMolecule.energy && (
              <div className="flex justify-between col-span-2 pt-1 border-t">
                <span>Melhoria:</span>
                <span className={`font-mono text-xs ${activeMolecule.energy < initialEnergy ? 'text-green-400' : 'text-yellow-400'}`}>
                  {((initialEnergy - activeMolecule.energy) / initialEnergy * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progresso da Otimização */}
        {isOptimizing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progresso:</span>
              <span>{optimizationProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button 
            onClick={handleOptimization}
            disabled={isOptimizing}
            className="flex-1 gap-2"
            variant={isOptimizing ? "secondary" : "default"}
          >
            {isOptimizing ? (
              <>
                <Pause className="w-4 h-4" />
                Otimizando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Otimizar
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              calculateMoleculeProperties(activeMolecule.id);
              toast.success('Propriedades recalculadas');
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};