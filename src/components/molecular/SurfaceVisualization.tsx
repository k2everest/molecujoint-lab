import React, { useMemo } from 'react';
import { Atom } from '../../types/molecular';
import * as THREE from 'three';

interface SurfaceVisualizationProps {
  atoms: Atom[];
  surfaceType?: 'vanDerWaals' | 'solventAccessible' | 'electrostaticPotential';
}

export const SurfaceVisualization: React.FC<SurfaceVisualizationProps> = ({ 
  atoms, 
  surfaceType = 'vanDerWaals' 
}) => {
  const surfaceGeometry = useMemo(() => {
    // Create a simplified molecular surface using metaballs/isosurfaces
    // This is a basic implementation using spheres around atoms
    
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    
    // Van der Waals radii for common elements (in Angstroms)
    const vdwRadii: Record<string, number> = {
      'H': 1.2,
      'C': 1.7,
      'N': 1.55,
      'O': 1.52,
      'F': 1.47,
      'P': 1.8,
      'S': 1.8,
      'Cl': 1.75,
      'Br': 1.85,
      'I': 1.98,
    };
    
    // Create a grid for marching cubes algorithm (simplified)
    const gridSize = 32;
    const bounds = {
      minX: Math.min(...atoms.map(a => a.position[0])) - 3,
      maxX: Math.max(...atoms.map(a => a.position[0])) + 3,
      minY: Math.min(...atoms.map(a => a.position[1])) - 3,
      maxY: Math.max(...atoms.map(a => a.position[1])) + 3,
      minZ: Math.min(...atoms.map(a => a.position[2])) - 3,
      maxZ: Math.max(...atoms.map(a => a.position[2])) + 3,
    };
    
    const stepX = (bounds.maxX - bounds.minX) / gridSize;
    const stepY = (bounds.maxY - bounds.minY) / gridSize;
    const stepZ = (bounds.maxZ - bounds.minZ) / gridSize;
    
    // Simplified surface generation using icosphere around each atom
    atoms.forEach((atom, atomIndex) => {
      const radius = (vdwRadii[atom.element] || 1.5) * 1.2; // Scale factor for surface
      const icosphere = new THREE.IcosahedronGeometry(radius, 2);
      
      // Position the sphere at the atom's location
      const matrix = new THREE.Matrix4().makeTranslation(
        atom.position[0],
        atom.position[1],
        atom.position[2]
      );
      
      icosphere.applyMatrix4(matrix);
      
      // Add vertices and indices
      const positionAttribute = icosphere.getAttribute('position');
      const indexAttribute = icosphere.getIndex();
      
      if (positionAttribute && indexAttribute) {
        const vertexOffset = vertices.length / 3;
        
        // Add vertices
        for (let i = 0; i < positionAttribute.count; i++) {
          vertices.push(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          );
        }
        
        // Add indices with offset
        for (let i = 0; i < indexAttribute.count; i++) {
          indices.push(indexAttribute.getX(i) + vertexOffset);
        }
      }
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [atoms, surfaceType]);

  const surfaceMaterial = useMemo(() => {
    const colors: Record<string, number> = {
      vanDerWaals: 0x2196F3,
      solventAccessible: 0xFF9800,
      electrostaticPotential: 0x9C27B0,
    };
    
    return new THREE.MeshPhongMaterial({
      color: colors[surfaceType],
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      shininess: 30,
    });
  }, [surfaceType]);

  if (atoms.length === 0) {
    return null;
  }

  return (
    <mesh geometry={surfaceGeometry} material={surfaceMaterial}>
      <meshPhongMaterial
        color={surfaceType === 'vanDerWaals' ? '#2196F3' : 
              surfaceType === 'solventAccessible' ? '#FF9800' : '#9C27B0'}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        shininess={30}
      />
    </mesh>
  );
};

