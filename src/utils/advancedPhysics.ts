import { Atom, Molecule } from '../types/molecular';

export class AdvancedPhysics {
  
  /**
   * Calculate van der Waals forces using Lennard-Jones potential
   * Improved with better parameters and cutoff distances
   */
  calculateVanDerWaalsForces(molecule: Molecule): number[][] {
    const forces: number[][] = molecule.atoms.map(() => [0, 0, 0]);
    const cutoffDistance = 10.0; // Angstroms
    
    // Improved Lennard-Jones parameters
    const ljParams: Record<string, { epsilon: number; sigma: number }> = {
      'H': { epsilon: 0.0157, sigma: 2.81 },
      'C': { epsilon: 0.105, sigma: 3.4 },
      'N': { epsilon: 0.0774, sigma: 3.25 },
      'O': { epsilon: 0.1521, sigma: 3.12 },
      'F': { epsilon: 0.061, sigma: 2.94 },
      'P': { epsilon: 0.305, sigma: 3.74 },
      'S': { epsilon: 0.274, sigma: 3.6 },
      'Cl': { epsilon: 0.227, sigma: 3.52 },
    };
    
    for (let i = 0; i < molecule.atoms.length; i++) {
      for (let j = i + 1; j < molecule.atoms.length; j++) {
        const atom1 = molecule.atoms[i];
        const atom2 = molecule.atoms[j];
        
        const distance = this.calculateDistance(atom1.position, atom2.position);
        
        if (distance < cutoffDistance && distance > 0.1) {
          const params1 = ljParams[atom1.element] || ljParams['C'];
          const params2 = ljParams[atom2.element] || ljParams['C'];
          
          // Lorentz-Berthelot mixing rules
          const epsilon = Math.sqrt(params1.epsilon * params2.epsilon);
          const sigma = (params1.sigma + params2.sigma) / 2;
          
          const sigmaOverR = sigma / distance;
          const sigmaOverR6 = Math.pow(sigmaOverR, 6);
          const sigmaOverR12 = sigmaOverR6 * sigmaOverR6;
          
          // Force magnitude (negative gradient of potential)
          const forceMagnitude = 24 * epsilon * (2 * sigmaOverR12 - sigmaOverR6) / distance;
          
          // Direction vector
          const dx = atom2.position[0] - atom1.position[0];
          const dy = atom2.position[1] - atom1.position[1];
          const dz = atom2.position[2] - atom1.position[2];
          
          const forceX = forceMagnitude * dx / distance;
          const forceY = forceMagnitude * dy / distance;
          const forceZ = forceMagnitude * dz / distance;
          
          forces[i][0] += forceX;
          forces[i][1] += forceY;
          forces[i][2] += forceZ;
          
          forces[j][0] -= forceX;
          forces[j][1] -= forceY;
          forces[j][2] -= forceZ;
        }
      }
    }
    
    return forces;
  }
  
  /**
   * Calculate electrostatic forces using Coulomb's law
   */
  calculateElectrostaticForces(molecule: Molecule): number[][] {
    const forces: number[][] = molecule.atoms.map(() => [0, 0, 0]);
    const ke = 8.9875517923e9; // Coulomb's constant (N⋅m²/C²)
    const elementalCharge = 1.602176634e-19; // Elementary charge (C)
    
    // Simplified partial charges (in elementary charge units)
    const partialCharges: Record<string, number> = {
      'H': 0.1,
      'C': -0.1,
      'N': -0.3,
      'O': -0.4,
      'F': -0.4,
      'P': 0.2,
      'S': -0.2,
      'Cl': -0.1,
    };
    
    for (let i = 0; i < molecule.atoms.length; i++) {
      for (let j = i + 1; j < molecule.atoms.length; j++) {
        const atom1 = molecule.atoms[i];
        const atom2 = molecule.atoms[j];
        
        const distance = this.calculateDistance(atom1.position, atom2.position) * 1e-10; // Convert Å to m
        
        if (distance > 1e-12) { // Avoid division by zero
          const q1 = (partialCharges[atom1.element] || 0) * elementalCharge;
          const q2 = (partialCharges[atom2.element] || 0) * elementalCharge;
          
          const forceMagnitude = ke * q1 * q2 / (distance * distance);
          
          // Direction vector
          const dx = atom2.position[0] - atom1.position[0];
          const dy = atom2.position[1] - atom1.position[1];
          const dz = atom2.position[2] - atom1.position[2];
          const distanceA = this.calculateDistance(atom1.position, atom2.position);
          
          const forceX = forceMagnitude * dx / distanceA * 1e10; // Convert back to Å units
          const forceY = forceMagnitude * dy / distanceA * 1e10;
          const forceZ = forceMagnitude * dz / distanceA * 1e10;
          
          forces[i][0] += forceX;
          forces[i][1] += forceY;
          forces[i][2] += forceZ;
          
          forces[j][0] -= forceX;
          forces[j][1] -= forceY;
          forces[j][2] -= forceZ;
        }
      }
    }
    
    return forces;
  }
  
