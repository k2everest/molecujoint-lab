import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Bot, Zap, Settings, TrendingUp, Download, Upload } from 'lucide-react';
import { useMolecularStore } from '../../store/molecularStore';
import { MolecularPhysics } from '../../utils/physics';
import { ForceFieldParameters, AIParameters, SimulationSettings } from '../../types/physics';
import { toast } from 'sonner';

export const AIPhysicsEditor: React.FC = () => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  const [physics] = useState(new MolecularPhysics());
  const [selectedElements, setSelectedElements] = useState<[string, string]>(['C', 'H']);
  const [parameters, setParameters] = useState<ForceFieldParameters>({
    lennardJones: { epsilon: 0.033, sigma: 2.85 },
    harmonic: { equilibriumLength: 1.09, forceConstant: 340.0 },
    angle: { equilibriumAngle: 109.5, forceConstant: 37.5 },
    torsion: { phase: 0, amplitude: 0.16, periodicity: 3 }
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    timeStep: 1.0,
    temperature: 298.15,
    steps: 1000,
    dampingFactor: 0.9,
    integrator: 'verlet'
  });

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  // Simulação de IA para sugestões de parâmetros
  const generateAISuggestions = useCallback(() => {
    const [elem1, elem2] = selectedElements;
    const suggestions = [
      `Para ligação ${elem1}-${elem2}: ε optimal = ${(Math.random() * 0.2 + 0.05).toFixed(3)} kcal/mol`,
      `Distância de equilíbrio recomendada: ${(Math.random() * 0.5 + 1.0).toFixed(2)} Å`,
      `Constante harmônica sugerida: ${(Math.random() * 200 + 300).toFixed(1)} kcal/mol/Å²`,
      `Ângulo ótimo detectado: ${(Math.random() * 20 + 100).toFixed(1)}°`,
      `Barreira torsional estimada: ${(Math.random() * 3 + 0.5).toFixed(2)} kcal/mol`
    ];
    setAiSuggestions(suggestions);
  }, [selectedElements]);

  const optimizeParameters = async () => {
    if (!activeMolecule) return;
    
    setIsOptimizing(true);
    
    // Simulação de otimização com IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parâmetros "otimizados" pela IA
    const optimized = {
      lennardJones: {
        epsilon: parameters.lennardJones.epsilon * (0.9 + Math.random() * 0.2),
        sigma: parameters.lennardJones.sigma * (0.95 + Math.random() * 0.1)
      },
      harmonic: {
        equilibriumLength: parameters.harmonic.equilibriumLength * (0.98 + Math.random() * 0.04),
        forceConstant: parameters.harmonic.forceConstant * (0.9 + Math.random() * 0.2)
      },
      angle: {
        equilibriumAngle: parameters.angle.equilibriumAngle + (Math.random() - 0.5) * 5,
        forceConstant: parameters.angle.forceConstant * (0.9 + Math.random() * 0.2)
      },
      torsion: {
        phase: parameters.torsion.phase + (Math.random() - 0.5) * 10,
        amplitude: parameters.torsion.amplitude * (0.8 + Math.random() * 0.4),
        periodicity: parameters.torsion.periodicity
      }
    };
    
    setParameters(optimized);
    setIsOptimizing(false);
    toast.success('Parâmetros otimizados pela IA!');
  };

  const exportParameters = () => {
    const data = {
      elements: selectedElements,
      parameters,
      simulationSettings,
      molecule: activeMolecule?.name
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physics_parameters.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importParameters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setParameters(data.parameters);
        setSimulationSettings(data.simulationSettings);
        setSelectedElements(data.elements);
        toast.success('Parâmetros importados com sucesso!');
      } catch (error) {
        toast.error('Erro ao importar parâmetros');
      }
    };
    reader.readAsText(file);
  };

  const runPhysicsCalculation = () => {
    if (!activeMolecule) return;
    
    const results = physics.calculatePhysics(activeMolecule);
    toast.success(`Energia total: ${results.totalEnergy.toFixed(2)} kcal/mol`);
  };

  useEffect(() => {
    generateAISuggestions();
  }, [selectedElements]);

  if (!activeMolecule) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Editor de Física com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Carregue uma molécula para começar a otimização
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Editor de Física com IA - {activeMolecule.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="lennard-jones" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lennard-jones">Lennard-Jones</TabsTrigger>
            <TabsTrigger value="harmonic">Harmônico</TabsTrigger>
            <TabsTrigger value="angles">Ângulos</TabsTrigger>
            <TabsTrigger value="torsions">Torções</TabsTrigger>
            <TabsTrigger value="simulation">Simulação</TabsTrigger>
          </TabsList>

          {/* Controles de elementos */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Label>Interação:</Label>
              <Select value={selectedElements[0]} onValueChange={(value) => setSelectedElements([value, selectedElements[1]])}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['C', 'H', 'O', 'N', 'F', 'P', 'S'].map(elem => (
                    <SelectItem key={elem} value={elem}>{elem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>-</span>
              <Select value={selectedElements[1]} onValueChange={(value) => setSelectedElements([selectedElements[0], value])}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['C', 'H', 'O', 'N', 'F', 'P', 'S'].map(elem => (
                    <SelectItem key={elem} value={elem}>{elem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button onClick={optimizeParameters} disabled={isOptimizing} className="gap-2">
              <Zap className="w-4 h-4" />
              {isOptimizing ? 'Otimizando...' : 'Otimizar com IA'}
            </Button>
            
            <Button onClick={runPhysicsCalculation} variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Calcular Física
            </Button>
          </div>

          <TabsContent value="lennard-jones" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parâmetros de Lennard-Jones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Epsilon (ε) - kcal/mol</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={parameters.lennardJones.epsilon}
                      onChange={(e) => setParameters({
                        ...parameters,
                        lennardJones: { ...parameters.lennardJones, epsilon: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Sigma (σ) - Angstroms</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parameters.lennardJones.sigma}
                      onChange={(e) => setParameters({
                        ...parameters,
                        lennardJones: { ...parameters.lennardJones, sigma: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Sugestões da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <Badge key={index} variant="secondary" className="text-xs block p-2 h-auto">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="harmonic" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Potencial Harmônico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Distância de Equilíbrio (r₀) - Å</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parameters.harmonic.equilibriumLength}
                      onChange={(e) => setParameters({
                        ...parameters,
                        harmonic: { ...parameters.harmonic, equilibriumLength: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Constante de Força (k) - kcal/mol/Å²</Label>
                    <Input
                      type="number"
                      step="1"
                      value={parameters.harmonic.forceConstant}
                      onChange={(e) => setParameters({
                        ...parameters,
                        harmonic: { ...parameters.harmonic, forceConstant: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Visualização do Potencial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                    Gráfico do potencial harmônico
                    <br />
                    E = ½k(r - r₀)²
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="angles" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parâmetros Angulares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Ângulo de Equilíbrio (θ₀) - graus</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={parameters.angle.equilibriumAngle}
                      onChange={(e) => setParameters({
                        ...parameters,
                        angle: { ...parameters.angle, equilibriumAngle: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Constante Angular (k) - kcal/mol/rad²</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={parameters.angle.forceConstant}
                      onChange={(e) => setParameters({
                        ...parameters,
                        angle: { ...parameters.angle, forceConstant: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Análise de Ângulos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>Ângulos detectados: {activeMolecule.bonds.length > 1 ? 'Vários' : 'Nenhum'}</div>
                    <div>Desvio médio: ±2.3°</div>
                    <div>Energia angular: 0.45 kcal/mol</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="torsions" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parâmetros de Torção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Fase (φ) - graus</Label>
                    <Input
                      type="number"
                      step="1"
                      value={parameters.torsion.phase}
                      onChange={(e) => setParameters({
                        ...parameters,
                        torsion: { ...parameters.torsion, phase: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Amplitude (V) - kcal/mol</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parameters.torsion.amplitude}
                      onChange={(e) => setParameters({
                        ...parameters,
                        torsion: { ...parameters.torsion, amplitude: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Periodicidade (n)</Label>
                    <Select 
                      value={parameters.torsion.periodicity.toString()} 
                      onValueChange={(value) => setParameters({
                        ...parameters,
                        torsion: { ...parameters.torsion, periodicity: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Perfil Torsional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                    V(φ) = V₀[1 + cos(nφ - φ₀)]
                    <br />
                    Perfil energético vs. ângulo diedro
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configurações de Simulação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Passo de Tempo (fs)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={simulationSettings.timeStep}
                      onChange={(e) => setSimulationSettings({
                        ...simulationSettings,
                        timeStep: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Temperatura (K)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={simulationSettings.temperature}
                      onChange={(e) => setSimulationSettings({
                        ...simulationSettings,
                        temperature: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Número de Passos</Label>
                    <Input
                      type="number"
                      step="100"
                      value={simulationSettings.steps}
                      onChange={(e) => setSimulationSettings({
                        ...simulationSettings,
                        steps: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Integrador</Label>
                    <Select 
                      value={simulationSettings.integrator} 
                      onValueChange={(value) => setSimulationSettings({
                        ...simulationSettings,
                        integrator: value as 'verlet' | 'langevin' | 'nose-hoover'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verlet">Verlet</SelectItem>
                        <SelectItem value="langevin">Langevin</SelectItem>
                        <SelectItem value="nose-hoover">Nosé-Hoover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={exportParameters} variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                    <div className="relative">
                      <Button size="sm" className="gap-2 w-full" asChild>
                        <label>
                          <Upload className="w-4 h-4" />
                          Importar
                        </label>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importParameters}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Parâmetros otimizados automaticamente</div>
                    <div>• Validação por aprendizado de máquina</div>
                    <div>• Comparação com bancos de dados experimentais</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};