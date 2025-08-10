import React, { useMemo } from 'react';
import { Atom } from '../../types/molecular';
import * as THREE from 'three';

interface RibbonVisualizationProps {
  atoms: Atom[];
}

export const RibbonVisualization: React.FC<RibbonVisualizationProps> = ({ atoms }) => {
  const ribbonGeometry = useMemo(() => {
    // Create a simplified ribbon representation
    // This is a basic implementation - in a real application, you'd need
    // proper secondary structure detection and spline interpolation
    
    const points: THREE.Vector3[] = [];
    const carbonAtoms = atoms.filter(atom => atom.element === 'C');
    
    // Sort carbon atoms by position to create a continuous path
    carbonAtoms.sort((a, b) => {
      const distA = Math.sqrt(a.position[0]**2 + a.position[1]**2 + a.position[2]**2);
      const distB = Math.sqrt(b.position[0]**2 + b.position[1]**2 + b.position[2]**2);
      return distA - distB;
    });
    
    carbonAtoms.forEach(atom => {
      points.push(new THREE.Vector3(atom.position[0], atom.position[1], atom.position[2]));
    });
    
    if (points.length < 2) {
      return new THREE.BufferGeometry();
    }
    
    // Create a curve from the points
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Create tube geometry for the ribbon
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
    
    return tubeGeometry;
  }, [atoms]);

  const ribbonMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: 0x4CAF50,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
  }, []);

  if (atoms.length < 2) {
    return null;
  }

  return (
    <mesh geometry={ribbonGeometry} material={ribbonMaterial}>
      {/* Add some lighting effects */}
      <meshPhongMaterial
        color="#4CAF50"
        shininess={100}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