  /**
   * Calculate hydrogen bond forces
   */
  calculateHydrogenBondForces(molecule: Molecule): number[][] {
    const forces: number[][] = molecule.atoms.map(() => [0, 0, 0]);
    
    // Hydrogen bond donors and acceptors
    const donors = ['N', 'O', 'F'];
    const acceptors = ['N', 'O', 'F'];
    
    for (let i = 0; i < molecule.atoms.length; i++) {
      const hydrogen = molecule.atoms[i];
      if (hydrogen.element !== 'H') continue;
      
      // Find donor atom bonded to hydrogen
      const donorBond = molecule.bonds.find(bond => 
        (bond.atom1Id === hydrogen.id && donors.includes(molecule.atoms.find(a => a.id === bond.atom2Id)?.element || '')) ||
        (bond.atom2Id === hydrogen.id && donors.includes(molecule.atoms.find(a => a.id === bond.atom1Id)?.element || ''))
      );
      
      if (!donorBond) continue;
      
      const donorId = donorBond.atom1Id === hydrogen.id ? donorBond.atom2Id : donorBond.atom1Id;
      const donor = molecule.atoms.find(a => a.id === donorId);
      if (!donor) continue;
      
      // Find potential acceptors
      for (let j = 0; j < molecule.atoms.length; j++) {
        const acceptor = molecule.atoms[j];
        if (!acceptors.includes(acceptor.element) || acceptor.id === donor.id) continue;
        
        const hAcceptorDistance = this.calculateDistance(hydrogen.position, acceptor.position);
        const donorAcceptorDistance = this.calculateDistance(donor.position, acceptor.position);
        
        // Hydrogen bond criteria
        if (hAcceptorDistance < 2.5 && donorAcceptorDistance < 3.5) {
          // Calculate angle D-H...A
          const angle = this.calculateAngle(donor.position, hydrogen.position, acceptor.position);
          
          if (angle > 120) { // Minimum angle for hydrogen bond
            // Simple hydrogen bond potential
            const optimalDistance = 1.8;
            const forceConstant = 10.0;
            const deltaR = hAcceptorDistance - optimalDistance;
            const forceMagnitude = -forceConstant * deltaR;
            
            // Direction from hydrogen to acceptor
            const dx = acceptor.position[0] - hydrogen.position[0];
            const dy = acceptor.position[1] - hydrogen.position[1];
            const dz = acceptor.position[2] - hydrogen.position[2];
            
            const forceX = forceMagnitude * dx / hAcceptorDistance;
            const forceY = forceMagnitude * dy / hAcceptorDistance;
            const forceZ = forceMagnitude * dz / hAcceptorDistance;
            
            forces[i][0] += forceX;
            forces[i][1] += forceY;
            forces[i][2] += forceZ;
            
            forces[j][0] -= forceX;
            forces[j][1] -= forceY;
            forces[j][2] -= forceZ;
          }
        }
      }
    }
    
    return forces;
  }
  
