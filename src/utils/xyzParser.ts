import { Atom, Molecule, Bond, ELEMENT_DATA } from '../types/molecular';
import { generateId } from './molecular';

export const parseXYZ = (content: string): Molecule | null => {
  const lines = content.trim().split('\n');
  if (lines.length < 3) {
    console.error('Conteúdo XYZ inválido: poucas linhas.');
    return null;
  }

  const numAtoms = parseInt(lines[0].trim(), 10);
  if (isNaN(numAtoms) || numAtoms <= 0) {
    console.error('Conteúdo XYZ inválido: número de átomos inválido.');
    return null;
  }

  const moleculeName = lines[1].trim();
  const atoms: Atom[] = [];

  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length < 4) {
      console.warn(`Linha XYZ inválida (ignorada): ${lines[i]}`);
      continue;
    }

    const element = parts[0];
    const x = parseFloat(parts[1]);
    const y = parseFloat(parts[2]);
    const z = parseFloat(parts[3]);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      console.warn(`Coordenadas XYZ inválidas (ignoradas): ${lines[i]}`);
      continue;
    }

    atoms.push({
      id: generateId(),
      element,
      position: [x, y, z],
      color: ELEMENT_DATA[element]?.color || '#CCCCCC',
      radius: ELEMENT_DATA[element]?.radius || 0.5,
    });
  }

  // Simple bond detection based on distance
  const bonds: Bond[] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      const dx = atom1.position[0] - atom2.position[0];
      const dy = atom1.position[1] - atom2.position[1];
      const dz = atom1.position[2] - atom2.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // A simple heuristic for bond detection (can be improved)
      // Sum of covalent radii * 1.2 (common factor for bond detection)
      const maxDistance = (ELEMENT_DATA[atom1.element]?.covalentRadius || 0.7) + (ELEMENT_DATA[atom2.element]?.covalentRadius || 0.7) + 0.4; // Added a small buffer

      if (distance < maxDistance) {
        bonds.push({
          id: generateId(),
          atom1Id: atom1.id,
          atom2Id: atom2.id,
          bondType: 'single', // Default to single, can be improved with more sophisticated logic
          length: distance,
        });
      }
    }
  }

  return {
    id: generateId(),
    name: moleculeName || 'Unnamed Molecule',
    atoms,
    bonds,
  };
};

export const moleculeToXYZ = (molecule: Molecule): string => {
  let xyzContent = `${molecule.atoms.length}\n`;
  xyzContent += `${molecule.name}\n`;
  molecule.atoms.forEach(atom => {
    xyzContent += `${atom.element} ${atom.position[0].toFixed(4)} ${atom.position[1].toFixed(4)} ${atom.position[2].toFixed(4)}\n`;
  });
  return xyzContent;
};

