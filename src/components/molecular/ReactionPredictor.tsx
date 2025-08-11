import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Beaker, Zap, Shield } from 'lucide-react';
import { useMolecularStore } from '../../store/molecularStore';
import { Molecule, Atom } from '../../types/molecular';
import { toast } from 'sonner';

interface ReactionPrediction {
  type: 'favorable' | 'unfavorable' | 'unstable' | 'reactive';
  probability: number;
  energy: number;
  barrier: number;
  products: string[];
  mechanism: string;
  warnings: string[];
}

interface MovementPrediction {
  isAllowed: boolean;
  energyChange: number;
  strainEnergy: number;
  bondChanges: {
    broken: string[];
    formed: string[];
    weakened: string[];
  };
  stability: 'stable' | 'metastable' | 'unstable';
  reactionPath?: string;
}

export const ReactionPredictor: React.FC = () => {
  const { molecules, activeMoleculeId, lastAtomMovement } = useMolecularStore();
  const [prediction, setPrediction] = useState<MovementPrediction | null>(null);
  const [reactionPrediction, setReactionPrediction] = useState<ReactionPrediction | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  useEffect(() => {
    const predictMovementConsequences = async (movement: { atomId: string; oldPosition: [number, number, number]; newPosition: [number, number, number] }, molecule: Molecule) => {
      setAnalyzing(true);
      
      // Simular análise de consequências de movimento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const energyChange = calculateEnergyChange(movement, molecule);
      const strainEnergy = calculateStrainEnergy(movement, molecule);
      const bondChanges = analyzeBondChanges(movement, molecule);
      
      const movementPrediction: MovementPrediction = {
        isAllowed: strainEnergy < 50 && energyChange < 100,
        energyChange,
        strainEnergy,
        bondChanges,
        stability: strainEnergy < 20 ? 'stable' : strainEnergy < 50 ? 'metastable' : 'unstable',
        reactionPath: energyChange > 50 ? 'SN2 displacement possible' : undefined
      };

      setPrediction(movementPrediction);
      
      if (!movementPrediction.isAllowed) {
        toast.error(`Movimento não recomendado: alta energia de deformação (${strainEnergy.toFixed(1)} kcal/mol)`);
      } else if (movementPrediction.reactionPath) {
        toast.warning(`Possível reação: ${movementPrediction.reactionPath}`);
      }

      // Prever reações possíveis
      if (energyChange > 30) {
        const reaction = predictReaction(molecule, movement);
        setReactionPrediction(reaction);
      }

      setAnalyzing(false);
    };

    if (lastAtomMovement && activeMolecule) {
      predictMovementConsequences(lastAtomMovement, activeMolecule);
    }
  }, [lastAtomMovement, activeMolecule, calculateEnergyChange, calculateStrainEnergy, analyzeBondChanges, predictReaction]);

  const calculateEnergyChange = useCallback((movement: { oldPosition: [number, number, number]; newPosition: [number, number, number] }, molecule: Molecule): number => {
    // Simulação simplificada de mudança de energia
    const distanceFromEquilibrium = Math.sqrt(
      Math.pow(movement.newPosition[0] - movement.oldPosition[0], 2) +
      Math.pow(movement.newPosition[1] - movement.oldPosition[1], 2) +
      Math.pow(movement.newPosition[2] - movement.oldPosition[2], 2)
    );
    
    return distanceFromEquilibrium * 15 + Math.random() * 20;
  }, []);

  const calculateStrainEnergy = useCallback((movement: { atomId: string; newPosition: [number, number, number] }, molecule: Molecule): number => {
    // Calcular energia de deformação baseada na mudança de geometria
    const atom = molecule.atoms.find(a => a.id === movement.atomId);
    if (!atom) return 0;

    const bonds = molecule.bonds.filter(b => b.atom1Id === movement.atomId || b.atom2Id === movement.atomId);
    let strain = 0;

    bonds.forEach(bond => {
      const otherAtomId = bond.atom1Id === movement.atomId ? bond.atom2Id : bond.atom1Id;
      const otherAtom = molecule.atoms.find(a => a.id === otherAtomId);
      if (otherAtom) {
        const newDistance = Math.sqrt(
          Math.pow(movement.newPosition[0] - otherAtom.position[0], 2) +
          Math.pow(movement.newPosition[1] - otherAtom.position[1], 2) +
          Math.pow(movement.newPosition[2] - otherAtom.position[2], 2)
        );
        
        const idealDistance = getIdealBondLength(atom.element, otherAtom.element, bond.type);
        const deviation = Math.abs(newDistance - idealDistance);
        strain += Math.pow(deviation * 100, 2); // Força harmônica
      }
    });

    return strain;
  }, [getIdealBondLength]);

  const analyzeBondChanges = useCallback((movement: { atomId: string; newPosition: [number, number, number] }, molecule: Molecule) => {
    const broken: string[] = [];
    const formed: string[] = [];
    const weakened: string[] = [];

    // Análise simplificada de mudanças de ligação
    const atom = molecule.atoms.find(a => a.id === movement.atomId);
    const bonds = molecule.bonds.filter(b => b.atom1Id === movement.atomId || b.atom2Id === movement.atomId);

    bonds.forEach(bond => {
      const otherAtomId = bond.atom1Id === movement.atomId ? bond.atom2Id : bond.atom1Id;
      const otherAtom = molecule.atoms.find(a => a.id === otherAtomId);
      if (otherAtom) {
        const newDistance = Math.sqrt(
          Math.pow(movement.newPosition[0] - otherAtom.position[0], 2) +
          Math.pow(movement.newPosition[1] - otherAtom.position[1], 2) +
          Math.pow(movement.newPosition[2] - otherAtom.position[2], 2)
        );

        if (newDistance > 3.0) {
          broken.push(`${atom?.element}-${otherAtom.element}`);
        } else if (newDistance > 2.0) {
          weakened.push(`${atom?.element}-${otherAtom.element}`);
        }
      }
    });

    return { broken, formed, weakened };
  }, []);

  const predictReaction = useCallback((molecule: Molecule, movement: { atomId: string; oldPosition: [number, number, number]; newPosition: [number, number, number] }): ReactionPrediction =>    const hasElectrophile = molecule.atoms.some(a => ['C'].includes(a.element) && a.charge && a.charge > 0);
    const hasNucleophile = molecule.atoms.some(a => ['N', 'O', 'S'].includes(a.element));
    const hasLeavingGroup = molecule.atoms.some(a => ['Cl', 'Br', 'I'].includes(a.element));let type: ReactionPrediction[\'type\'] = \'favorable\';
    let mechanism = \'Geometric rearrangement\';
    let products = [\'Rearranged molecule\'];
    const warnings: string[] = [];

    if (hasElectrophile && hasNucleophile) {
      mechanism = \'Nucleophilic substitution (SN2)\';
      products = [\'Substituted product\', \'Leaving group\'];
      type = \'reactive\';
      warnings.push(\'High reactivity expected\');
    }

    if (hasLeavingGroup) {
      mechanism = \'Elimination reaction (E2)\';
      products = [\'Alkene\', \'Hydrogen halide\'];
      warnings.push(\'Base required for elimination\');
    }

    return {
      type,
      probability: 0.7 + Math.random() * 0.3,
      energy: -15 + Math.random() * 30,
      barrier: 20 + Math.random() * 40,
      products,
      mechanism,
      warnings
    };
  }, []);

  const getIdealBondLength = (element1: string, element2: string, bondType: string): number => {
    const bondLengths: Record<string, Record<string, number>> = {
      'single': { 'C-C': 1.54, 'C-H': 1.09, 'C-O': 1.43, 'C-N': 1.47, 'O-H': 0.96, 'N-H': 1.01 },
      'double': { 'C-C': 1.34, 'C-O': 1.23, 'C-N': 1.28 },
      'triple': { 'C-C': 1.20, 'C-N': 1.16 }
    };

    const key = `${element1}-${element2}`;
    const reverseKey = `${element2}-${element1}`;
    
    return bondLengths[bondType]?.[key] || bondLengths[bondType]?.[reverseKey] || 1.5;
  };

  if (!activeMolecule) return null;

  return (
    <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Beaker className="w-5 h-5 text-primary" />
          Predição de Reações
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {analyzing && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Analisando movimento...</div>
            <Progress value={60} className="w-full" />
          </div>
        )}

        {prediction && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {prediction.isAllowed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                Movimento {prediction.isAllowed ? 'Permitido' : 'Não Recomendado'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2 rounded">
                <div className="text-muted-foreground">Mudança de Energia</div>
                <div className="font-semibold">{prediction.energyChange.toFixed(1)} kcal/mol</div>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <div className="text-muted-foreground">Energia de Deformação</div>
                <div className="font-semibold">{prediction.strainEnergy.toFixed(1)} kcal/mol</div>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant={prediction.stability === 'stable' ? 'default' : 
                           prediction.stability === 'metastable' ? 'secondary' : 'destructive'}>
                {prediction.stability === 'stable' ? 'Estável' :
                 prediction.stability === 'metastable' ? 'Metaestável' : 'Instável'}
              </Badge>

              {prediction.bondChanges.broken.length > 0 && (
                <div className="text-xs">
                  <span className="text-red-500">Ligações quebradas:</span> {prediction.bondChanges.broken.join(', ')}
                </div>
              )}

              {prediction.bondChanges.weakened.length > 0 && (
                <div className="text-xs">
                  <span className="text-yellow-500">Ligações enfraquecidas:</span> {prediction.bondChanges.weakened.join(', ')}
                </div>
              )}

              {prediction.reactionPath && (
                <div className="text-xs text-blue-500">
                  Possível reação: {prediction.reactionPath}
                </div>
              )}
            </div>
          </div>
        )}

        {reactionPrediction && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Predição de Reação</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">Mecanismo:</span> {reactionPrediction.mechanism}
              </div>
              
              <div className="text-xs">
                <span className="font-medium">Produtos esperados:</span>
                <div className="mt-1">{reactionPrediction.products.join(', ')}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="text-muted-foreground">Probabilidade</div>
                  <div className="font-semibold">{(reactionPrediction.probability * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="text-muted-foreground">Barreira</div>
                  <div className="font-semibold">{reactionPrediction.barrier.toFixed(1)} kcal/mol</div>
                </div>
              </div>

              {reactionPrediction.warnings.length > 0 && (
                <div className="space-y-1">
                  {reactionPrediction.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs text-orange-500">
                      <AlertTriangle className="w-3 h-3" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => toast.info('Análise quântica não implementada (requer Schrödinger/Gaussian)')}
        >
          <Shield className="w-3 h-3 mr-1" />
          Análise Quântica (DFT)
        </Button>
      </CardContent>
    </Card>
  );
};