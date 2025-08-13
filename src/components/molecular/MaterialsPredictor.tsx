import React, { useState, useEffect, useCallback } from 'react';
import { Molecule, Atom } from '../../types/molecular';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Atom, Sparkles, Layers, Zap, Target, Database } from 'lucide-react';
import { useMolecularStore } from '../../store/molecularStore';
import { toast } from 'sonner';

interface MaterialPrediction {
  id: string;
  name: string;
  formula: string;
  type: 'polymer' | 'ceramic' | 'composite' | 'nanomaterial' | 'superconductor';
  properties: {
    conductivity: number;
    strength: number;
    flexibility: number;
    stability: number;
  };
  applications: string[];
  synthesisRoute: string[];
  confidence: number;
  novelty: number;
}

interface BondingPrediction {
  type: 'covalent' | 'ionic' | 'metallic' | 'van_der_waals' | 'hydrogen';
  strength: number;
  length: number;
  stability: 'stable' | 'metastable' | 'unstable';
  formation_energy: number;
}

export const MaterialsPredictor: React.FC = () => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  const [targetProperty, setTargetProperty] = useState('conductivity');
  const [materialType, setMaterialType] = useState('polymer');
  const [predictions, setPredictions] = useState<MaterialPrediction[]>([]);
  const [bondingAnalysis, setBondingAnalysis] = useState<BondingPrediction[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  const predictNewMaterials = async () => {
    if (!activeMolecule) {
      toast.error('Nenhuma molécula selecionada');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    
    // Simular análise progressiva
    const steps = [
      { step: 20, message: 'Analisando estrutura molecular...' },
      { step: 40, message: 'Calculando propriedades eletrônicas...' },
      { step: 60, message: 'Prevendo interações intermoleculares...' },
      { step: 80, message: 'Gerando candidatos a materiais...' },
      { step: 100, message: 'Finalizando predições...' }
    ];

    for (const { step, message } of steps) {
      toast.info(message);
      setProgress(step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Gerar predições baseadas na molécula atual
    const newPredictions = generateMaterialPredictions(activeMolecule);
    const bondingPreds = generateBondingPredictions(activeMolecule);
    
    setPredictions(newPredictions);
    setBondingAnalysis(bondingPreds);
    setAnalyzing(false);
    
    toast.success(`${newPredictions.length} novos materiais preditos!`);
  };

  const generateMaterialPredictions = (molecule: Molecule): MaterialPrediction[] => {
    const baseName = molecule.name || 'Composto';
    const hasAromaticRings = molecule.atoms.some((atom: Atom) => atom.element === 'C');
    const hasHeteroatoms = molecule.atoms.some((atom: Atom) => ['N', 'O', 'S'].includes(atom.element));
    
    const predictions: MaterialPrediction[] = [];

    // Predição 1: Polímero condutor
    if (hasAromaticRings) {
      predictions.push({
        id: '1',
        name: `Poli-${baseName}`,
        formula: `(${molecule.formula || 'C8H6'})n`,
        type: 'polymer',
        properties: {
          conductivity: 0.7 + Math.random() * 0.3,
          strength: 0.6 + Math.random() * 0.4,
          flexibility: 0.8 + Math.random() * 0.2,
          stability: 0.5 + Math.random() * 0.4
        },
        applications: ['Eletrônicos flexíveis', 'Sensores', 'Baterias orgânicas'],
        synthesisRoute: [
          'Polimerização oxidativa',
          'Dopagem com ácidos',
          'Processamento em filmes'
        ],
        confidence: 0.85,
        novelty: 0.7
      });
    }

    // Predição 2: Material híbrido
    if (hasHeteroatoms) {
      predictions.push({
        id: '2',
        name: `${baseName}-Grafeno`,
        formula: `C100(${molecule.formula || 'C8H6'})`,
        type: 'composite',
        properties: {
          conductivity: 0.9 + Math.random() * 0.1,
          strength: 0.9 + Math.random() * 0.1,
          flexibility: 0.6 + Math.random() * 0.3,
          stability: 0.8 + Math.random() * 0.2
        },
        applications: ['Supercapacitores', 'Eletrodos', 'Membranas seletivas'],
        synthesisRoute: [
          'Funcionalização não-covalente',
          'Deposição por vapor',
          'Tratamento térmico'
        ],
        confidence: 0.78,
        novelty: 0.85
      });
    }

    // Predição 3: Nanomaterial
    predictions.push({
      id: '3',
      name: `Nanotubos de ${baseName}`,
      formula: `(${molecule.formula || 'C8H6'})₁₀₀`,
      type: 'nanomaterial',
      properties: {
        conductivity: 0.6 + Math.random() * 0.4,
        strength: 0.95 + Math.random() * 0.05,
        flexibility: 0.4 + Math.random() * 0.3,
        stability: 0.7 + Math.random() * 0.3
      },
      applications: ['Reforço estrutural', 'Filtração molecular', 'Catálise'],
      synthesisRoute: [
        'CVD em alta temperatura',
        'Template com AAO',
        'Purificação ultrassônica'
      ],
      confidence: 0.72,
      novelty: 0.92
    });

    return predictions;
  };

  const generateBondingPredictions = (molecule: Molecule): BondingPrediction[] => {
    return [
      {
        type: 'covalent',
        strength: 350 + Math.random() * 150,
        length: 1.4 + Math.random() * 0.3,
        stability: 'stable',
        formation_energy: -2.5 - Math.random() * 2
      },
      {
        type: 'van_der_waals',
        strength: 20 + Math.random() * 30,
        length: 3.0 + Math.random() * 0.5,
        stability: 'metastable',
        formation_energy: -0.3 - Math.random() * 0.4
      },
      {
        type: 'hydrogen',
        strength: 15 + Math.random() * 25,
        length: 1.8 + Math.random() * 0.4,
        stability: 'stable',
        formation_energy: -0.8 - Math.random() * 0.7
      }
    ];
  };

  const getPropertyColor = (value: number) => {
    if (value > 0.8) return 'text-green-500';
    if (value > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBondTypeIcon = (type: string) => {
    switch (type) {
      case 'covalent': return <Zap className="w-3 h-3" />;
      case 'ionic': return <Atom className="w-3 h-3" />;
      case 'metallic': return <Layers className="w-3 h-3" />;
      case 'van_der_waals': return <Sparkles className="w-3 h-3" />;
      case 'hydrogen': return <Target className="w-3 h-3" />;
      default: return <Database className="w-3 h-3" />;
    }
  };

  return (
    <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Predição de Materiais
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Propriedade Alvo</Label>
            <Select value={targetProperty} onValueChange={setTargetProperty}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conductivity">Condutividade</SelectItem>
                <SelectItem value="strength">Resistência Mecânica</SelectItem>
                <SelectItem value="flexibility">Flexibilidade</SelectItem>
                <SelectItem value="stability">Estabilidade Térmica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Tipo de Material</Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="polymer">Polímero</SelectItem>
                <SelectItem value="composite">Compósito</SelectItem>
                <SelectItem value="nanomaterial">Nanomaterial</SelectItem>
                <SelectItem value="ceramic">Cerâmico</SelectItem>
                <SelectItem value="superconductor">Supercondutor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={predictNewMaterials} 
            className="w-full h-8 text-sm"
            disabled={analyzing || !activeMolecule}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzing ? 'Analisando...' : 'Prever Materiais'}
          </Button>
        </div>

        {analyzing && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Progresso da Análise</div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {predictions.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="text-sm font-medium">Materiais Preditos</div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {predictions.map((pred) => (
                <div key={pred.id} className="border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{pred.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {pred.type}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {pred.formula}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex justify-between">
                      <span>Condutividade:</span>
                      <span className={getPropertyColor(pred.properties.conductivity)}>
                        {(pred.properties.conductivity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resistência:</span>
                      <span className={getPropertyColor(pred.properties.strength)}>
                        {(pred.properties.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flexibilidade:</span>
                      <span className={getPropertyColor(pred.properties.flexibility)}>
                        {(pred.properties.flexibility * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estabilidade:</span>
                      <span className={getPropertyColor(pred.properties.stability)}>
                        {(pred.properties.stability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1">Aplicações:</div>
                    <div>{pred.applications.slice(0, 2).join(', ')}</div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span>Confiança: {(pred.confidence * 100).toFixed(0)}%</span>
                    <span>Novidade: {(pred.novelty * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bondingAnalysis.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="text-sm font-medium">Análise de Ligações</div>
            
            <div className="space-y-1">
              {bondingAnalysis.map((bond, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                  <div className="flex items-center gap-2">
                    {getBondTypeIcon(bond.type)}
                    <span className="capitalize">{bond.type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <div>{bond.strength.toFixed(0)} kJ/mol</div>
                    <div className="text-muted-foreground">{bond.length.toFixed(2)} Å</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeMolecule && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Carregue uma molécula para começar a predição
          </div>
        )}
      </CardContent>
    </Card>
  );
};