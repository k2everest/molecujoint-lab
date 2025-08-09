import React from 'react';
import { useMolecularStore } from '../../store/molecularStore';
import { calculateMolecularFormula, calculateMolecularWeight, calculateCenterOfMass } from '../../utils/molecular';

export const MolecularStatus: React.FC = () => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  
  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  if (!activeMolecule) {
    return (
      <div className="bg-card border-t border-border p-4">
        <div className="text-sm text-muted-foreground">
          Nenhuma molécula ativa
        </div>
      </div>
    );
  }

  const formula = calculateMolecularFormula(activeMolecule.atoms);
  const molecularWeight = calculateMolecularWeight(activeMolecule.atoms);
  const centerOfMass = calculateCenterOfMass(activeMolecule.atoms);

  const stats = [
    { label: 'Fórmula', value: formula },
    { label: 'Peso Molecular', value: `${molecularWeight.toFixed(2)} g/mol` },
    { label: 'Átomos', value: activeMolecule.atoms.length.toString() },
    { label: 'Ligações', value: activeMolecule.bonds.length.toString() },
    { 
      label: 'Centro de Massa', 
      value: `(${centerOfMass[0].toFixed(2)}, ${centerOfMass[1].toFixed(2)}, ${centerOfMass[2].toFixed(2)})` 
    },
  ];

  if (activeMolecule.energy) {
    stats.push({ 
      label: 'Energia', 
      value: `${activeMolecule.energy.toFixed(3)} kcal/mol` 
    });
  }

  if (activeMolecule.dipoleMoment) {
    stats.push({ 
      label: 'Momento Dipolar', 
      value: `${activeMolecule.dipoleMoment.toFixed(3)} D` 
    });
  }

  return (
    <div className="bg-card border-t border-border p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="text-muted-foreground text-xs font-medium">
              {stat.label}
            </div>
            <div className="text-card-foreground font-mono">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};