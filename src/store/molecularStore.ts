import { create } from 'zustand';
import { Atom, Bond, Molecule, MolecularSystem, ELEMENT_DATA, MOLECULE_TEMPLATES } from '../types/molecular';
import { generateId } from '../utils/molecular';
import { MolecularPhysics } from '../utils/physics';
import { SimulationSettings } from '../types/physics';

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
  runMolecularDynamics: (moleculeId: string, settings: SimulationSettings) => void;
  calculateAdvancedPhysics: (moleculeId: string) => void;
  clear: () => void;
}

export const useMolecularStore = create<MolecularStore>((set, get) => {
  const physics = new MolecularPhysics();

  return {
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
    set((state) => ({
      molecules: state.molecules.map(molecule => {
        if (molecule.id !== moleculeId) return molecule;
        
        const results = physics.calculatePhysics(molecule);
        
        return {
          ...molecule,
          energy: results.totalEnergy,
          dipoleMoment: physics.calculateDipoleMoment(molecule),
        };
      }),
    }));
  },

  calculateAdvancedPhysics: (moleculeId) => {
    const state = get();
    const molecule = state.molecules.find(m => m.id === moleculeId);
    if (!molecule) return;

    const results = physics.calculatePhysics(molecule);
    console.log('Advanced Physics Results:', results);
    
    set((state) => ({
      molecules: state.molecules.map(m => 
        m.id === moleculeId 
          ? { 
              ...m, 
              energy: results.totalEnergy,
              dipoleMoment: results.potentialEnergy * 0.1 // Simplified calculation
            }
          : m
      ),
    }));
  },

  runMolecularDynamics: (moleculeId, settings) => {
    const state = get();
    let currentMolecule = state.molecules.find(m => m.id === moleculeId);
    if (!currentMolecule) return;

    let currentVelocities: [number, number, number][] = currentMolecule.atoms.map(() => [
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ]);

    // Use a fixed number of steps for now, or until a stop condition is implemented
    const simulationSteps = settings.steps || 500; 

    for (let step = 0; step < simulationSteps; step++) {
      const result = physics.verletIntegration(currentMolecule, currentVelocities, settings);
      
      currentMolecule = {
        ...currentMolecule,
        atoms: currentMolecule.atoms.map((atom, i) => ({
          ...atom,
          position: result.newPositions[i]
        }))
      };
      currentVelocities = result.newVelocities;

      // Update the store for visualization at each step (can be optimized for performance)
      set((state) => ({
        molecules: state.molecules.map(m => 
          m.id === moleculeId ? { ...currentMolecule } : m
        ),
      }));
    }
  },

  optimizeGeometry: (moleculeId) => {
    const state = get();
    let currentMolecule = state.molecules.find(m => m.id === moleculeId);
    if (!currentMolecule) return;

    const stepSize = 0.001; // Small step for stability
    const iterations = 100; // Number of optimization steps

    for (let i = 0; i < iterations; i++) {
      const forces = physics.calculateForces(currentMolecule);
      const optimizedAtoms = currentMolecule.atoms.map((atom, idx) => {
        const force = forces[idx];
        return {
          ...atom,
          position: [
            atom.position[0] - force[0] * stepSize,
            atom.position[1] - force[1] * stepSize,
            atom.position[2] - force[2] * stepSize,
          ] as [number, number, number],
        };
      });
      currentMolecule = { ...currentMolecule, atoms: optimizedAtoms };
    }

    set((state) => ({
      molecules: state.molecules.map(m => 
        m.id === moleculeId ? currentMolecule : m
      ),
    }));
  },

  clear: () => set({
    molecules: [],
    activeMoleculeId: null,
  }),
};
});