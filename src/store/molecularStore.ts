import { create } from 'zustand';
import { Atom, Bond, Molecule, MolecularSystem, ELEMENT_DATA, MOLECULE_TEMPLATES } from '../types/molecular';
import { generateId } from '../utils/molecular';
import { MolecularPhysics } from '../utils/physics';
import { SimulationSettings } from '../types/physics';
import { ExtractedMolecule } from '../utils/moleculeExtractor';

interface MolecularStore extends MolecularSystem {
  lastAtomMovement: { atomId: string; oldPosition: [number, number, number]; newPosition: [number, number, number] } | null;
  // Actions
  addMolecule: (molecule: Molecule) => void;
  addMoleculeToCollection: (molecule: Molecule) => void;
  removeMolecule: (id: string) => void;
  setActiveMolecule: (id: string | null) => void;
  addAtom: (moleculeId: string, element: string, position: [number, number, number]) => void;
  removeAtom: (moleculeId: string, atomId: string) => void;
  updateAtomPosition: (moleculeId: string, atomId: string, position: [number, number, number]) => void;
  addBond: (moleculeId: string, atom1Id: string, atom2Id: string, bondType?: 'single' | 'double' | 'triple') => void;
  removeBond: (moleculeId: string, bondId: string) => void;
  setViewMode: (mode: 'spheres' | 'sticks' | 'ballAndStick' | 'spaceFill' | 'ribbon' | 'surface') => void;
  toggleLabels: () => void;
  toggleBonds: () => void;
  toggleHydrogens: () => void;
  loadMoleculeTemplate: (templateName: keyof typeof MOLECULE_TEMPLATES) => void;
  calculateMoleculeProperties: (moleculeId: string) => void;
  optimizeGeometry: (moleculeId: string) => void;
  runMolecularDynamics: (moleculeId: string, settings: SimulationSettings) => void;
  calculateAdvancedPhysics: (moleculeId: string) => void;
  calculateDistance: (moleculeId: string, atom1Id: string, atom2Id: string) => number | null;
  calculateAngle: (moleculeId: string, atom1Id: string, atom2Id: string, atom3Id: string) => number | null;
  calculateTorsion: (moleculeId: string, atom1Id: string, atom2Id: string, atom3Id: string, atom4Id: string) => number | null;
  detectHydrogenBonds: (moleculeId: string) => { donor: Atom; acceptor: Atom; hydrogen: Atom; distance: number; angle: number }[];
  loadExtractedMolecules: (extractedMolecules: ExtractedMolecule[]) => void;
  loadMolecule: (molecule: Molecule) => void;
  createMoleculeFromFormula: (formula: string, name: string) => Molecule | null;
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
    lastAtomMovement: null,

    addMolecule: (molecule) => set((state) => ({
      molecules: [molecule], // Substituir todas as moléculas pela nova
      activeMoleculeId: molecule.id,
    })),

