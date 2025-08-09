import { create } from 'zustand';
import { Atom, Bond, Molecule, MolecularSystem, ELEMENT_DATA, MOLECULE_TEMPLATES } from '../types/molecular';
import { generateId } from '../utils/molecular';

interface MolecularStore extends MolecularSystem {
  // Actions
  addMolecule: (molecule: Molecule) => void;
  removeMolecule: (id: string) => void;
  setActiveMolecule: (id: string | null) => void;
  addAtom: (moleculeId: string, element: string, position: [number, number, number]) => void;
  removeAtom: (moleculeId: string, atomId: string) => void;
  updateAtomPosition: (moleculeId: string, atomId: string, position: [number, number, number]) => void;
  addBond: (moleculeId: string, atom1Id: string, atom2Id: string, bondType?: 'single' | 'double' | 'triple') => void;
  removeBond: (moleculeId: string, bondId: string) => void;
  setViewMode: (mode: 'spheres' | 'sticks' | 'ballAndStick' | 'spaceFill') => void;
  toggleLabels: () => void;
  toggleBonds: () => void;
  toggleHydrogens: () => void;
  loadMoleculeTemplate: (templateName: keyof typeof MOLECULE_TEMPLATES) => void;
  calculateMoleculeProperties: (moleculeId: string) => void;
  optimizeGeometry: (moleculeId: string) => void;
  clear: () => void;
}

