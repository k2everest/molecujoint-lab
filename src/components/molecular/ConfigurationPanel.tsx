import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Zap, 
  Target, 
  Atom, 
  FlaskConical, 
  BarChart3,
  Save,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationConfig {
  // Propriedades físico-químicas
  targetMolecularWeight: [number, number];
  targetLogP: [number, number];
  targetHBD: number;
  targetHBA: number;
  targetRotatableBonds: number;
  targetPSA: [number, number];
  
  // Drug-likeness
  enforceRuleOfFive: boolean;
  enforceVeberRule: boolean;
  avoidPAINS: boolean;
  
  // Otimização específica
  optimizationTarget: 'binding_affinity' | 'selectivity' | 'admet' | 'multi_objective';
  optimizationMethod: 'genetic_algorithm' | 'simulated_annealing' | 'bayesian' | 'gradient_descent';
  maxIterations: number;
  convergenceThreshold: number;
  
  // Restrições estruturais
  preserveScaffold: boolean;
  allowRingFormation: boolean;
  allowRingBreaking: boolean;
  maxHeavyAtoms: number;
  
  // Síntese
  synthesisComplexity: 'low' | 'medium' | 'high';
  availableReagents: string[];
}

export const ConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [config, setConfig] = useState<OptimizationConfig>({
    // Propriedades físico-químicas (Lipinski)
    targetMolecularWeight: [150, 500],
    targetLogP: [0, 5],
    targetHBD: 5,
    targetHBA: 10,
    targetRotatableBonds: 10,
    targetPSA: [20, 140],
    
    // Drug-likeness
    enforceRuleOfFive: true,
    enforceVeberRule: true,
    avoidPAINS: true,
    
    // Otimização
    optimizationTarget: 'binding_affinity',
    optimizationMethod: 'genetic_algorithm',
    maxIterations: 1000,
    convergenceThreshold: 0.001,
    
    // Restrições estruturais
    preserveScaffold: true,
    allowRingFormation: true,
    allowRingBreaking: false,
    maxHeavyAtoms: 50,
    
    // Síntese
    synthesisComplexity: 'medium',
    availableReagents: ['common_reagents', 'organometallic', 'protecting_groups']
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const handleStartOptimization = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    toast.success('Iniciando otimização molecular...', {
      description: `Método: ${config.optimizationMethod}, Alvo: ${config.optimizationTarget}`
    });

    // Simulate optimization progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          toast.success('Otimização concluída! 🎯', {
            description: 'Moléculas otimizadas geradas com sucesso'
          });
          return 100;
        }
        return prev + Math.random() * 5 + 1;
      });
    }, 300);
  };

  const handleSaveConfig = () => {
    toast.success('Configuração salva!', {
      description: 'Parâmetros de otimização salvos como padrão'
    });
  };

  const handleResetConfig = () => {
    // Reset to default values
    setConfig({
      targetMolecularWeight: [150, 500],
      targetLogP: [0, 5],
      targetHBD: 5,
      targetHBA: 10,
      targetRotatableBonds: 10,
      targetPSA: [20, 140],
      enforceRuleOfFive: true,
      enforceVeberRule: true,
      avoidPAINS: true,
      optimizationTarget: 'binding_affinity',
      optimizationMethod: 'genetic_algorithm',
      maxIterations: 1000,
      convergenceThreshold: 0.001,
      preserveScaffold: true,
      allowRingFormation: true,
      allowRingBreaking: false,
      maxHeavyAtoms: 50,
      synthesisComplexity: 'medium',
      availableReagents: ['common_reagents', 'organometallic', 'protecting_groups']
    });
    
    toast.info('Configuração resetada para valores padrão');
  };

  const updateConfig = (key: keyof OptimizationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-primary" />
          Configuração de Otimização
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8 text-xs">
            <TabsTrigger value="properties" className="text-xs">Propriedades</TabsTrigger>
            <TabsTrigger value="optimization" className="text-xs">Otimização</TabsTrigger>
            <TabsTrigger value="constraints" className="text-xs">Restrições</TabsTrigger>
            <TabsTrigger value="synthesis" className="text-xs">Síntese</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Atom className="w-4 h-4" />
                  Peso Molecular (Da)
                </Label>
                <div className="px-2">
                  <Slider
                    value={config.targetMolecularWeight}
                    onValueChange={(value) => updateConfig('targetMolecularWeight', value)}
                    min={100}
                    max={800}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{config.targetMolecularWeight[0]}</span>
                    <span>{config.targetMolecularWeight[1]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">LogP (Lipofilia)</Label>
                <div className="px-2">
                  <Slider
                    value={config.targetLogP}
                    onValueChange={(value) => updateConfig('targetLogP', value)}
                    min={-2}
                    max={8}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{config.targetLogP[0]}</span>
                    <span>{config.targetLogP[1]}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">H-Bond Donors</Label>
                  <Input
                    type="number"
                    value={config.targetHBD}
                    onChange={(e) => updateConfig('targetHBD', parseInt(e.target.value))}
                    className="h-8 text-sm"
                    min={0}
                    max={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">H-Bond Acceptors</Label>
                  <Input
                    type="number"
                    value={config.targetHBA}
                    onChange={(e) => updateConfig('targetHBA', parseInt(e.target.value))}
                    className="h-8 text-sm"
                    min={0}
                    max={15}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Área de Superfície Polar (Ų)</Label>
                <div className="px-2">
                  <Slider
                    value={config.targetPSA}
                    onValueChange={(value) => updateConfig('targetPSA', value)}
                    min={0}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{config.targetPSA[0]}</span>
                    <span>{config.targetPSA[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Drug-likeness Rules</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Regra de Lipinski</Label>
                  <Switch
                    checked={config.enforceRuleOfFive}
                    onCheckedChange={(checked) => updateConfig('enforceRuleOfFive', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Regra de Veber</Label>
                  <Switch
                    checked={config.enforceVeberRule}
                    onCheckedChange={(checked) => updateConfig('enforceVeberRule', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Evitar PAINS</Label>
                  <Switch
                    checked={config.avoidPAINS}
                    onCheckedChange={(checked) => updateConfig('avoidPAINS', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Alvo de Otimização
                </Label>
                <Select 
                  value={config.optimizationTarget} 
                  onValueChange={(value: any) => updateConfig('optimizationTarget', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binding_affinity">Afinidade de Ligação</SelectItem>
                    <SelectItem value="selectivity">Seletividade</SelectItem>
                    <SelectItem value="admet">Propriedades ADMET</SelectItem>
                    <SelectItem value="multi_objective">Multi-objetivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Método de Otimização</Label>
                <Select 
                  value={config.optimizationMethod} 
                  onValueChange={(value: any) => updateConfig('optimizationMethod', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genetic_algorithm">Algoritmo Genético</SelectItem>
                    <SelectItem value="simulated_annealing">Simulated Annealing</SelectItem>
                    <SelectItem value="bayesian">Otimização Bayesiana</SelectItem>
                    <SelectItem value="gradient_descent">Gradient Descent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Max Iterações</Label>
                  <Input
                    type="number"
                    value={config.maxIterations}
                    onChange={(e) => updateConfig('maxIterations', parseInt(e.target.value))}
                    className="h-8 text-sm"
                    min={100}
                    max={10000}
                    step={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Convergência</Label>
                  <Input
                    type="number"
                    value={config.convergenceThreshold}
                    onChange={(e) => updateConfig('convergenceThreshold', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                    min={0.0001}
                    max={0.1}
                    step={0.0001}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>Progresso da Otimização</Label>
                <span className="text-muted-foreground">{Math.round(optimizationProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${optimizationProgress}%` }}
                />
              </div>
            </div>

            <Button 
              onClick={handleStartOptimization} 
              className="w-full h-8 text-sm"
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <BarChart3 className="w-4 h-4 mr-2 animate-pulse" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Iniciar Otimização
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="constraints" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Restrições Estruturais</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Preservar Scaffold</Label>
                  <Switch
                    checked={config.preserveScaffold}
                    onCheckedChange={(checked) => updateConfig('preserveScaffold', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Permitir Formação de Anéis</Label>
                  <Switch
                    checked={config.allowRingFormation}
                    onCheckedChange={(checked) => updateConfig('allowRingFormation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Permitir Quebra de Anéis</Label>
                  <Switch
                    checked={config.allowRingBreaking}
                    onCheckedChange={(checked) => updateConfig('allowRingBreaking', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Máximo de Átomos Pesados</Label>
                <Input
                  type="number"
                  value={config.maxHeavyAtoms}
                  onChange={(e) => updateConfig('maxHeavyAtoms', parseInt(e.target.value))}
                  className="h-8 text-sm"
                  min={10}
                  max={100}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros de Qualidade</Label>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-center text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Drug-like
                </Badge>
                <Badge variant="outline" className="justify-center text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Synthesizable
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synthesis" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Complexidade de Síntese
                </Label>
                <Select 
                  value={config.synthesisComplexity} 
                  onValueChange={(value: any) => updateConfig('synthesisComplexity', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa (1-3 passos)</SelectItem>
                    <SelectItem value="medium">Média (4-7 passos)</SelectItem>
                    <SelectItem value="high">Alta (8+ passos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Reagentes Disponíveis</Label>
                <div className="space-y-1">
                  {['common_reagents', 'organometallic', 'protecting_groups', 'chiral_auxiliaries'].map((reagent) => (
                    <div key={reagent} className="flex items-center justify-between">
                      <Label className="text-xs capitalize">
                        {reagent.replace('_', ' ')}
                      </Label>
                      <Switch
                        checked={config.availableReagents.includes(reagent)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateConfig('availableReagents', [...config.availableReagents, reagent]);
                          } else {
                            updateConfig('availableReagents', config.availableReagents.filter(r => r !== reagent));
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Estimativas de Síntese</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">4-6</div>
                  <div className="text-muted-foreground">Passos</div>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">Médio</div>
                  <div className="text-muted-foreground">Custo</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex gap-2">
          <Button onClick={handleSaveConfig} variant="outline" size="sm" className="flex-1 h-8 text-xs">
            <Save className="w-3 h-3 mr-1" />
            Salvar
          </Button>
          <Button onClick={handleResetConfig} variant="outline" size="sm" className="flex-1 h-8 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

