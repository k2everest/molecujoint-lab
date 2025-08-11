export interface Atom {
  id: string;
  element: string;
  position: [number, number, number];
  color: string;
  radius: number;
  charge?: number;
  velocity?: [number, number, number];
  force?: [number, number, number];
}

export interface Bond {
  id: string;
  atom1Id: string;
  atom2Id: string;
  bondType: 'single' | 'double' | 'triple';
  length: number;
  type?: 'single' | 'double' | 'triple';
}

export interface Molecule {
  id: string;
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  formula?: string;
  energy?: number;
  dipoleMoment?: number;
  properties?: {
    totalEnergy: number;
    dipoleMoment: number;
    centerOfMass: [number, number, number];
  };
  metadata?: {
    source?: string;
    type?: string;
    mechanism?: string;
    target?: string;
    confidence?: number;
    formula?: string;
  };
}

export interface MolecularSystem {
  molecules: Molecule[];
  activeMoleculeId: string | null;
  viewMode: 'spheres' | 'sticks' | 'ballAndStick' | 'spaceFill' | 'ribbon' | 'surface';
  showLabels: boolean;
  showBonds: boolean;
  showHydrogens: boolean;
}

export const ELEMENT_DATA: Record<string, { color: string; radius: number; name: string; covalentRadius: number }> = {
  H: { color: '#FFFFFF', radius: 0.31, name: 'Hydrogen', covalentRadius: 0.31 },
  C: { color: '#909090', radius: 0.70, name: 'Carbon', covalentRadius: 0.76 },
  N: { color: '#3050F8', radius: 0.65, name: 'Nitrogen', covalentRadius: 0.71 },
  O: { color: '#FF0D0D', radius: 0.60, name: 'Oxygen', covalentRadius: 0.66 },
  F: { color: '#90E050', radius: 0.50, name: 'Fluorine', covalentRadius: 0.57 },
  P: { color: '#FF8000', radius: 1.00, name: 'Phosphorus', covalentRadius: 1.07 },
  S: { color: '#FFFF30', radius: 1.00, name: 'Sulfur', covalentRadius: 1.05 },
  Cl: { color: '#1FF01F', radius: 0.97, name: 'Chlorine', covalentRadius: 0.99 },
  Br: { color: '#A62929', radius: 1.12, name: 'Bromine', covalentRadius: 1.20 },
  I: { color: '#940094', radius: 1.32, name: 'Iodine', covalentRadius: 1.39 },
  Na: { color: '#AB5CF2', radius: 1.54, name: 'Sodium', covalentRadius: 1.66 },
  Mg: { color: '#8AFF00', radius: 1.30, name: 'Magnesium', covalentRadius: 1.41 },
  Al: { color: '#BFA6A6', radius: 1.18, name: 'Aluminum', covalentRadius: 1.21 },
  Si: { color: '#F0C8A0', radius: 1.11, name: 'Silicon', covalentRadius: 1.11 },
  Ca: { color: '#3DFF00', radius: 1.74, name: 'Calcium', covalentRadius: 1.76 },
  Fe: { color: '#E06633', radius: 1.17, name: 'Iron', covalentRadius: 1.32 },
  Zn: { color: '#7D80B0', radius: 1.25, name: 'Zinc', covalentRadius: 1.22 },
};

export const MOLECULE_TEMPLATES = {
  water: {
    name: 'Water (H₂O)',
    atoms: [
      { element: 'O', position: [0, 0, 0] as [number, number, number] },
      { element: 'H', position: [0.96, 0, 0] as [number, number, number] },
      { element: 'H', position: [-0.24, 0.93, 0] as [number, number, number] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, type: 'single' as const },
      { atom1: 0, atom2: 2, type: 'single' as const },
    ],
  },
  methane: {
    name: 'Methane (CH₄)',
    atoms: [
      { element: 'C', position: [0, 0, 0] as [number, number, number] },
      { element: 'H', position: [1.09, 0, 0] as [number, number, number] },
      { element: 'H', position: [-0.36, 1.03, 0] as [number, number, number] },
      { element: 'H', position: [-0.36, -0.51, 0.89] as [number, number, number] },
      { element: 'H', position: [-0.36, -0.51, -0.89] as [number, number, number] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, type: 'single' as const },
      { atom1: 0, atom2: 2, type: 'single' as const },
      { atom1: 0, atom2: 3, type: 'single' as const },
      { atom1: 0, atom2: 4, type: 'single' as const },
    ],
  },
  benzene: {
    name: 'Benzene (C₆H₆)',
    atoms: [
      { element: 'C', position: [1.39, 0, 0] as [number, number, number] },
      { element: 'C', position: [0.69, 1.20, 0] as [number, number, number] },
      { element: 'C', position: [-0.69, 1.20, 0] as [number, number, number] },
      { element: 'C', position: [-1.39, 0, 0] as [number, number, number] },
      { element: 'C', position: [-0.69, -1.20, 0] as [number, number, number] },
      { element: 'C', position: [0.69, -1.20, 0] as [number, number, number] },
      { element: 'H', position: [2.47, 0, 0] as [number, number, number] },
      { element: 'H', position: [1.23, 2.14, 0] as [number, number, number] },
      { element: 'H', position: [-1.23, 2.14, 0] as [number, number, number] },
      { element: 'H', position: [-2.47, 0, 0] as [number, number, number] },
      { element: 'H', position: [-1.23, -2.14, 0] as [number, number, number] },
      { element: 'H', position: [1.23, -2.14, 0] as [number, number, number] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, type: 'single' as const },
      { atom1: 1, atom2: 2, type: 'double' as const },
      { atom1: 2, atom2: 3, type: 'single' as const },
      { atom1: 3, atom2: 4, type: 'double' as const },
      { atom1: 4, atom2: 5, type: 'single' as const },
      { atom1: 5, atom2: 0, type: 'double' as const },
      { atom1: 0, atom2: 6, type: 'single' as const },
      { atom1: 1, atom2: 7, type: 'single' as const },
      { atom1: 2, atom2: 8, type: 'single' as const },
      { atom1: 3, atom2: 9, type: 'single' as const },
      { atom1: 4, atom2: 10, type: 'single' as const },
      { atom1: 5, atom2: 11, type: 'single' as const },
    ],
  },
};