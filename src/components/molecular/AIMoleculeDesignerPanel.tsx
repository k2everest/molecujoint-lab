import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Microscope
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIMoleculeDesigner, MoleculeDesignRequest, DesignResult, DesignedMolecule } from '../../utils/aiMoleculeDesigner';
import { useMolecularStore } from '../../store/molecularStore';

interface AIMoleculeDesignerPanelProps {
  className?: string;
  onMoleculeDesigned?: (molecule: DesignedMolecule) => void;
}

export const AIMoleculeDesignerPanel: React.FC<AIMoleculeDesignerPanelProps> = ({
  className,
  onMoleculeDesigned
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  const [designProgress, setDesignProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Form state
  const [targetDisease, setTargetDisease] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [designStrategy, setDesignStrategy] = useState<'scaffold_hopping' | 'fragment_linking' | 'structure_optimization' | 'bioisosterism'>('scaffold_hopping');
  const [maxMolecularWeight, setMaxMolecularWeight] = useState(500);
  const [requireOralBioavailability, setRequireOralBioavailability] = useState(true);
  const [referenceCompounds, setReferenceCompounds] = useState('');

  const aiDesigner = new AIMoleculeDesigner();
  const { addMolecule } = useMolecularStore();

  const handleDesignMolecules = async () => {
    if (!targetDisease.trim()) return;

    setIsDesigning(true);
    setDesignProgress(0);
    setCurrentStep('Analisando requisitos de design...');

    try {
      const request: MoleculeDesignRequest = {
        targetDisease,
        targetProtein: targetProtein || undefined,
        mechanism: mechanism || undefined,
        designStrategy,
        constraints: {
          maxMolecularWeight,
          requireOralBioavailability,
          avoidToxicGroups: true
        },
        referenceCompounds: referenceCompounds ? referenceCompounds.split(',').map(s => s.trim()) : undefined
      };

      setDesignProgress(25);
      setCurrentStep('Aplicando estratégias de design molecular...');

      // Simular processo de design
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDesignProgress(50);
      setCurrentStep('Otimizando propriedades ADMET...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDesignProgress(75);
      setCurrentStep('Avaliando drug-likeness e viabilidade sintética...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await aiDesigner.designMolecules(request);
      
      setDesignResult(result);
      setDesignProgress(100);
      setCurrentStep('Design concluído!');

    } catch (error) {
      console.error('Error designing molecules:', error);
      setCurrentStep('Erro no design. Tente novamente.');
    } finally {
      setTimeout(() => {
        setIsDesigning(false);
        setDesignProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const handleLoadMolecule = (designedMolecule: DesignedMolecule) => {
    try {
      // Converter DesignedMolecule para formato do MolecularStore
      const molecule = {
        id: `designed_${Date.now()}`,
        name: designedMolecule.name,
        atoms: designedMolecule.structure.atoms.map((atom, index) => ({
          id: `atom_${index}`,
          element: atom.symbol,
          position: [atom.x, atom.y, atom.z] as [number, number, number],
          color: '#CCCCCC',
          radius: 0.5
        })),
        bonds: designedMolecule.structure.bonds.map((bond, index) => ({
          id: `bond_${index}`,
          atom1Id: `atom_${bond.from}`,
          atom2Id: `atom_${bond.to}`,
          bondType: bond.order === 2 ? 'double' as const : bond.order === 3 ? 'triple' as const : 'single' as const,
          length: 1.5
        })),
        properties: {
          totalEnergy: 0,
          dipoleMoment: 0,
          centerOfMass: [0, 0, 0] as [number, number, number]
        },
        metadata: {
          source: 'AI Designer',
          formula: designedMolecule.formula,
          molecularWeight: designedMolecule.properties.molecularWeight,
          logP: designedMolecule.properties.logP,
          drugLikeness: designedMolecule.drugLikeness.score,
          targetAffinity: designedMolecule.targetAffinity.predictedBinding,
          mechanism: designedMolecule.targetAffinity.mechanism,
          synthesisComplexity: designedMolecule.synthesisRoute?.complexity
        }
      };

      addMolecule(molecule);
      onMoleculeDesigned?.(designedMolecule);
    } catch (error) {
      console.error('Error loading designed molecule:', error);
    }
  };

  const exportDesignReport = () => {
    if (!designResult) return;

    const reportText = `
# Relatório de Design Molecular com IA

## Requisitos de Design
- **Doença Alvo**: ${designResult.request.targetDisease}
- **Proteína Alvo**: ${designResult.request.targetProtein || 'Não especificada'}
- **Mecanismo**: ${designResult.request.mechanism || 'Não especificado'}
- **Estratégia**: ${designResult.request.designStrategy}

## Moléculas Projetadas (${designResult.designedMolecules.length})

${designResult.designedMolecules.map((mol, index) => `
### ${index + 1}. ${mol.name}
- **Fórmula**: ${mol.formula}
- **Peso Molecular**: ${mol.properties.molecularWeight.toFixed(1)} Da
- **LogP**: ${mol.properties.logP.toFixed(2)}
- **Drug-likeness**: ${(mol.drugLikeness.score * 100).toFixed(0)}%
- **Afinidade Predita**: ${(mol.targetAffinity.predictedBinding * 100).toFixed(0)}%
- **Complexidade Sintética**: ${mol.synthesisRoute?.complexity || 'N/A'}
- **Novidade**: ${(mol.novelty * 100).toFixed(0)}%

**Rationale**: ${mol.reasoning}

**Propriedades ADMET**:
- HBD: ${mol.properties.hbdCount}
- HBA: ${mol.properties.hbaCount}
- Ligações Rotacionáveis: ${mol.properties.rotatableBonds}
- PSA: ${mol.properties.polarSurfaceArea.toFixed(1)} Ų

**Violações de Lipinski**: ${mol.drugLikeness.lipinskiViolations}
**Violações de Veber**: ${mol.drugLikeness.veberViolations}
`).join('\n')}

## Rationale de Design
${designResult.designRationale}

## Estratégias Alternativas
${designResult.alternativeStrategies.map(strategy => `- ${strategy}`).join('\n')}

## Avaliação de Riscos
- **Risco de Toxicidade**: ${designResult.riskAssessment.toxicityRisk}
- **Risco de Desenvolvimento**: ${designResult.riskAssessment.developmentRisk}
- **Risco de Patente**: ${designResult.riskAssessment.patentRisk}

**Notas**:
${designResult.riskAssessment.notes.map(note => `- ${note}`).join('\n')}

---
Relatório gerado pelo MolecuJoint Lab - AI Molecule Designer
Data: ${new Date().toLocaleDateString('pt-BR')}
    `;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design_molecular_${designResult.request.targetDisease.replace(/\s+/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Design Molecular com IA
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
            <label className="text-sm font-medium">Doença Alvo *</label>
            <Input
              placeholder="Ex: HIV, Alzheimer, Câncer..."
              value={targetDisease}
              onChange={(e) => setTargetDisease(e.target.value)}
            />
          </div>

          {isExpanded && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proteína Alvo</label>
                <Input
                  placeholder="Ex: reverse transcriptase, protease..."
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mecanismo de Ação</label>
                <Input
                  placeholder="Ex: competitive inhibition..."
                  value={mechanism}
                  onChange={(e) => setMechanism(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estratégia de Design</label>
                <Select value={designStrategy} onValueChange={(value: any) => setDesignStrategy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scaffold_hopping">Scaffold Hopping</SelectItem>
                    <SelectItem value="fragment_linking">Fragment Linking</SelectItem>
                    <SelectItem value="structure_optimization">Structure Optimization</SelectItem>
                    <SelectItem value="bioisosterism">Bioisosterism</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Peso Molecular Máximo</label>
                <Input
                  type="number"
                  min="200"
                  max="1000"
                  value={maxMolecularWeight}
                  onChange={(e) => setMaxMolecularWeight(parseInt(e.target.value) || 500)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Compostos de Referência</label>
                <Textarea
                  placeholder="Ex: efavirenz, dolutegravir (separados por vírgula)"
                  value={referenceCompounds}
                  onChange={(e) => setReferenceCompounds(e.target.value)}
                  className="h-16"
                />
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
                <Brain className="w-4 h-4 mr-2" />
                Projetar Moléculas
              </>
            )}
          </Button>
        </div>

        {/* Design Progress */}
        {isDesigning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
              <span className="text-sm font-medium">Projetando moléculas...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${designProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentStep}</p>
          </div>
        )}

        {/* Design Results */}
        {designResult && isExpanded && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Moléculas Projetadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {designResult.designedMolecules.length} moléculas
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDesignReport}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Top Designed Molecules */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {designResult.designedMolecules.slice(0, 5).map((molecule, index) => (
                <Card key={index} className="p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-purple-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium flex items-center gap-1">
                        <Dna className="w-3 h-3" />
                        {molecule.name}
                      </h5>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadMolecule(molecule)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Fórmula:</span>
                        <div className="font-mono">{molecule.formula}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MW:</span>
                        <div>{molecule.properties.molecularWeight.toFixed(0)} Da</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className={cn("font-semibold", getScoreColor(molecule.drugLikeness.score))}>
                          {(molecule.drugLikeness.score * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground">Drug-like</div>
                      </div>
                      <div className="text-center">
                        <div className={cn("font-semibold", getScoreColor(molecule.targetAffinity.predictedBinding))}>
                          {(molecule.targetAffinity.predictedBinding * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground">Afinidade</div>
                      </div>
                      <div className="text-center">
                        <div className={cn("font-semibold", getScoreColor(molecule.novelty))}>
                          {(molecule.novelty * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground">Novidade</div>
                      </div>
                    </div>
                    
                    {molecule.synthesisRoute && (
                      <div className="flex items-center gap-1 text-xs">
                        <FlaskConical className="w-3 h-3" />
                        <span className="text-muted-foreground">Síntese:</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            molecule.synthesisRoute.complexity === 'low' ? 'border-green-300 text-green-700' :
                            molecule.synthesisRoute.complexity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-red-300 text-red-700'
                          )}
                        >
                          {molecule.synthesisRoute.complexity}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                      <strong>Rationale:</strong> {molecule.reasoning}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Risk Assessment */}
            {designResult.riskAssessment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Avaliação de Riscos</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className={cn("p-2 rounded text-center text-xs border", getRiskColor(designResult.riskAssessment.toxicityRisk))}>
                    <div className="font-medium">Toxicidade</div>
                    <div>{designResult.riskAssessment.toxicityRisk}</div>
                  </div>
                  <div className={cn("p-2 rounded text-center text-xs border", getRiskColor(designResult.riskAssessment.developmentRisk))}>
                    <div className="font-medium">Desenvolvimento</div>
                    <div>{designResult.riskAssessment.developmentRisk}</div>
                  </div>
                  <div className={cn("p-2 rounded text-center text-xs border", getRiskColor(designResult.riskAssessment.patentRisk))}>
                    <div className="font-medium">Patente</div>
                    <div>{designResult.riskAssessment.patentRisk}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Design Rationale */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Rationale de Design</span>
              </div>
              <div className="text-xs bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                {designResult.designRationale}
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isExpanded && !designResult && (
          <div className="text-xs text-muted-foreground text-center py-4">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Projete moléculas personalizadas com IA</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

