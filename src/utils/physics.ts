import { Atom, Bond, Molecule } from '../types/molecular';
import { ForceFieldParameters, PhysicsCalculation, SimulationSettings, DEFAULT_FORCE_FIELD } from '../types/physics';
import { AdvancedPhysics } from './advancedPhysics';

export class MolecularPhysics {
  private forceField: Record<string, Record<string, ForceFieldParameters>>;
  private advancedPhysics: AdvancedPhysics;

  constructor(customForceField?: Record<string, Record<string, ForceFieldParameters>>) {
    this.forceField = customForceField || DEFAULT_FORCE_FIELD;
    this.advancedPhysics = new AdvancedPhysics();
  }

  // Calcula potencial de Lennard-Jones
  calculateLennardJones(atom1: Atom, atom2: Atom, distance: number): number {
    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return 0;

    const { epsilon, sigma } = params.lennardJones;
    const sigmaOverR = sigma / distance;
    const sigmaOverR6 = Math.pow(sigmaOverR, 6);
    const sigmaOverR12 = sigmaOverR6 * sigmaOverR6;

    return 4 * epsilon * (sigmaOverR12 - sigmaOverR6);
  }

  // Calcula energia harmônica de ligação
  calculateHarmonicBond(bond: Bond, atoms: Atom[]): number {
    const atom1 = atoms.find(a => a.id === bond.atom1Id);
    const atom2 = atoms.find(a => a.id === bond.atom2Id);
    if (!atom1 || !atom2) return 0;

    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return 0;

    const { equilibriumLength, forceConstant } = params.harmonic;
    const deltaR = bond.length - equilibriumLength;
    
    return 0.5 * forceConstant * deltaR * deltaR;
  }

  // Calcula energia angular harmônica
  calculateAngleEnergy(atom1: Atom, atom2: Atom, atom3: Atom): number {
    const v1 = this.vectorBetween(atom2.position, atom1.position);
    const v2 = this.vectorBetween(atom2.position, atom3.position);
    
    const angle = this.angleBetweenVectors(v1, v2);
    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return 0;

    const { equilibriumAngle, forceConstant } = params.angle;
    const deltaAngle = (angle * 180 / Math.PI) - equilibriumAngle;
    
    return 0.5 * forceConstant * deltaAngle * deltaAngle * (Math.PI / 180) * (Math.PI / 180);
  }

  // Calcula energia de torção
  calculateTorsionEnergy(atom1: Atom, atom2: Atom, atom3: Atom, atom4: Atom): number {
    const dihedral = this.calculateDihedralAngle(atom1, atom2, atom3, atom4);
    const params = this.getParameters(atom2.element, atom3.element);
    if (!params) return 0;

    const { phase, amplitude, periodicity } = params.torsion;
    const phaseRad = phase * Math.PI / 180;
    
    return amplitude * (1 + Math.cos(periodicity * dihedral - phaseRad));
  }