  /**
   * Calculate pi-pi stacking forces
   */
  calculatePiPiStackingForces(molecule: Molecule): number[][] {
    const forces: number[][] = molecule.atoms.map(() => [0, 0, 0]);
    
    // Identify aromatic carbons (simplified)
    const aromaticCarbons = molecule.atoms.filter(atom => {
      if (atom.element !== 'C') return false;
      
      // Count bonds to this carbon
      const bondCount = molecule.bonds.filter(bond => 
        bond.atom1Id === atom.id || bond.atom2Id === atom.id
      ).length;
      
      return bondCount === 3; // Aromatic carbons typically have 3 bonds
    });
    
    // Calculate pi-pi interactions between aromatic carbons
    for (let i = 0; i < aromaticCarbons.length; i++) {
      for (let j = i + 1; j < aromaticCarbons.length; j++) {
        const carbon1 = aromaticCarbons[i];
        const carbon2 = aromaticCarbons[j];
        
        const distance = this.calculateDistance(carbon1.position, carbon2.position);
        
        // Pi-pi stacking typically occurs at 3.3-3.8 Å
        if (distance > 3.0 && distance < 4.5) {
          const optimalDistance = 3.4;
          const forceConstant = 5.0;
          const deltaR = distance - optimalDistance;
          const forceMagnitude = -forceConstant * deltaR;
          
          // Direction vector
          const dx = carbon2.position[0] - carbon1.position[0];
          const dy = carbon2.position[1] - carbon1.position[1];
          const dz = carbon2.position[2] - carbon1.position[2];
          
          const forceX = forceMagnitude * dx / distance;
          const forceY = forceMagnitude * dy / distance;
          const forceZ = forceMagnitude * dz / distance;
          
          const index1 = molecule.atoms.findIndex(a => a.id === carbon1.id);
          const index2 = molecule.atoms.findIndex(a => a.id === carbon2.id);
          
          if (index1 !== -1 && index2 !== -1) {
            forces[index1][0] += forceX;
            forces[index1][1] += forceY;
            forces[index1][2] += forceZ;
            
            forces[index2][0] -= forceX;
            forces[index2][1] -= forceY;
            forces[index2][2] -= forceZ;
          }
        }
      }
    }
    
    return forces;
  }
  
  /**
   * Calculate total advanced forces
   */
  calculateAdvancedForces(molecule: Molecule): number[][] {
    const vdwForces = this.calculateVanDerWaalsForces(molecule);
    const electrostaticForces = this.calculateElectrostaticForces(molecule);
    const hBondForces = this.calculateHydrogenBondForces(molecule);
    const piPiForces = this.calculatePiPiStackingForces(molecule);
    
    // Combine all forces
    const totalForces: number[][] = molecule.atoms.map((_, i) => [
      vdwForces[i][0] + electrostaticForces[i][0] + hBondForces[i][0] + piPiForces[i][0],
      vdwForces[i][1] + electrostaticForces[i][1] + hBondForces[i][1] + piPiForces[i][1],
      vdwForces[i][2] + electrostaticForces[i][2] + hBondForces[i][2] + piPiForces[i][2],
    ]);
    
    return totalForces;
  }
  
  /**
   * Calculate solvation energy using implicit solvent model
   */
  calculateSolvationEnergy(molecule: Molecule, solvent: 'water' | 'ethanol' | 'dmso' = 'water'): number {
    const solventParams = {
      water: { dielectric: 78.4, surfaceTension: 0.072 },
      ethanol: { dielectric: 24.3, surfaceTension: 0.022 },
      dmso: { dielectric: 46.7, surfaceTension: 0.043 }
    };
    
    const params = solventParams[solvent];
    let solvationEnergy = 0;
    
    // Born solvation model (simplified)
    molecule.atoms.forEach(atom => {
      const partialCharges: Record<string, number> = {
        'H': 0.1, 'C': -0.1, 'N': -0.3, 'O': -0.4, 'F': -0.4
      };
      
      const charge = partialCharges[atom.element] || 0;
      const radius = this.getVanDerWaalsRadius(atom.element);
      
      // Born solvation energy
      const bornEnergy = -332.0 * (charge * charge) * (1 - 1/params.dielectric) / (2 * radius);
      solvationEnergy += bornEnergy;
    });
    
    return solvationEnergy;
  }
  
  // Helper methods
  private calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const dx = pos2[0] - pos1[0];
    const dy = pos2[1] - pos1[1];
    const dz = pos2[2] - pos1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  private calculateAngle(pos1: [number, number, number], pos2: [number, number, number], pos3: [number, number, number]): number {
    const v1 = [pos1[0] - pos2[0], pos1[1] - pos2[1], pos1[2] - pos2[2]];
    const v2 = [pos3[0] - pos2[0], pos3[1] - pos2[1], pos3[2] - pos2[2]];
    
    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
    
    const cosAngle = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  }
  
  private getVanDerWaalsRadius(element: string): number {
    const radii: Record<string, number> = {
      'H': 1.2, 'C': 1.7, 'N': 1.55, 'O': 1.52, 'F': 1.47,
      'P': 1.8, 'S': 1.8, 'Cl': 1.75
    };
    return radii[element] || 1.5;
  }
}

