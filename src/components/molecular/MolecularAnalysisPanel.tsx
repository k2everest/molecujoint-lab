import React, { useState, useEffect } from 'react';
import { useMolecularStore } from '../../store/molecularStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Atom, 
  Ruler, 
  Triangle, 
  RotateCcw, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Target,
  Microscope
} from 'lucide-react';

interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  z: number;
}

interface HydrogenBond {
  donor: Atom;
  acceptor: Atom;
  hydrogen: Atom;
  distance: number;
  angle: number;
}

export const MolecularAnalysisPanel: React.FC = () => {
  const { 
    molecules, 
    activeMoleculeId, 
    calculateDistance, 
    calculateAngle, 
    calculateTorsion, 
    detectHydrogenBonds 
  } = useMolecularStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [hydrogenBonds, setHydrogenBonds] = useState<HydrogenBond[]>([]);
  const [measurements, setMeasurements] = useState<{
    distances: { atoms: string[]; value: number }[];
    angles: { atoms: string[]; value: number }[];
    torsions: { atoms: string[]; value: number }[];
  }>({
    distances: [],
    angles: [],
    torsions: []
  });

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  useEffect(() => {
    if (activeMolecule && activeMoleculeId) {
      // Detectar pontes de hidrogênio
      const bonds = detectHydrogenBonds(activeMoleculeId);
      setHydrogenBonds(bonds);

      // Calcular algumas medidas automáticas para demonstração
      if (activeMolecule.atoms.length >= 2) {
        const newMeasurements = {
          distances: [],
          angles: [],
          torsions: []
        };

        // Calcular distâncias entre átomos ligados
        activeMolecule.bonds.forEach(bond => {
          const atom1 = activeMolecule.atoms.find(a => a.id === bond.atom1Id);
          const atom2 = activeMolecule.atoms.find(a => a.id === bond.atom2Id);
          if (atom1 && atom2) {
            const distance = calculateDistance(activeMoleculeId, bond.atom1Id, bond.atom2Id);
            if (distance !== null) {
              newMeasurements.distances.push({
                atoms: [atom1.element, atom2.element],
                value: distance
              });
            }
          }
        });

        // Calcular ângulos para moléculas com 3+ átomos
        if (activeMolecule.atoms.length >= 3) {
          // Encontrar ângulos baseados nas ligações
          activeMolecule.atoms.forEach(centralAtom => {
            const connectedBonds = activeMolecule.bonds.filter(bond => 
              bond.atom1Id === centralAtom.id || bond.atom2Id === centralAtom.id
            );
            
            if (connectedBonds.length >= 2) {
              for (let i = 0; i < connectedBonds.length; i++) {
                for (let j = i + 1; j < connectedBonds.length; j++) {
                  const bond1 = connectedBonds[i];
                  const bond2 = connectedBonds[j];
                  
                  const atom1Id = bond1.atom1Id === centralAtom.id ? bond1.atom2Id : bond1.atom1Id;
                  const atom2Id = bond2.atom1Id === centralAtom.id ? bond2.atom2Id : bond2.atom1Id;
                  
                  const atom1 = activeMolecule.atoms.find(a => a.id === atom1Id);
                  const atom2 = activeMolecule.atoms.find(a => a.id === atom2Id);
                  
                  if (atom1 && atom2) {
                    const angle = calculateAngle(activeMoleculeId, atom1Id, centralAtom.id, atom2Id);
                    if (angle !== null) {
                      newMeasurements.angles.push({
                        atoms: [atom1.element, centralAtom.element, atom2.element],
                        value: angle
                      });
                    }
                  }
                }
              }
            }
          });
        }

        setMeasurements(newMeasurements);
      }
    }
  }, [activeMolecule, activeMoleculeId, detectHydrogenBonds, calculateDistance, calculateAngle]);

  if (!activeMolecule) {
    return (
      <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            Análise Molecular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Nenhuma molécula ativa para análise
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            Análise Molecular
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
        <div className="text-sm text-muted-foreground">
          {activeMolecule.name}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Distâncias */}
          {measurements.distances.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Ruler className="w-4 h-4 text-blue-500" />
                Distâncias de Ligação
              </div>
              <div className="space-y-1">
                {measurements.distances.slice(0, 3).map((dist, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1">
                    <span className="font-mono">
                      {dist.atoms[0]}—{dist.atoms[1]}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {dist.value.toFixed(3)} Å
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ângulos */}
          {measurements.angles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Triangle className="w-4 h-4 text-green-500" />
                Ângulos de Ligação
              </div>
              <div className="space-y-1">
                {measurements.angles.slice(0, 3).map((angle, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1">
                    <span className="font-mono">
                      {angle.atoms[0]}—{angle.atoms[1]}—{angle.atoms[2]}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {angle.value.toFixed(1)}°
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pontes de Hidrogênio */}
          {hydrogenBonds.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4 text-yellow-500" />
                Pontes de Hidrogênio
              </div>
              <div className="space-y-1">
                {hydrogenBonds.map((bond, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1">
                      <span className="font-mono">
                        {bond.donor.element}—H···{bond.acceptor.element}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {bond.distance.toFixed(2)} Å
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground px-2">
                      Ângulo: {bond.angle.toFixed(1)}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Propriedades Energéticas */}
          {(activeMolecule.energy || activeMolecule.dipoleMoment) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="w-4 h-4 text-purple-500" />
                  Propriedades
                </div>
                <div className="space-y-1">
                  {activeMolecule.energy && (
                    <div className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1">
                      <span>Energia Total</span>
                      <Badge variant="secondary" className="text-xs">
                        {activeMolecule.energy.toFixed(2)} kcal/mol
                      </Badge>
                    </div>
                  )}
                  {activeMolecule.dipoleMoment && (
                    <div className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1">
                      <span>Momento Dipolar</span>
                      <Badge variant="secondary" className="text-xs">
                        {activeMolecule.dipoleMoment.toFixed(2)} D
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Estatísticas Gerais */}
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded px-2 py-1 text-center">
              <div className="font-medium">{activeMolecule.atoms.length}</div>
              <div className="text-muted-foreground">Átomos</div>
            </div>
            <div className="bg-muted/50 rounded px-2 py-1 text-center">
              <div className="font-medium">{activeMolecule.bonds.length}</div>
              <div className="text-muted-foreground">Ligações</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

