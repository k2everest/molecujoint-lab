import React, { useMemo } from 'react';
import { Atom } from '../../types/molecular';
import * as THREE from 'three';

interface ElectronDensityVisualizationProps {
  atoms: Atom[];
  densityLevel?: number; // Isovalue for the density surface
  colorScheme?: 'rainbow' | 'redBlue' | 'grayscale';
}

export const ElectronDensityVisualization: React.FC<ElectronDensityVisualizationProps> = ({
  atoms,
  densityLevel = 0.02,
  colorScheme = 'rainbow'
}) => {
  const densityGeometry = useMemo(() => {
    // Create a simplified electron density visualization using metaballs
    // In a real implementation, this would use quantum mechanical calculations
    
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    
    // Grid parameters for density calculation
    const gridSize = 32;
    const bounds = {
      minX: Math.min(...atoms.map(a => a.position[0])) - 4,
      maxX: Math.max(...atoms.map(a => a.position[0])) + 4,
      minY: Math.min(...atoms.map(a => a.position[1])) - 4,
      maxY: Math.max(...atoms.map(a => a.position[1])) + 4,
      minZ: Math.min(...atoms.map(a => a.position[2])) - 4,
      maxZ: Math.max(...atoms.map(a => a.position[2])) + 4,
    };
    
    const stepX = (bounds.maxX - bounds.minX) / gridSize;
    const stepY = (bounds.maxY - bounds.minY) / gridSize;
    const stepZ = (bounds.maxZ - bounds.minZ) / gridSize;
    
    // Simplified density calculation using Gaussian functions
    const calculateDensity = (x: number, y: number, z: number): number => {
      let density = 0;
      
      atoms.forEach(atom => {
        const dx = x - atom.position[0];
        const dy = y - atom.position[1];
        const dz = z - atom.position[2];
        const distSq = dx * dx + dy * dy + dz * dz;
        
        // Gaussian function for electron density
        // Different elements have different electron densities
        const atomicNumber = getAtomicNumber(atom.element);
        const exponent = -2.0 * distSq; // Simplified exponent
        density += atomicNumber * Math.exp(exponent);
      });
      
      return density;
    };
    
    // Generate isosurface using marching cubes (simplified)
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        for (let k = 0; k < gridSize - 1; k++) {
          const x = bounds.minX + i * stepX;
          const y = bounds.minY + j * stepY;
          const z = bounds.minZ + k * stepZ;
          
          const density = calculateDensity(x, y, z);
          
          if (density > densityLevel) {
            // Create a small cube at this position
            const cubeSize = Math.min(stepX, stepY, stepZ) * 0.8;
            addCube(vertices, colors, indices, x, y, z, cubeSize, density);
          }
        }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [atoms, densityLevel]);

  const addCube = (
    vertices: number[],
    colors: number[],
    indices: number[],
    x: number,
    y: number,
    z: number,
    size: number,
    density: number
  ) => {
    const half = size / 2;
    const vertexOffset = vertices.length / 3;
    
    // Cube vertices
    const cubeVertices = [
      [x - half, y - half, z - half],
      [x + half, y - half, z - half],
      [x + half, y + half, z - half],
      [x - half, y + half, z - half],
      [x - half, y - half, z + half],
      [x + half, y - half, z + half],
      [x + half, y + half, z + half],
      [x - half, y + half, z + half],
    ];
    
    // Add vertices
    cubeVertices.forEach(vertex => {
      vertices.push(vertex[0], vertex[1], vertex[2]);
      
      // Color based on density and color scheme
      const color = getDensityColor(density, colorScheme);
      colors.push(color.r, color.g, color.b);
    });
    
    // Cube faces (triangles)
    const cubeIndices = [
      0, 1, 2, 0, 2, 3, // front
      4, 7, 6, 4, 6, 5, // back
      0, 4, 5, 0, 5, 1, // bottom
      2, 6, 7, 2, 7, 3, // top
      0, 3, 7, 0, 7, 4, // left
      1, 5, 6, 1, 6, 2, // right
    ];
    
    cubeIndices.forEach(index => {
      indices.push(index + vertexOffset);
    });
  };

  const getAtomicNumber = (element: string): number => {
    const atomicNumbers: Record<string, number> = {
      'H': 1, 'C': 6, 'N': 7, 'O': 8, 'F': 9,
      'P': 15, 'S': 16, 'Cl': 17, 'Br': 35, 'I': 53
    };
    return atomicNumbers[element] || 1;
  };

  const getDensityColor = (density: number, scheme: string): { r: number; g: number; b: number } => {
    const normalizedDensity = Math.min(density / 0.1, 1); // Normalize to 0-1
    
    switch (scheme) {
      case 'rainbow':
        // Rainbow color scheme
        const hue = (1 - normalizedDensity) * 240; // Blue to red
        return hslToRgb(hue / 360, 1, 0.5);
        
      case 'redBlue':
        // Red-blue color scheme
        return {
          r: normalizedDensity,
          g: 0,
          b: 1 - normalizedDensity
        };
        
      case 'grayscale':
        // Grayscale
        return {
          r: normalizedDensity,
          g: normalizedDensity,
          b: normalizedDensity
        };
        
      default:
        return { r: 0.5, g: 0.5, b: 1 };
    }
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
      r: r + m,
      g: g + m,
      b: b + m
    };
  };

  if (atoms.length === 0) {
    return null;
  }

  return (
    <mesh geometry={densityGeometry}>
      <meshPhongMaterial
        vertexColors
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