  // Calcula forças sobre todos os átomos
  calculateForces(molecule: Molecule): { atomForces: [number, number, number][], totalEnergy: number } {
    const basicForces: [number, number, number][] = molecule.atoms.map(() => [0, 0, 0]);

    // Forças básicas de Lennard-Jones (não-ligados)
    for (let i = 0; i < molecule.atoms.length; i++) {
      for (let j = i + 1; j < molecule.atoms.length; j++) {
        const atom1 = molecule.atoms[i];
        const atom2 = molecule.atoms[j];
        
        // Verifica se há ligação direta
        const isDirectlyBonded = molecule.bonds.some(bond => 
          (bond.atom1Id === atom1.id && bond.atom2Id === atom2.id) ||
          (bond.atom1Id === atom2.id && bond.atom2Id === atom1.id)
        );

        if (!isDirectlyBonded) {
          const distance = this.calculateDistance(atom1.position, atom2.position);
          const ljForce = this.calculateLJForce(atom1, atom2, distance);
          
          const direction = this.normalize(this.vectorBetween(atom1.position, atom2.position));
          
          basicForces[i][0] += ljForce * direction[0];
          basicForces[i][1] += ljForce * direction[1];
          basicForces[i][2] += ljForce * direction[2];
          
          basicForces[j][0] -= ljForce * direction[0];
          basicForces[j][1] -= ljForce * direction[1];
          basicForces[j][2] -= ljForce * direction[2];
        }
      }
    }

    // Forças harmônicas de ligação
    molecule.bonds.forEach(bond => {
      const atom1Index = molecule.atoms.findIndex(a => a.id === bond.atom1Id);
      const atom2Index = molecule.atoms.findIndex(a => a.id === bond.atom2Id);
      
      if (atom1Index !== -1 && atom2Index !== -1) {
        const atom1 = molecule.atoms[atom1Index];
        const atom2 = molecule.atoms[atom2Index];
        
        const harmonicForce = this.calculateHarmonicForce(bond, atom1, atom2);
        const direction = this.normalize(this.vectorBetween(atom1.position, atom2.position));
        
        basicForces[atom1Index][0] += harmonicForce * direction[0];
        basicForces[atom1Index][1] += harmonicForce * direction[1];
        basicForces[atom1Index][2] += harmonicForce * direction[2];
        
        basicForces[atom2Index][0] -= harmonicForce * direction[0];
        basicForces[atom2Index][1] -= harmonicForce * direction[1];
        basicForces[atom2Index][2] -= harmonicForce * direction[2];
      }
    });

    // Forças angulares
    molecule.atoms.forEach((atomK, k) => {
      const bondedAtoms = molecule.bonds.filter(bond => bond.atom1Id === atomK.id || bond.atom2Id === atomK.id)
                                        .map(bond => bond.atom1Id === atomK.id ? bond.atom2Id : bond.atom1Id);

      for (let i = 0; i < bondedAtoms.length; i++) {
        for (let j = i + 1; j < bondedAtoms.length; j++) {
          const atomI = molecule.atoms.find(a => a.id === bondedAtoms[i]);
          const atomJ = molecule.atoms.find(a => a.id === bondedAtoms[j]);

          if (atomI && atomJ) {
            const angleForce = this.calculateAngleForce(atomI, atomK, atomJ);
            
            basicForces[k][0] += angleForce[0];
            basicForces[k][1] += angleForce[1];
            basicForces[k][2] += angleForce[2];

            basicForces[molecule.atoms.findIndex(a => a.id === atomI.id)][0] -= angleForce[0] / 2;
            basicForces[molecule.atoms.findIndex(a => a.id === atomI.id)][1] -= angleForce[1] / 2;
            basicForces[molecule.atoms.findIndex(a => a.id === atomI.id)][2] -= angleForce[2] / 2;

            basicForces[molecule.atoms.findIndex(a => a.id === atomJ.id)][0] -= angleForce[0] / 2;
            basicForces[molecule.atoms.findIndex(a => a.id === atomJ.id)][1] -= angleForce[1] / 2;
            basicForces[molecule.atoms.findIndex(a => a.id === atomJ.id)][2] -= angleForce[2] / 2;
          }
        }
      }
    });

    // Adicionar forças avançadas
    const advancedForces = this.advancedPhysics.calculateAdvancedForces(molecule);
    
    // Combinar forças básicas e avançadas
    const totalForces: [number, number, number][] = basicForces.map((force, i) => [
      force[0] + advancedForces[i][0],
      force[1] + advancedForces[i][1],
      force[2] + advancedForces[i][2]
    ]);

    // Calcular energia total
    const totalEnergy = this.calculatePhysics(molecule).totalEnergy;

    return { atomForces: totalForces, totalEnergy };
  }

  // Integração de Verlet para dinâmica molecular
  verletIntegration(
    molecule: Molecule, 
    velocities: [number, number, number][], 
    settings: SimulationSettings
  ): { newPositions: [number, number, number][], newVelocities: [number, number, number][] } {
    const forces = this.calculateForces(molecule);
    const dt = settings.timeStep * 1e-15; // Convert fs to s
    const newPositions: [number, number, number][] = [];
    const newVelocities: [number, number, number][] = [];

    molecule.atoms.forEach((atom, i) => {
      const mass = this.getAtomicMass(atom.element);
      const damping = settings.dampingFactor;
      
      // Verlet integration with damping
      const newPos: [number, number, number] = [
        atom.position[0] + velocities[i][0] * dt + 0.5 * (forces[i][0] / mass) * dt * dt,
        atom.position[1] + velocities[i][1] * dt + 0.5 * (forces[i][1] / mass) * dt * dt,
        atom.position[2] + velocities[i][2] * dt + 0.5 * (forces[i][2] / mass) * dt * dt
      ];
      
      const newVel: [number, number, number] = [
        (velocities[i][0] + (forces[i][0] / mass) * dt) * damping,
        (velocities[i][1] + (forces[i][1] / mass) * dt) * damping,
        (velocities[i][2] + (forces[i][2] / mass) * dt) * damping
      ];
      
      newPositions.push(newPos);
      newVelocities.push(newVel);
    });

    return { newPositions, newVelocities };
  }

