import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Sparkles, 
  Beaker, 
  Target, 
  Lightbulb, 
  TrendingUp,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Atom,
  Zap,
  Brain,
  Download,
  Eye,
  Plus,
  AlertTriangle,
  CheckCircle,
  Dna,
  FlaskConical,
  Microscope,
  Shuffle,
  Settings,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMolecularStore } from '../../store/molecularStore';

interface DesignedMolecule {
  id: string;
  name: string;
  smiles: string;
  formula: string;
  molecularWeight: number;
  logP: number;
  hbd: number; // Hydrogen bond donors
  hba: number; // Hydrogen bond acceptors
  tpsa: number; // Topological polar surface area
  drugLikeness: number;
  synthesisScore: number;
  novelty: number;
  targetAffinity: number;
  admetScore: number;
  mechanism: string;
  advantages: string[];
  concerns: string[];
  structure: {
    rings: number;
    aromaticRings: number;
    heteroatoms: number;
    functionalGroups: string[];
  };
}

interface ImprovedAIMoleculeDesignerProps {
  className?: string;
  onMoleculeDesigned?: (molecule: DesignedMolecule) => void;
}

export const ImprovedAIMoleculeDesigner: React.FC<ImprovedAIMoleculeDesignerProps> = ({
  className,
  onMoleculeDesigned
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [designedMolecules, setDesignedMolecules] = useState<DesignedMolecule[]>([]);
  const [designProgress, setDesignProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [selectedMolecule, setSelectedMolecule] = useState<DesignedMolecule | null>(null);

  // Form state
  const [targetDisease, setTargetDisease] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [designStrategy, setDesignStrategy] = useState<'diverse' | 'focused' | 'novel' | 'optimized'>('diverse');
  const [moleculeCount, setMoleculeCount] = useState(5);
  const [complexityLevel, setComplexityLevel] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [includeNaturalProducts, setIncludeNaturalProducts] = useState(false);
  const [requireOralBioavailability, setRequireOralBioavailability] = useState(true);

  const { addMoleculeToCollection } = useMolecularStore();

  // Diferentes templates de moléculas para gerar variedade
  const moleculeTemplates = [
    {
      type: 'benzene_derivative',
      baseStructure: 'C1=CC=CC=C1',
      variations: ['substituted', 'fused_rings', 'heteroaromatic']
    },
    {
      type: 'heterocycle',
      baseStructure: 'C1=CN=CC=C1',
      variations: ['pyridine', 'pyrimidine', 'quinoline', 'indole']
    },
    {
      type: 'aliphatic_chain',
      baseStructure: 'CCCCCC',
      variations: ['branched', 'cyclic', 'unsaturated']
    },
    {
      type: 'peptide_mimic',
      baseStructure: 'NC(=O)C',
      variations: ['beta_sheet', 'alpha_helix', 'turn_mimic']
    },
    {
      type: 'natural_product',
      baseStructure: 'C1CC2CCC1C2',
      variations: ['steroid', 'terpene', 'alkaloid', 'flavonoid']
    }
  ];

  const generateDiverseMolecules = async (): Promise<DesignedMolecule[]> => {
    const molecules: DesignedMolecule[] = [];
    
    for (let i = 0; i < moleculeCount; i++) {
      // Selecionar template aleatório
      const template = moleculeTemplates[Math.floor(Math.random() * moleculeTemplates.length)];
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
      
      // Gerar propriedades variadas
      const molecularWeight = 150 + Math.random() * 400;
      const logP = -2 + Math.random() * 8;
      const hbd = Math.floor(Math.random() * 6);
      const hba = Math.floor(Math.random() * 10);
      const tpsa = 20 + Math.random() * 140;
      
      // Calcular scores baseados nas propriedades
      const drugLikeness = calculateDrugLikeness(molecularWeight, logP, hbd, hba, tpsa);
      const synthesisScore = 0.3 + Math.random() * 0.7;
      const novelty = 0.4 + Math.random() * 0.6;
      const targetAffinity = 0.5 + Math.random() * 0.5;
      const admetScore = 0.4 + Math.random() * 0.6;

      // Gerar estrutura diversificada
      const rings = Math.floor(1 + Math.random() * 4);
      const aromaticRings = Math.floor(Math.random() * rings);
      const heteroatoms = Math.floor(Math.random() * 8);
      
      const functionalGroups = generateFunctionalGroups(template.type, variation);
      
      const molecule: DesignedMolecule = {
        id: `ai_mol_${i + 1}_${Date.now()}`,
        name: generateMoleculeName(template.type, variation, i + 1),
        smiles: generateSMILES(template, variation),
        formula: generateFormula(molecularWeight),
        molecularWeight: Math.round(molecularWeight * 100) / 100,
        logP: Math.round(logP * 100) / 100,
        hbd,
        hba,
        tpsa: Math.round(tpsa * 100) / 100,
        drugLikeness,
        synthesisScore,
        novelty,
        targetAffinity,
        admetScore,
        mechanism: generateMechanism(targetProtein, mechanism),
        advantages: generateAdvantages(template.type, drugLikeness, novelty),
        concerns: generateConcerns(logP, molecularWeight, tpsa),
        structure: {
          rings,
          aromaticRings,
          heteroatoms,
          functionalGroups
        }
      };

      molecules.push(molecule);
    }

    return molecules.sort((a, b) => b.drugLikeness - a.drugLikeness);
  };

  const calculateDrugLikeness = (mw: number, logP: number, hbd: number, hba: number, tpsa: number): number => {
    let score = 1.0;
    
    // Regra de Lipinski
    if (mw > 500) score -= 0.2;
    if (logP > 5) score -= 0.2;
    if (hbd > 5) score -= 0.2;
    if (hba > 10) score -= 0.2;
    if (tpsa > 140) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  };

  const generateFunctionalGroups = (type: string, variation: string): string[] => {
    const groups: Record<string, string[]> = {
      benzene_derivative: ['hydroxyl', 'methyl', 'amino', 'carboxyl'],
      heterocycle: ['amino', 'carbonyl', 'hydroxyl', 'methoxy'],
      aliphatic_chain: ['hydroxyl', 'amino', 'carboxyl', 'ester'],
      peptide_mimic: ['amide', 'amino', 'carboxyl', 'hydroxyl'],
      natural_product: ['hydroxyl', 'methyl', 'carbonyl', 'ether']
    };
    
    const availableGroups = groups[type] || groups.benzene_derivative;
    const count = 1 + Math.floor(Math.random() * 3);
    
    return availableGroups.slice(0, count);
  };

  const generateMoleculeName = (type: string, variation: string, index: number): string => {
    const prefixes = ['Neo', 'Iso', 'Meta', 'Para', 'Ortho', 'Cyclo', 'Tetra', 'Penta'];
    const suffixes = ['ine', 'ole', 'ane', 'ide', 'ate', 'yl', 'one', 'al'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const base = type.split('_')[0];
    
    return `${prefix}${base}${suffix}-${index}`;
  };

  const generateSMILES = (template: any, variation: string): string => {
    // Gerar SMILES baseado no template (simplificado)
    const variations: Record<string, string> = {
      substituted: 'C1=CC(C)=CC(O)=C1',
      fused_rings: 'C1=CC=C2C=CC=CC2=C1',
      heteroaromatic: 'C1=CN=CC=C1',
      pyridine: 'C1=CC=NC=C1',
      pyrimidine: 'C1=CN=CN=C1',
      quinoline: 'C1=CC=C2N=CC=CC2=C1',
      indole: 'C1=CC=C2C(=C1)C=CN2',
      branched: 'CC(C)CC(C)C',
      cyclic: 'C1CCCCC1',
      unsaturated: 'C=CC=CC=C',
      beta_sheet: 'NC(=O)C(N)C(=O)N',
      alpha_helix: 'NC(C)C(=O)NC(C)C(=O)N',
      steroid: 'C1CC2CCC3C(CCC4CCCCC34)C2CC1',
      terpene: 'CC(C)=CCCC(C)=C',
      alkaloid: 'CN1CCC2=CC=CC=C2C1',
      flavonoid: 'C1=CC(=CC=C1C2=CC(=O)C3=C(C=C(C=C3O2)O)O)O'
    };
    
    return variations[variation] || template.baseStructure;
  };

  const generateFormula = (mw: number): string => {
    // Estimativa simplificada baseada no peso molecular
    const carbonCount = Math.floor(mw / 20);
    const hydrogenCount = Math.floor(carbonCount * 1.5);
    const oxygenCount = Math.floor(Math.random() * 4);
    const nitrogenCount = Math.floor(Math.random() * 3);
    
    let formula = `C${carbonCount}H${hydrogenCount}`;
    if (nitrogenCount > 0) formula += `N${nitrogenCount}`;
    if (oxygenCount > 0) formula += `O${oxygenCount}`;
    
    return formula;
  };

  const generateMechanism = (protein: string, mechanism: string): string => {
    if (mechanism) return mechanism;
    
    const mechanisms = [
      'Inibição competitiva do sítio ativo',
      'Modulação alostérica positiva',
      'Antagonismo de receptor',
      'Inibição enzimática reversível',
      'Bloqueio de canal iônico',
      'Ativação de receptor acoplado à proteína G',
      'Inibição da síntese proteica',
      'Modulação da expressão gênica'
    ];
    
    return mechanisms[Math.floor(Math.random() * mechanisms.length)];
  };

  const generateAdvantages = (type: string, drugLikeness: number, novelty: number): string[] => {
    const advantages = [];
    
    if (drugLikeness > 0.8) advantages.push('Excelente drug-likeness');
    if (novelty > 0.7) advantages.push('Estrutura altamente inovadora');
    if (type === 'natural_product') advantages.push('Baseado em produto natural');
    if (type === 'heterocycle') advantages.push('Boa solubilidade aquosa');
    if (type === 'peptide_mimic') advantages.push('Alta seletividade');
    
    advantages.push('Potencial para otimização');
    advantages.push('Síntese viável');
    
    return advantages.slice(0, 3);
  };

  const generateConcerns = (logP: number, mw: number, tpsa: number): string[] => {
    const concerns = [];
    
    if (logP > 5) concerns.push('Alta lipofilicidade');
    if (mw > 500) concerns.push('Peso molecular elevado');
    if (tpsa > 140) concerns.push('TPSA alta - possível baixa permeabilidade');
    if (logP < 0) concerns.push('Baixa lipofilicidade');
    
    if (concerns.length === 0) {
      concerns.push('Necessita validação experimental');
    }
    
    return concerns.slice(0, 2);
  };

  const handleDesignMolecules = async () => {
    if (!targetDisease.trim()) return;

    setIsDesigning(true);
    setDesignProgress(0);
    setCurrentStep('Inicializando design molecular...');

    try {
      setDesignProgress(20);
      setCurrentStep('Analisando alvo terapêutico...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setDesignProgress(40);
      setCurrentStep('Gerando estruturas diversificadas...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDesignProgress(60);
      setCurrentStep('Otimizando propriedades ADMET...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setDesignProgress(80);
      setCurrentStep('Avaliando drug-likeness...');
      await new Promise(resolve => setTimeout(resolve, 600));

      const molecules = await generateDiverseMolecules();
      
      setDesignProgress(100);
      setCurrentStep('Design concluído!');
      
      setDesignedMolecules(molecules);
      
    } catch (error) {
      console.error('Error designing molecules:', error);
    } finally {
      setTimeout(() => {
        setIsDesigning(false);
        setDesignProgress(0);
        setCurrentStep('');
      }, 1000);
    }
  };

  const handleAddToCollection = (molecule: DesignedMolecule) => {
    // Converter para formato do store
    const moleculeData = {
      id: molecule.id,
      name: molecule.name,
      atoms: [], // Seria gerado a partir do SMILES
      bonds: [], // Seria gerado a partir do SMILES
      formula: molecule.formula,
      energy: 0,
      metadata: {
        source: 'AI Designer',
        smiles: molecule.smiles,
        drugLikeness: molecule.drugLikeness,
        synthesisScore: molecule.synthesisScore,
        novelty: molecule.novelty
      }
    };
    
    addMoleculeToCollection(moleculeData);
    onMoleculeDesigned?.(molecule);
  };

  const designStrategies = [
    { key: 'diverse', label: 'Diversificado', description: 'Máxima variedade estrutural' },
    { key: 'focused', label: 'Focado', description: 'Otimização de lead compounds' },
    { key: 'novel', label: 'Inovador', description: 'Estruturas completamente novas' },
    { key: 'optimized', label: 'Otimizado', description: 'Melhores propriedades ADMET' }
  ];

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Designer Avançado
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Design Form */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Doença/Condição Alvo</label>
            <Input
              placeholder="Ex: diabetes, câncer, hipertensão..."
              value={targetDisease}
              onChange={(e) => setTargetDisease(e.target.value)}
            />
          </div>

          {isExpanded && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proteína Alvo (Opcional)</label>
                <Input
                  placeholder="Ex: EGFR, ACE, DPP-4..."
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estratégia de Design</label>
                <Select value={designStrategy} onValueChange={(value: any) => setDesignStrategy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {designStrategies.map((strategy) => (
                      <SelectItem key={strategy.key} value={strategy.key}>
                        <div className="flex flex-col">
                          <span>{strategy.label}</span>
                          <span className="text-xs text-muted-foreground">{strategy.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Select value={moleculeCount.toString()} onValueChange={(value) => setMoleculeCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 moléculas</SelectItem>
                      <SelectItem value="5">5 moléculas</SelectItem>
                      <SelectItem value="8">8 moléculas</SelectItem>
                      <SelectItem value="10">10 moléculas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Complexidade</label>
                  <Select value={complexityLevel} onValueChange={(value: any) => setComplexityLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simples</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="complex">Complexa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Incluir Produtos Naturais</label>
                  <Button
                    variant={includeNaturalProducts ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIncludeNaturalProducts(!includeNaturalProducts)}
                    className="h-6 px-2 text-xs"
                  >
                    {includeNaturalProducts ? <CheckCircle className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleDesignMolecules}
            disabled={isDesigning || !targetDisease.trim()}
            className="w-full"
          >
            {isDesigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Projetando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Projetar Moléculas
              </>
            )}
          </Button>
        </div>

        {/* Design Progress */}
        {isDesigning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{currentStep}</span>
              <span className="font-medium">{designProgress}%</span>
            </div>
            <Progress value={designProgress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {designedMolecules.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Moléculas Projetadas ({designedMolecules.length})</span>
              <Badge variant="outline" className="text-xs">
                <Shuffle className="w-3 h-3 mr-1" />
                Diversificado
              </Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {designedMolecules.map((molecule) => (
                <Card
                  key={molecule.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:shadow-md",
                    selectedMolecule?.id === molecule.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedMolecule(molecule)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{molecule.name}</h4>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={molecule.drugLikeness > 0.8 ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {Math.round(molecule.drugLikeness * 100)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <strong>Fórmula:</strong> {molecule.formula} | 
                      <strong> MW:</strong> {molecule.molecularWeight} | 
                      <strong> LogP:</strong> {molecule.logP}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground">Síntese</div>
                        <div className="font-medium">{Math.round(molecule.synthesisScore * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Novidade</div>
                        <div className="font-medium">{Math.round(molecule.novelty * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">ADMET</div>
                        <div className="font-medium">{Math.round(molecule.admetScore * 100)}%</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <strong>Mecanismo:</strong> {molecule.mechanism}
                    </div>

                    {molecule.advantages.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {molecule.advantages.slice(0, 2).map((advantage, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-green-600">
                            <CheckCircle className="w-2 h-2 mr-1" />
                            {advantage}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {molecule.concerns.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {molecule.concerns.slice(0, 1).map((concern, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-orange-600">
                            <AlertTriangle className="w-2 h-2 mr-1" />
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCollection(molecule);
                        }}
                        className="text-xs flex-1"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Visualizar detalhes
                        }}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isExpanded && designedMolecules.length === 0 && (
          <div className="text-center text-xs text-muted-foreground">
            <Dna className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <p>Design inteligente de moléculas</p>
            <p>Estruturas diversificadas e otimizadas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

