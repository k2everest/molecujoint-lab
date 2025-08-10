import React from 'react';
import { Atom } from '../../types/molecular';
import { Atom3D } from './Atom3D';
import { Bond3D } from './Bond3D';
import { RibbonVisualization } from './RibbonVisualization';
import { SurfaceVisualization } from './SurfaceVisualization';

interface MolecularVisualizationModesProps {
  atoms: Atom[];
  bonds: Array<{ atom1: string; atom2: string; order: number }>;
  viewMode: 'spheres' | 'sticks' | 'ballAndStick' | 'spaceFill' | 'ribbon' | 'surface';
  showLabels: boolean;
  onAtomClick?: (atomId: string) => void;
  onAtomDrag?: (atomId: string, position: [number, number, number]) => void;
}

export const MolecularVisualizationModes: React.FC<MolecularVisualizationModesProps> = ({
  atoms,
  bonds,
  viewMode,
  showLabels,
  onAtomClick,
  onAtomDrag
}) => {
  const renderAtoms = () => {
    return atoms.map((atom) => (
      <Atom3D
        key={atom.id}
        atom={atom}
        viewMode={viewMode}
        showLabel={showLabels}
        onClick={onAtomClick}
        onDrag={onAtomDrag}
      />
    ));
  };

  const renderBonds = () => {
    return bonds.map((bond, index) => {
      const atom1 = atoms.find(a => a.id === bond.atom1);
      const atom2 = atoms.find(a => a.id === bond.atom2);
      
      if (!atom1 || !atom2) return null;

      return (
        <Bond3D
          key={`${bond.atom1}-${bond.atom2}-${index}`}
          atom1={atom1}
          atom2={atom2}
          order={bond.order}
          viewMode={viewMode}
        />
      );
    });
  };

  const renderRibbon = () => {
    // Ribbon visualization for protein secondary structures
    if (viewMode === 'ribbon') {
      return <RibbonVisualization atoms={atoms} />;
    }
    return null;
  };

  const renderSurface = () => {
    // Surface visualization for molecular surfaces
    if (viewMode === 'surface') {
      return <SurfaceVisualization atoms={atoms} />;
    }
    return null;
  };

  return (
    <group>
      {/* Render atoms for all modes except pure ribbon/surface */}
      {viewMode !== 'ribbon' && viewMode !== 'surface' && renderAtoms()}
      
      {/* Render bonds for stick and ball-and-stick modes */}
      {(viewMode === 'sticks' || viewMode === 'ballAndStick') && renderBonds()}
      
      {/* Render ribbon for protein structures */}
      {renderRibbon()}
      
      {/* Render molecular surfaces */}
      {renderSurface()}
    </group>
  );
};