  // Cálculo completo de física
  calculatePhysics(molecule: Molecule): PhysicsCalculation {
    let totalEnergy = 0;
    let potentialEnergy = 0;

    // Energia de ligação
    molecule.bonds.forEach(bond => {
      potentialEnergy += this.calculateHarmonicBond(bond, molecule.atoms);
    });

    // Energia de Lennard-Jones
    for (let i = 0; i < molecule.atoms.length; i++) {
      for (let j = i + 1; j < molecule.atoms.length; j++) {
        const distance = this.calculateDistance(
          molecule.atoms[i].position, 
          molecule.atoms[j].position
        );
        potentialEnergy += this.calculateLennardJones(
          molecule.atoms[i], 
          molecule.atoms[j], 
          distance
        );
      }
    }

    const forces = this.calculateForces(molecule);
    totalEnergy = potentialEnergy; // Kinetic energy would need velocities

    return {
      totalEnergy,
      kineticEnergy: 0,
      potentialEnergy,
      temperature: 298.15, // Default room temperature
      forces
    };
  }

  // Métodos auxiliares
  private getParameters(element1: string, element2: string): ForceFieldParameters | null {
    return this.forceField[element1]?.[element2] || 
           this.forceField[element2]?.[element1] || 
           null;
  }

  private calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    return Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) +
      Math.pow(pos1[1] - pos2[1], 2) +
      Math.pow(pos1[2] - pos2[2], 2)
    );
  }

  private vectorBetween(pos1: [number, number, number], pos2: [number, number, number]): [number, number, number] {
    return [pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]];
  }

  private normalize(vector: [number, number, number]): [number, number, number] {
    const magnitude = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
    if (magnitude === 0) return [0, 0, 0];
    return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude];
  }

  private angleBetweenVectors(v1: [number, number, number], v2: [number, number, number]): number {
    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  }

  private calculateDihedralAngle(atom1: Atom, atom2: Atom, atom3: Atom, atom4: Atom): number {
    const b1 = this.vectorBetween(atom2.position, atom1.position);
    const b2 = this.vectorBetween(atom3.position, atom2.position);
    const b3 = this.vectorBetween(atom4.position, atom3.position);
    
    const n1 = this.crossProduct(b1, b2);
    const n2 = this.crossProduct(b2, b3);
    
    const cos_angle = this.dotProduct(n1, n2) / (this.magnitude(n1) * this.magnitude(n2));
    return Math.acos(Math.max(-1, Math.min(1, cos_angle)));
  }

  private crossProduct(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  private dotProduct(a: [number, number, number], b: [number, number, number]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  private magnitude(v: [number, number, number]): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  private calculateLJForce(atom1: Atom, atom2: Atom, distance: number): number {
    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return 0;

    const { epsilon, sigma } = params.lennardJones;
    const sigmaOverR = sigma / distance;
    const sigmaOverR6 = Math.pow(sigmaOverR, 6);
    const sigmaOverR12 = sigmaOverR6 * sigmaOverR6;

    return 24 * epsilon * (2 * sigmaOverR12 - sigmaOverR6) / distance;
  }

  private calculateHarmonicForce(bond: Bond, atom1: Atom, atom2: Atom): number {
    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return 0;

    const { equilibriumLength, forceConstant } = params.harmonic;
    return -forceConstant * (bond.length - equilibriumLength);
  }

  private calculateAngleForce(atom1: Atom, atom2: Atom, atom3: Atom): [number, number, number] {
    const params = this.getParameters(atom1.element, atom2.element);
    if (!params) return [0, 0, 0];

    const { equilibriumAngle, forceConstant } = params.angle;

    const r12 = this.vectorBetween(atom2.position, atom1.position);
    const r32 = this.vectorBetween(atom2.position, atom3.position);

    const r12_norm = this.normalize(r12);
    const r32_norm = this.normalize(r32);

    const angle = this.angleBetweenVectors(r12, r32);
    const deltaAngle = (angle * 180 / Math.PI) - equilibriumAngle;

    // Derivative of angle with respect to coordinates (simplified for demonstration)
    // This is a complex calculation, a simplified approach is used here.
    // For a more accurate force, numerical differentiation or analytical derivatives are needed.
    const forceMagnitude = -forceConstant * deltaAngle * (Math.PI / 180); // Convert back to radians for force

    // Apply force perpendicular to the bond vectors, towards equilibrium angle
    const forceDirection = this.normalize(this.crossProduct(this.crossProduct(r12_norm, r32_norm), r12_norm));

    return [
      forceMagnitude * forceDirection[0],
      forceMagnitude * forceDirection[1],
      forceMagnitude * forceDirection[2],
    ];
  }

  public calculateDistanceBetweenAtoms(atom1: Atom, atom2: Atom): number {
    return this.calculateDistance(atom1.position, atom2.position);
  }

  public calculateAngleBetweenAtoms(atom1: Atom, atom2: Atom, atom3: Atom): number {
    const v1 = this.vectorBetween(atom2.position, atom1.position);
    const v2 = this.vectorBetween(atom2.position, atom3.position);
    return this.angleBetweenVectors(v1, v2) * 180 / Math.PI; // Return in degrees
  }

  public calculateTorsionAngleBetweenAtoms(atom1: Atom, atom2: Atom, atom3: Atom, atom4: Atom): number {
    return this.calculateDihedralAngle(atom1, atom2, atom3, atom4) * 180 / Math.PI; // Return in degrees
  }

  private getAtomicMass(element: string): number {
    const masses: Record<string, number> = {
      H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
      P: 30.974, S: 32.065, Cl: 35.453, Br: 79.904, I: 126.904
    };
    return masses[element] || 12.011;
  }

  public calculateDipoleMoment(molecule: Molecule): number {
    let dipoleX = 0;
    let dipoleY = 0;
    let dipoleZ = 0;

    // Simplified partial charges for common elements (Debye units)
    // These are illustrative and would typically come from quantum chemistry calculations
    const partialCharges: Record<string, number> = {
      H: 0.2, // Example partial charge for Hydrogen
      C: 0.0, // Example partial charge for Carbon
      O: -0.4, // Example partial charge for Oxygen
      N: -0.3, // Example partial charge for Nitrogen
      F: -0.5, // Example partial charge for Fluorine
      Cl: -0.2, // Example partial charge for Chlorine
    };

    molecule.atoms.forEach(atom => {
      const charge = partialCharges[atom.element] || 0;
      dipoleX += charge * atom.position[0];
      dipoleY += charge * atom.position[1];
      dipoleZ += charge * atom.position[2];
    });

    // Convert to Debye (1 e*Å = 4.803 D)
    const dipoleMagnitude = Math.sqrt(dipoleX * dipoleX + dipoleY * dipoleY + dipoleZ * dipoleZ) * 4.803;

    return dipoleMagnitude;
  }

  public detectHydrogenBonds(molecule: Molecule): { donor: Atom; acceptor: Atom; hydrogen: Atom; distance: number; angle: number }[] {
    const hydrogenBonds: { donor: Atom; acceptor: Atom; hydrogen: Atom; distance: number; angle: number }[] = [];

    // Define potential hydrogen bond donors (D) and acceptors (A)
    const donors = ["N", "O", "F"]; // Common electronegative atoms bonded to H
    const acceptors = ["N", "O", "F"]; // Common electronegative atoms with lone pairs

    molecule.atoms.forEach(atomH => {
      if (atomH.element === "H") {
        // Find the atom (D) bonded to this hydrogen
        const donorBond = molecule.bonds.find(bond => bond.atom1Id === atomH.id || bond.atom2Id === atomH.id);
        if (donorBond) {
          const atomD = molecule.atoms.find(a => a.id === (donorBond.atom1Id === atomH.id ? donorBond.atom2Id : donorBond.atom1Id));

          if (atomD && donors.includes(atomD.element)) {
            // Iterate through all other atoms to find potential acceptors (A)
            molecule.atoms.forEach(atomA => {
              if (atomA.id !== atomD.id && atomA.id !== atomH.id && acceptors.includes(atomA.element)) {
                const distanceDA = this.calculateDistance(atomD.position, atomA.position);
                const distanceHA = this.calculateDistance(atomH.position, atomA.position);

                // Criteria for hydrogen bond (typical values, can be refined)
                const maxDistanceHA = 2.5; // Ångströms
                const minAngleDHA = 150; // Degrees

                if (distanceHA <= maxDistanceHA) {
                  const angleDHA = this.calculateAngleBetweenAtoms(atomD, atomH, atomA);
                  if (angleDHA >= minAngleDHA) {
                    hydrogenBonds.push({
                      donor: atomD,
                      acceptor: atomA,
                      hydrogen: atomH,
                      distance: distanceHA,
                      angle: angleDHA,
                    });
                  }
                }
              }
            });
          }
        }
      }
    });

    return hydrogenBonds;
  }
}