export const useMolecularStore = create<MolecularStore>((set, get) => ({
  molecules: [],
  activeMoleculeId: null,
  viewMode: 'ballAndStick',
  showLabels: true,
  showBonds: true,
  showHydrogens: true,

  addMolecule: (molecule) => set((state) => ({
    molecules: [...state.molecules, molecule],
    activeMoleculeId: molecule.id,
  })),

  removeMolecule: (id) => set((state) => ({
    molecules: state.molecules.filter(m => m.id !== id),
    activeMoleculeId: state.activeMoleculeId === id ? null : state.activeMoleculeId,
  })),

  setActiveMolecule: (id) => set({ activeMoleculeId: id }),

  addAtom: (moleculeId, element, position) => set((state) => ({
    molecules: state.molecules.map(molecule => 
      molecule.id === moleculeId 
        ? {
            ...molecule,
            atoms: [...molecule.atoms, {
              id: generateId(),
              element,
              position,
              color: ELEMENT_DATA[element]?.color || '#CCCCCC',
              radius: ELEMENT_DATA[element]?.radius || 0.5,
            }]
          }
        : molecule
    ),
  })),

  removeAtom: (moleculeId, atomId) => set((state) => ({
    molecules: state.molecules.map(molecule =>
      molecule.id === moleculeId
        ? {
            ...molecule,
            atoms: molecule.atoms.filter(atom => atom.id !== atomId),
            bonds: molecule.bonds.filter(bond => 
              bond.atom1Id !== atomId && bond.atom2Id !== atomId
            ),
          }
        : molecule
    ),
  })),

  updateAtomPosition: (moleculeId, atomId, position) => set((state) => ({
    molecules: state.molecules.map(molecule =>
      molecule.id === moleculeId
        ? {
            ...molecule,
            atoms: molecule.atoms.map(atom =>
              atom.id === atomId ? { ...atom, position } : atom
            ),
          }
        : molecule
    ),
  })),

  addBond: (moleculeId, atom1Id, atom2Id, bondType = 'single') => set((state) => {
    const molecule = state.molecules.find(m => m.id === moleculeId);
    if (!molecule) return state;

    const atom1 = molecule.atoms.find(a => a.id === atom1Id);
    const atom2 = molecule.atoms.find(a => a.id === atom2Id);
    if (!atom1 || !atom2) return state;

    const distance = Math.sqrt(
      Math.pow(atom1.position[0] - atom2.position[0], 2) +
      Math.pow(atom1.position[1] - atom2.position[1], 2) +
      Math.pow(atom1.position[2] - atom2.position[2], 2)
    );

    const newBond: Bond = {
      id: generateId(),
      atom1Id,
      atom2Id,
      bondType,
      length: distance,
    };

    return {
      molecules: state.molecules.map(m =>
        m.id === moleculeId
          ? { ...m, bonds: [...m.bonds, newBond] }
          : m
      ),
    };
  }),

  removeBond: (moleculeId, bondId) => set((state) => ({
    molecules: state.molecules.map(molecule =>
      molecule.id === moleculeId
        ? {
            ...molecule,
            bonds: molecule.bonds.filter(bond => bond.id !== bondId),
          }
        : molecule
    ),
  })),

  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  
  toggleBonds: () => set((state) => ({ showBonds: !state.showBonds })),
  
  toggleHydrogens: () => set((state) => ({ showHydrogens: !state.showHydrogens })),

  loadMoleculeTemplate: (templateName) => {
    const template = MOLECULE_TEMPLATES[templateName];
    const moleculeId = generateId();
    
    const atoms: Atom[] = template.atoms.map((atomTemplate, index) => ({
      id: `${moleculeId}-atom-${index}`,
      element: atomTemplate.element,
      position: atomTemplate.position,
      color: ELEMENT_DATA[atomTemplate.element]?.color || '#CCCCCC',
      radius: ELEMENT_DATA[atomTemplate.element]?.radius || 0.5,
    }));

    const bonds: Bond[] = template.bonds.map((bondTemplate, index) => {
      const atom1 = atoms[bondTemplate.atom1];
      const atom2 = atoms[bondTemplate.atom2];
      const distance = Math.sqrt(
        Math.pow(atom1.position[0] - atom2.position[0], 2) +
        Math.pow(atom1.position[1] - atom2.position[1], 2) +
        Math.pow(atom1.position[2] - atom2.position[2], 2)
      );

      return {
        id: `${moleculeId}-bond-${index}`,
        atom1Id: atom1.id,
        atom2Id: atom2.id,
        bondType: bondTemplate.type,
        length: distance,
      };
    });

    const molecule: Molecule = {
      id: moleculeId,
      name: template.name,
      atoms,
      bonds,
    };

    set((state) => ({
      molecules: [...state.molecules, molecule],
      activeMoleculeId: moleculeId,
    }));
  },

  calculateMoleculeProperties: (moleculeId) => {
    // Simplified molecular property calculations
    set((state) => ({
      molecules: state.molecules.map(molecule => {
        if (molecule.id !== moleculeId) return molecule;

        // Calculate approximate energy (Lennard-Jones potential)
        let totalEnergy = 0;
        for (const bond of molecule.bonds) {
          const distance = bond.length;
          const epsilon = 0.1; // kcal/mol
          const sigma = 3.0; // Angstroms
          const energy = 4 * epsilon * (Math.pow(sigma/distance, 12) - Math.pow(sigma/distance, 6));
          totalEnergy += energy;
        }

        // Calculate dipole moment (simplified)
        let dipoleMoment = 0;
        for (const atom of molecule.atoms) {
          if (atom.element === 'O') dipoleMoment += 1.4;
          if (atom.element === 'N') dipoleMoment += 1.0;
          if (atom.element === 'F') dipoleMoment += 1.5;
        }

        return {
          ...molecule,
          energy: totalEnergy,
          dipoleMoment,
        };
      }),
    }));
  },

  optimizeGeometry: (moleculeId) => {
    // Simplified geometry optimization using steepest descent
    set((state) => ({
      molecules: state.molecules.map(molecule => {
        if (molecule.id !== moleculeId) return molecule;

        const optimizedAtoms = molecule.atoms.map(atom => {
          // Simple force-based position adjustment
          let forceX = 0, forceY = 0, forceZ = 0;

          for (const otherAtom of molecule.atoms) {
            if (otherAtom.id === atom.id) continue;

            const dx = atom.position[0] - otherAtom.position[0];
            const dy = atom.position[1] - otherAtom.position[1];
            const dz = atom.position[2] - otherAtom.position[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (distance > 0) {
              const force = 0.1 / (distance * distance);
              forceX += force * (dx / distance);
              forceY += force * (dy / distance);
              forceZ += force * (dz / distance);
            }
          }

          return {
            ...atom,
            position: [
              atom.position[0] + forceX * 0.01,
              atom.position[1] + forceY * 0.01,
              atom.position[2] + forceZ * 0.01,
            ] as [number, number, number],
          };
        });

        return { ...molecule, atoms: optimizedAtoms };
      }),
    }));
  },

  clear: () => set({
    molecules: [],
    activeMoleculeId: null,
  }),
}));