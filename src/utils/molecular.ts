import { Atom, Bond, Molecule } from '../types/molecular';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[1] - pos2[1], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
};

export const calculateMolecularFormula = (atoms: Atom[]): string => {
  const elementCounts: Record<string, number> = {};
  
  atoms.forEach(atom => {
    elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1;
  });

  return Object.entries(elementCounts)
    .sort(([a], [b]) => {
      // Carbon first, then Hydrogen, then alphabetical
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H') return -1;
      if (b === 'H') return 1;
      return a.localeCompare(b);
    })
    .map(([element, count]) => count > 1 ? `${element}${count}` : element)
    .join('');
};

export const parseXYZ = (xyzContent: string): { atoms: Omit<Atom, 'id' | 'color' | 'radius'>[]; bonds: Omit<Bond, 'id'>[] } => {
  const lines = xyzContent.trim().split('\n');
  const atomCount = parseInt(lines[0]);
  const atoms: Omit<Atom, 'id' | 'color' | 'radius'>[] = [];
  
  for (let i = 2; i < 2 + atomCount; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 4) {
      atoms.push({
        element: parts[0],
        position: [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])],
      });
    }
  }

  // Auto-detect bonds based on distance
  const bonds: Omit<Bond, 'id'>[] = [];
  const bondThresholds: Record<string, number> = {
    'H': 1.2,
    'C': 1.8,
    'N': 1.7,
    'O': 1.6,
    'F': 1.4,
    'P': 2.2,
    'S': 2.1,
    'Cl': 2.0,
  };

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const distance = calculateDistance(atoms[i].position, atoms[j].position);
      const threshold1 = bondThresholds[atoms[i].element] || 1.8;
      const threshold2 = bondThresholds[atoms[j].element] || 1.8;
      const maxThreshold = Math.max(threshold1, threshold2);

      if (distance <= maxThreshold) {
        bonds.push({
          atom1Id: `atom-${i}`,
          atom2Id: `atom-${j}`,
          bondType: 'single',
          length: distance,
        });
      }
    }
  }

  return { atoms, bonds };
};

export const exportToXYZ = (molecule: Molecule): string => {
  const lines = [
    molecule.atoms.length.toString(),
    molecule.name || 'Molecule',
    ...molecule.atoms.map(atom => 
      `${atom.element} ${atom.position[0].toFixed(6)} ${atom.position[1].toFixed(6)} ${atom.position[2].toFixed(6)}`
    ),
  ];
  
  return lines.join('\n');
};

export const parsePDB = (pdbContent: string): { atoms: Omit<Atom, 'id' | 'color' | 'radius'>[]; bonds: Omit<Bond, 'id'>[] } => {
  const lines = pdbContent.split('\n');
  const atoms: Omit<Atom, 'id' | 'color' | 'radius'>[] = [];
  
  lines.forEach(line => {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const element = line.slice(76, 78).trim() || line.slice(13, 14).trim();
      const x = parseFloat(line.slice(30, 38));
      const y = parseFloat(line.slice(38, 46));
      const z = parseFloat(line.slice(46, 54));
      
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        atoms.push({
          element: element,
          position: [x / 10, y / 10, z / 10], // Convert Å to nm
        });
      }
    }
  });

  // Auto-detect bonds (simplified)
  const bonds: Omit<Bond, 'id'>[] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const distance = calculateDistance(atoms[i].position, atoms[j].position);
      if (distance <= 0.2) { // 2 Å in nm
        bonds.push({
          atom1Id: `atom-${i}`,
          atom2Id: `atom-${j}`,
          bondType: 'single',
          length: distance,
        });
      }
    }
  }

  return { atoms, bonds };
};

export const exportToPDB = (molecule: Molecule): string => {
  const lines = [
    'HEADER    MOLECULE EXPORT',
    'TITLE     ' + (molecule.name || 'UNNAMED MOLECULE'),
  ];

  molecule.atoms.forEach((atom, index) => {
    const line = [
      'ATOM  ',
      (index + 1).toString().padStart(5),
      '  ' + atom.element.padEnd(2),
      ' MOL A   1    ',
      (atom.position[0] * 10).toFixed(3).padStart(8), // Convert nm to Å
      (atom.position[1] * 10).toFixed(3).padStart(8),
      (atom.position[2] * 10).toFixed(3).padStart(8),
      '  1.00',
      ' 20.00',
      '          ',
      atom.element.padStart(2),
    ].join('');
    
    lines.push(line);
  });

  lines.push('END');
  return lines.join('\n');
};

export const calculateMolecularWeight = (atoms: Atom[]): number => {
  const atomicWeights: Record<string, number> = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
    P: 30.974, S: 32.065, Cl: 35.453, Br: 79.904, I: 126.904,
    Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, Ca: 40.078,
    Fe: 55.845, Zn: 65.38,
  };

  return atoms.reduce((total, atom) => {
    return total + (atomicWeights[atom.element] || 0);
  }, 0);
};

export const calculateCenterOfMass = (atoms: Atom[]): [number, number, number] => {
  if (atoms.length === 0) return [0, 0, 0];

  const atomicWeights: Record<string, number> = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
    P: 30.974, S: 32.065, Cl: 35.453, Br: 79.904, I: 126.904,
    Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, Ca: 40.078,
    Fe: 55.845, Zn: 65.38,
  };

  let totalMass = 0;
  let centerX = 0, centerY = 0, centerZ = 0;

  atoms.forEach(atom => {
    const mass = atomicWeights[atom.element] || 12;
    totalMass += mass;
    centerX += atom.position[0] * mass;
    centerY += atom.position[1] * mass;
    centerZ += atom.position[2] * mass;
  });

  return [
    centerX / totalMass,
    centerY / totalMass,
    centerZ / totalMass,
  ];
};