import React from 'react';
import { useMolecularStore } from '../../store/molecularStore';
import { calculateMolecularFormula, calculateMolecularWeight, calculateCenterOfMass } from '../../utils/molecular';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Activity, Atom, Zap } from 'lucide-react';

export const MolecularStatus: React.FC = () => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  
  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  if (!activeMolecule) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted animate-pulse"></div>
          Nenhuma molécula ativa
        </div>
      </div>
    );
  }

  const formula = calculateMolecularFormula(activeMolecule.atoms);
  const molecularWeight = calculateMolecularWeight(activeMolecule.atoms);
  const centerOfMass = calculateCenterOfMass(activeMolecule.atoms);

  const basicStats = [
    { 
      label: 'Molécula', 
      value: activeMolecule.name,
      icon: <Atom className="w-3 h-3" />
    },
    { 
      label: 'Fórmula', 
      value: formula,
      icon: <Activity className="w-3 h-3" />
    },
    { 
      label: 'Peso Molecular', 
      value: `${molecularWeight.toFixed(2)} g/mol`,
      icon: <Zap className="w-3 h-3" />
    },
    { label: 'Átomos', value: activeMolecule.atoms.length.toString() },
    { label: 'Ligações', value: activeMolecule.bonds.length.toString() },
    { 
      label: 'Centro de Massa', 
      value: `(${centerOfMass[0].toFixed(2)}, ${centerOfMass[1].toFixed(2)}, ${centerOfMass[2].toFixed(2)})` 
    },
  ];

  const energyStats = [];
  if (activeMolecule.energy) {
    energyStats.push({ 
      label: 'Energia', 
      value: `${activeMolecule.energy.toFixed(3)} kcal/mol`,
      type: 'energy'
    });
  }

  if (activeMolecule.dipoleMoment) {
    energyStats.push({ 
      label: 'Momento Dipolar', 
      value: `${activeMolecule.dipoleMoment.toFixed(3)} D`,
      type: 'dipole'
    });
  }

  return (
    <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-4">
      <div className="flex items-center justify-between">
        {/* Basic Information */}
        <div className="flex items-center gap-6">
          {basicStats.slice(0, 3).map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              {stat.icon && (
                <div className="text-primary">
                  {stat.icon}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
                <div className="text-sm text-card-foreground font-mono">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator orientation="vertical" className="h-12" />

        {/* Structural Information */}
        <div className="flex items-center gap-4">
          {basicStats.slice(3, 5).map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <Separator orientation="vertical" className="h-12" />

        {/* Energy Information */}
        <div className="flex items-center gap-4">
          {energyStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge 
                variant={stat.type === 'energy' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {stat.label}: {stat.value}
              </Badge>
            </div>
          ))}
          {energyStats.length === 0 && (
            <div className="text-xs text-muted-foreground">
              Clique em "Calcular propriedades" para ver energia e momento dipolar
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-12" />

        {/* Center of Mass */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium">
            Centro de Massa
          </div>
          <div className="text-xs text-card-foreground font-mono">
            {basicStats[5].value}
          </div>
        </div>
      </div>
    </div>
  );
};