    addMoleculeToCollection: (molecule) => set((state) => ({
      molecules: [...state.molecules, molecule], // Adicionar à coleção existente
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

    updateAtomPosition: (moleculeId, atomId, position) => set((state) => {
      const molecule = state.molecules.find(m => m.id === moleculeId);
      const atom = molecule?.atoms.find(a => a.id === atomId);
      
      return {
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
        lastAtomMovement: atom ? {
          atomId,
          oldPosition: atom.position,
          newPosition: position
        } : null
      };
    }),

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

      set({
        molecules: [molecule], // Substituir todas as moléculas pela nova
        activeMoleculeId: moleculeId,
      });
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
      const molecule = state.molecules.find(m => m.id === moleculeId);
      if (!molecule) return;

      // Import the MD simulator dynamically
      import('../utils/molecularDynamics').then(({ MolecularDynamicsSimulator }) => {
        const simulator = new MolecularDynamicsSimulator(settings);
        let mdState = simulator.createInitialState(molecule);
        
        // Run simulation for specified number of steps
        const numSteps = settings.steps || 1000;
        const updateInterval = Math.max(1, Math.floor(numSteps / 100)); // Update 100 times
        
        let stepCount = 0;
        const runStep = () => {
          if (stepCount >= numSteps) return;
          
          // Calculate forces using the physics engine
          const calculateForces = (positions: number[][]) => {
            return positions.map((pos, i) => {
              const atom = { ...molecule.atoms[i], position: pos as [number, number, number] };
              const forces = physics.calculateForces({ ...molecule, atoms: [atom] });
              return forces.atomForces[0] || [0, 0, 0];
            });
          };
          
          mdState = simulator.step(mdState, calculateForces);
          
          // Update molecule positions periodically
          if (stepCount % updateInterval === 0) {
            set((state) => ({
              molecules: state.molecules.map(m => 
                m.id === moleculeId 
                  ? {
                      ...m,
                      atoms: m.atoms.map((atom, i) => ({
                        ...atom,
                        position: mdState.positions[i] as [number, number, number]
                      }))
                    }
                  : m
              ),
            }));
          }
          
          stepCount++;
          
          // Continue simulation
          if (stepCount < numSteps) {
            setTimeout(runStep, 10); // 10ms delay between steps
          }
        };
        
        runStep();
      }).catch(error => {
        console.error('Failed to load MD simulator:', error);
        // Fallback to simple simulation
        const simulationSteps = settings.steps || 500;
        const currentVelocities: [number, number, number][] = molecule.atoms.map(() => [
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ]);

        for (let step = 0; step < simulationSteps; step++) {
          const forces = physics.calculateForces(molecule);
          const stepSize = settings.timeStep || 0.01;

          set((state) => ({
            molecules: state.molecules.map(m => 
              m.id === moleculeId 
                ? {
                    ...m,
                    atoms: m.atoms.map((atom, i) => {
                      const force = forces.atomForces[i] || [0, 0, 0];
                      return {
                        ...atom,
                        position: [
                          atom.position[0] + force[0] * stepSize,
                          atom.position[1] + force[1] * stepSize,
                          atom.position[2] + force[2] * stepSize,
                        ] as [number, number, number]
                      };
                    })
                  }
                : m
            ),
          }));
        }
      });
    },

    optimizeGeometry: (moleculeId) => {
      const state = get();
      let currentMolecule = state.molecules.find(m => m.id === moleculeId);
      if (!currentMolecule) return;

      const stepSize = 0.001; // Small step for stability
      const iterations = 100; // Number of optimization steps

      for (let i = 0; i < iterations; i++) {
        const forceResult = physics.calculateForces(currentMolecule);
        const forces = forceResult.atomForces;
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

    calculateDistance: (moleculeId, atom1Id, atom2Id) => {
      const state = get();
      const molecule = state.molecules.find(m => m.id === moleculeId);
      if (!molecule) return null;

      const atom1 = molecule.atoms.find(a => a.id === atom1Id);
      const atom2 = molecule.atoms.find(a => a.id === atom2Id);

      if (atom1 && atom2) {
        return physics.calculateDistanceBetweenAtoms(atom1, atom2);
      }
      return null;
    },

    calculateAngle: (moleculeId, atom1Id, atom2Id, atom3Id) => {
      const state = get();
      const molecule = state.molecules.find(m => m.id === moleculeId);
      if (!molecule) return null;

      const atom1 = molecule.atoms.find(a => a.id === atom1Id);
      const atom2 = molecule.atoms.find(a => a.id === atom2Id);
      const atom3 = molecule.atoms.find(a => a.id === atom3Id);

      if (atom1 && atom2 && atom3) {
        return physics.calculateAngleBetweenAtoms(atom1, atom2, atom3);
      }
      return null;
    },

    calculateTorsion: (moleculeId, atom1Id, atom2Id, atom3Id, atom4Id) => {
      const state = get();
      const molecule = state.molecules.find(m => m.id === moleculeId);
      if (!molecule) return null;

      const atom1 = molecule.atoms.find(a => a.id === atom1Id);
      const atom2 = molecule.atoms.find(a => a.id === atom2Id);
      const atom3 = molecule.atoms.find(a => a.id === atom3Id);
      const atom4 = molecule.atoms.find(a => a.id === atom4Id);

      if (atom1 && atom2 && atom3 && atom4) {
        return physics.calculateTorsionAngleBetweenAtoms(atom1, atom2, atom3, atom4);
      }
      return null;
    },

    detectHydrogenBonds: (moleculeId) => {
      const state = get();
      const molecule = state.molecules.find(m => m.id === moleculeId);
      if (!molecule) return [];

      return physics.detectHydrogenBonds(molecule);
    },

    loadExtractedMolecules: (extractedMolecules) => {
      const newMolecules: Molecule[] = [];

      for (const extracted of extractedMolecules) {
        // Tentar criar molécula a partir da fórmula
        if (extracted.formula) {
          const molecule = get().createMoleculeFromFormula(extracted.formula, extracted.name);
          if (molecule) {
            newMolecules.push(molecule);
          }
        } else {
          // Criar molécula placeholder se não tiver fórmula
          const placeholderMolecule: Molecule = {
            id: generateId(),
            name: extracted.name,
            atoms: [],
            bonds: [],
          };
          newMolecules.push(placeholderMolecule);
        }
      }

      // Adicionar moléculas à coleção existente
      set((state) => ({
        molecules: [...state.molecules, ...newMolecules],
        activeMoleculeId: newMolecules.length > 0 ? newMolecules[0].id : state.activeMoleculeId
      }));
    },

    loadMolecule: (moleculeData: Molecule) => {
      const moleculeId = generateId();

      const atoms: Atom[] = moleculeData.atoms?.map((atom: Atom, index: number) => ({
        id: `${moleculeId}-atom-${index}`,
        element: atom.symbol || atom.element || 'C',
        position: [atom.x || 0, atom.y || 0, atom.z || 0] as [number, number, number],
        color: ELEMENT_DATA[atom.symbol || atom.element || 'C']?.color || '#CCCCCC',
        radius: ELEMENT_DATA[atom.symbol || atom.element || 'C']?.radius || 0.5,
        charge: 0
      })) || [];

      const bonds: Bond[] = moleculeData.bonds?.map((bond: Bond, index: number) => ({
        id: `${moleculeId}-bond-${index}`,
        atom1Id: atoms[bond.from]?.id || '',
        atom2Id: atoms[bond.to]?.id || '',
        bondType: 'single' as const,
        length: 1.5
      })) || [];

      const molecule: Molecule = {
        id: moleculeId,
        name: moleculeData.name || 'Unknown Molecule',
        atoms,
        bonds,
      };

      set((state) => ({
        molecules: [...state.molecules, molecule],
        activeMoleculeId: molecule.id,
      }));
    },

    createMoleculeFromFormula: (formula, name) => {
      try {
        // Parser simples de fórmula molecular
        const atoms: Atom[] = [];
        const elementCounts = new Map<string, number>();
        
        // Regex para extrair elementos e suas quantidades
        const elementRegex = /([A-Z][a-z]?)(\d*)/g;
        let match;
        
        while ((match = elementRegex.exec(formula)) !== null) {
          const element = match[1];
          const count = parseInt(match[2]) || 1;
          elementCounts.set(element, count);
        }

        // Criar átomos baseados na fórmula
        let atomIndex = 0;
        for (const [element, count] of elementCounts) {
          for (let i = 0; i < count; i++) {
            const elementData = ELEMENT_DATA[element];
            if (elementData) {
              atoms.push({
                id: `atom-${atomIndex++}`,
                element: element,
                position: [0, 0, 0], // Posição inicial arbitrária
                color: elementData.color,
                radius: elementData.radius,
                charge: 0,
              });
            }
          }
        }

        // Lógica simplificada para adicionar ligações (apenas para visualização básica)
        const bonds: Bond[] = [];
        if (atoms.length >= 2) {
          for (let i = 0; i < atoms.length - 1; i++) {
            bonds.push({
              id: `bond-${i}`,
              atom1Id: atoms[i].id,
              atom2Id: atoms[i+1].id,
              bondType: 'single',
              length: 1.5,
            });
          }
        }

        const molecule: Molecule = {
          id: generateId(),
          name: name || formula,
          atoms,
          bonds,
        };

        return molecule;
      } catch (error) {
        console.error('Error creating molecule from formula:', error);
        return null;
      }
    },

    clear: () => set({
      molecules: [],
      activeMoleculeId: null,
    }),
  };
});


