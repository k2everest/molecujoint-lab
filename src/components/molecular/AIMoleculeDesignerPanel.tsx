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
  const { addMoleculeToCollection } = useMolecularStore();

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
      setCurrentStep('Design completo!');
      
    } catch (error) {
      console.error('Erro no design de moléculas:', error);
    } finally {
      setIsDesigning(false);
    }
  };

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Molecule Designer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Doença ou alvo terapêutico..."
            value={targetDisease}
            onChange={(e) => setTargetDisease(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleDesignMolecules}
          disabled={isDesigning || !targetDisease.trim()}
          className="w-full"
        >
          {isDesigning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Designing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Design Molecules
            </>
          )}
        </Button>

        {designResult && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Moléculas Projetadas:</div>
            {designResult.designs.map((mol, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                <div className="font-semibold">{mol.name}</div>
                <div>Score: {mol.score.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};