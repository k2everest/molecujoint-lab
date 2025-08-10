export interface ForceFieldParameters {
  lennardJones: {
    epsilon: number; // kcal/mol
    sigma: number;   // Angstroms
  };
  harmonic: {
    equilibriumLength: number; // Angstroms
    forceConstant: number;     // kcal/mol/Å²
  };
  angle: {
    equilibriumAngle: number;  // degrees
    forceConstant: number;     // kcal/mol/rad²
  };
  torsion: {
    phase: number;        // degrees
    amplitude: number;    // kcal/mol
    periodicity: number;  // fold
  };
}

export interface PhysicsCalculation {
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
  temperature: number;
  forces: [number, number, number][];
  vibrationalFrequencies?: number[];
}

export interface AIParameters {
  element1: string;
  element2: string;
  bondType: 'single' | 'double' | 'triple' | 'aromatic';
  parameters: ForceFieldParameters;
}

export interface SimulationSettings {
  timeStep: number;     // femtoseconds
  temperature: number;  // Kelvin
  steps: number;
  dampingFactor: number;
  integrator: 'verlet' | 'langevin' | 'nose-hoover';
  thermostatCoupling?: number;
  friction?: number;
}

export const DEFAULT_FORCE_FIELD: Record<string, Record<string, ForceFieldParameters>> = {
  'C': {
    'C': {
      lennardJones: { epsilon: 0.105, sigma: 3.40 },
      harmonic: { equilibriumLength: 1.54, forceConstant: 317.0 },
      angle: { equilibriumAngle: 109.5, forceConstant: 58.35 },
      torsion: { phase: 0, amplitude: 1.40, periodicity: 3 }
    },
    'H': {
      lennardJones: { epsilon: 0.033, sigma: 2.85 },
      harmonic: { equilibriumLength: 1.09, forceConstant: 340.0 },
      angle: { equilibriumAngle: 109.5, forceConstant: 37.5 },
      torsion: { phase: 0, amplitude: 0.16, periodicity: 3 }
    },
    'O': {
      lennardJones: { epsilon: 0.079, sigma: 3.25 },
      harmonic: { equilibriumLength: 1.43, forceConstant: 267.8 },
      angle: { equilibriumAngle: 111.0, forceConstant: 50.0 },
      torsion: { phase: 0, amplitude: 1.15, periodicity: 3 }
    },
    'N': {
      lennardJones: { epsilon: 0.086, sigma: 3.25 },
      harmonic: { equilibriumLength: 1.47, forceConstant: 282.0 },
      angle: { equilibriumAngle: 109.5, forceConstant: 50.0 },
      torsion: { phase: 0, amplitude: 1.35, periodicity: 3 }
    }
  },
  'H': {
    'H': {
      lennardJones: { epsilon: 0.016, sigma: 2.50 },
      harmonic: { equilibriumLength: 0.74, forceConstant: 553.0 },
      angle: { equilibriumAngle: 180.0, forceConstant: 0.0 },
      torsion: { phase: 0, amplitude: 0.0, periodicity: 1 }
    },
    'O': {
      lennardJones: { epsilon: 0.018, sigma: 2.65 },
      harmonic: { equilibriumLength: 0.96, forceConstant: 553.0 },
      angle: { equilibriumAngle: 104.5, forceConstant: 100.0 },
      torsion: { phase: 0, amplitude: 0.0, periodicity: 1 }
    },
    'N': {
      lennardJones: { epsilon: 0.019, sigma: 2.65 },
      harmonic: { equilibriumLength: 1.01, forceConstant: 434.0 },
      angle: { equilibriumAngle: 106.8, forceConstant: 35.0 },
      torsion: { phase: 0, amplitude: 0.0, periodicity: 1 }
    }
  },
  'O': {
    'O': {
      lennardJones: { epsilon: 0.210, sigma: 2.96 },
      harmonic: { equilibriumLength: 1.21, forceConstant: 1098.0 },
      angle: { equilibriumAngle: 120.0, forceConstant: 80.0 },
      torsion: { phase: 180, amplitude: 2.32, periodicity: 2 }
    },
    'N': {
      lennardJones: { epsilon: 0.137, sigma: 3.11 },
      harmonic: { equilibriumLength: 1.25, forceConstant: 761.0 },
      angle: { equilibriumAngle: 115.0, forceConstant: 70.0 },
      torsion: { phase: 180, amplitude: 1.80, periodicity: 2 }
    }
  },
  'N': {
    'N': {
      lennardJones: { epsilon: 0.170, sigma: 3.25 },
      harmonic: { equilibriumLength: 1.25, forceConstant: 549.0 },
      angle: { equilibriumAngle: 120.0, forceConstant: 70.0 },
      torsion: { phase: 180, amplitude: 4.90, periodicity: 2 }
    }
  }
};