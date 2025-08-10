import React, { useMemo } from 'react';
import { Atom } from '../../types/molecular';
import * as THREE from 'three';

interface OrbitalVisualizationProps {
  atoms: Atom[];
  orbitalType: 'HOMO' | 'LUMO' | 's' | 'p' | 'd';
  showPositivePhase?: boolean;
  showNegativePhase?: boolean;
}

export const OrbitalVisualization: React.FC<OrbitalVisualizationProps> = ({
  atoms,
  orbitalType,
  showPositivePhase = true,
  showNegativePhase = true
}) => {
  const orbitalGeometry = useMemo(() => {
    // Create simplified orbital representations using spheres and lobes
    const geometries: THREE.BufferGeometry[] = [];
    
    atoms.forEach((atom) => {
      const [x, y, z] = atom.position;
      
      switch (orbitalType) {
        case 's':
          // S orbital: spherical
          const sGeometry = new THREE.SphereGeometry(0.8, 16, 16);
          sGeometry.translate(x, y, z);
          geometries.push(sGeometry);
          break;
          
        case 'p':
          // P orbital: dumbbell shape (two lobes)
          if (showPositivePhase) {
            const pPosGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            pPosGeometry.scale(1, 1.5, 1);
            pPosGeometry.translate(x, y + 0.8, z);
            geometries.push(pPosGeometry);
          }
          
          if (showNegativePhase) {
            const pNegGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            pNegGeometry.scale(1, 1.5, 1);
            pNegGeometry.translate(x, y - 0.8, z);
            geometries.push(pNegGeometry);
          }
          break;
          
        case 'd':
          // D orbital: more complex shape (simplified as multiple lobes)
          const dPositions = [
            [x + 0.8, y + 0.8, z],
            [x - 0.8, y + 0.8, z],
            [x + 0.8, y - 0.8, z],
            [x - 0.8, y - 0.8, z],
          ];
          
          dPositions.forEach(([dx, dy, dz]) => {
            const dGeometry = new THREE.SphereGeometry(0.4, 12, 12);
            dGeometry.translate(dx, dy, dz);
            geometries.push(dGeometry);
          });
          break;
          
        case 'HOMO':
        case 'LUMO':
          // Molecular orbitals: simplified as electron density clouds
          const moGeometry = new THREE.SphereGeometry(1.2, 20, 20);
          moGeometry.translate(x, y, z);
          geometries.push(moGeometry);
          break;
      }
    });
    
    // Merge all geometries
    if (geometries.length === 0) {
      return new THREE.BufferGeometry();
    }
    
    return geometries.reduce((merged, geom) => {
      return merged ? merged : geom;
    });
  }, [atoms, orbitalType, showPositivePhase, showNegativePhase]);

  const orbitalMaterials = useMemo(() => {
    const materials: THREE.Material[] = [];
    
    // Positive phase material (usually blue/red)
    if (showPositivePhase) {
      materials.push(new THREE.MeshPhongMaterial({
        color: orbitalType === 'HOMO' ? 0x2196F3 : 0xFF5722,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      }));
    }
    
    // Negative phase material (usually opposite color)
    if (showNegativePhase && (orbitalType === 'p' || orbitalType === 'd')) {
      materials.push(new THREE.MeshPhongMaterial({
        color: orbitalType === 'HOMO' ? 0xFF5722 : 0x2196F3,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      }));
    }
    
    return materials;
  }, [orbitalType, showPositivePhase, showNegativePhase]);

  if (atoms.length === 0) {
    return null;
  }

  return (
    <group>
      {/* Render positive phase */}
      {showPositivePhase && (
        <mesh geometry={orbitalGeometry}>
          <meshPhongMaterial
            color={orbitalType === 'HOMO' ? '#2196F3' : '#FF5722'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Render negative phase for p and d orbitals */}
      {showNegativePhase && (orbitalType === 'p' || orbitalType === 'd') && (
        <mesh geometry={orbitalGeometry}>
          <meshPhongMaterial
            color={orbitalType === 'HOMO' ? '#FF5722' : '#2196F3'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

