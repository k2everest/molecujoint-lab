import { Atom, Molecule } from '../types/molecular';
import { SimulationSettings } from '../types/physics';

export interface MDState {
  positions: number[][];
  velocities: number[][];
  forces: number[][];
  time: number;
  temperature: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

export class MolecularDynamicsSimulator {
  private timestep: number;
  private temperature: number;
  private thermostatCoupling: number;
  private friction: number;

  constructor(settings: SimulationSettings) {
    this.timestep = settings.timeStep || 0.001; // fs
    this.temperature = settings.temperature || 300; // K
    this.thermostatCoupling = settings.thermostatCoupling || 0.1;
    this.friction = settings.friction || 0.01;
  }

  /**
   * Velocity Verlet integration algorithm
   * More stable and accurate than simple Euler integration
   */
  velocityVerletStep(state: MDState, forces: number[][]): MDState {
    const dt = this.timestep;
    const numAtoms = state.positions.length;
    
    const newPositions: number[][] = [];
    const newVelocities: number[][] = [];
    
    for (let i = 0; i < numAtoms; i++) {
      const pos = state.positions[i];
      const vel = state.velocities[i];
      const force = forces[i];
      const oldForce = state.forces[i];
      
      // Update positions: r(t+dt) = r(t) + v(t)*dt + 0.5*a(t)*dt^2
      const newPos = [
        pos[0] + vel[0] * dt + 0.5 * oldForce[0] * dt * dt,
        pos[1] + vel[1] * dt + 0.5 * oldForce[1] * dt * dt,
        pos[2] + vel[2] * dt + 0.5 * oldForce[2] * dt * dt
      ];
      
      // Update velocities: v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
      const newVel = [
        vel[0] + 0.5 * (oldForce[0] + force[0]) * dt,
        vel[1] + 0.5 * (oldForce[1] + force[1]) * dt,
        vel[2] + 0.5 * (oldForce[2] + force[2]) * dt
      ];
      
      newPositions.push(newPos);
      newVelocities.push(newVel);
    }
    
    return {
      ...state,
      positions: newPositions,
      velocities: newVelocities,
      forces: forces,
      time: state.time + dt
    };
  }

  /**
   * Berendsen thermostat for temperature control
   * Gradually adjusts velocities to maintain target temperature
   */
  applyBerendsenThermostat(state: MDState): MDState {
    const currentTemp = this.calculateTemperature(state.velocities);
    const targetTemp = this.temperature;
    
    if (Math.abs(currentTemp - targetTemp) < 1.0) {
      return state; // Temperature is close enough
    }
    
    // Scaling factor for velocities
    const tau = this.thermostatCoupling;
    const dt = this.timestep;
    const lambda = Math.sqrt(1 + (dt / tau) * (targetTemp / currentTemp - 1));
    
    const scaledVelocities = state.velocities.map(vel => [
      vel[0] * lambda,
      vel[1] * lambda,
      vel[2] * lambda
    ]);
    
    return {
      ...state,
      velocities: scaledVelocities,
      temperature: this.calculateTemperature(scaledVelocities)
    };
  }

  /**
   * Langevin dynamics for stochastic temperature control
   * Adds random forces to simulate thermal fluctuations
   */
  applyLangevinDynamics(state: MDState): MDState {
    const dt = this.timestep;
    const gamma = this.friction;
    const kB = 8.314e-3; // Boltzmann constant in kJ/(mol·K)
    const T = this.temperature;
    
    const newVelocities = state.velocities.map(vel => {
      // Random force component
      const randomForce = [
        this.gaussianRandom() * Math.sqrt(2 * gamma * kB * T / dt),
        this.gaussianRandom() * Math.sqrt(2 * gamma * kB * T / dt),
        this.gaussianRandom() * Math.sqrt(2 * gamma * kB * T / dt)
      ];
      
      // Apply friction and random force
      return [
        vel[0] * (1 - gamma * dt) + randomForce[0] * dt,
        vel[1] * (1 - gamma * dt) + randomForce[1] * dt,
        vel[2] * (1 - gamma * dt) + randomForce[2] * dt
      ];
    });
    
    return {
      ...state,
      velocities: newVelocities,
      temperature: this.calculateTemperature(newVelocities)
    };
  }

  /**
   * Calculate instantaneous temperature from velocities
   */
  calculateTemperature(velocities: number[][]): number {
    const kB = 8.314e-3; // Boltzmann constant in kJ/(mol·K)
    let kineticEnergy = 0;
    
    velocities.forEach(vel => {
      kineticEnergy += vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2];
    });
    
    // T = (2/3) * KE / (N * kB)
    const numDegreesOfFreedom = 3 * velocities.length;
    return (2 * kineticEnergy) / (numDegreesOfFreedom * kB);
  }

  /**
   * Calculate kinetic energy
   */
  calculateKineticEnergy(velocities: number[][]): number {
    let kineticEnergy = 0;
    
    velocities.forEach(vel => {
      kineticEnergy += 0.5 * (vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);
    });
    
    return kineticEnergy;
  }

  /**
   * Initialize velocities from Maxwell-Boltzmann distribution
   */
  initializeVelocities(numAtoms: number, temperature: number): number[][] {
    const kB = 8.314e-3; // Boltzmann constant
    const velocities: number[][] = [];
    
    for (let i = 0; i < numAtoms; i++) {
      // Assume unit mass for simplicity
      const sigma = Math.sqrt(kB * temperature);
      
      velocities.push([
        this.gaussianRandom() * sigma,
        this.gaussianRandom() * sigma,
        this.gaussianRandom() * sigma
      ]);
    }
    
    // Remove center of mass motion
    return this.removeCenterOfMassMotion(velocities);
  }

  /**
   * Remove center of mass motion to prevent drift
   */
  removeCenterOfMassMotion(velocities: number[][]): number[][] {
    const numAtoms = velocities.length;
    
    // Calculate center of mass velocity
    const comVel = [0, 0, 0];
    velocities.forEach(vel => {
      comVel[0] += vel[0];
      comVel[1] += vel[1];
      comVel[2] += vel[2];
    });
    
    comVel[0] /= numAtoms;
    comVel[1] /= numAtoms;
    comVel[2] /= numAtoms;
    
    // Subtract center of mass velocity
    return velocities.map(vel => [
      vel[0] - comVel[0],
      vel[1] - comVel[1],
      vel[2] - comVel[2]
    ]);
  }

  /**
   * Generate Gaussian random number using Box-Muller transform
   */
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Create initial MD state from molecule
   */
  createInitialState(molecule: Molecule): MDState {
    const positions = molecule.atoms.map(atom => [...atom.position]);
    const velocities = this.initializeVelocities(molecule.atoms.length, this.temperature);
    const forces = molecule.atoms.map(() => [0, 0, 0]);
    
    return {
      positions,
      velocities,
      forces,
      time: 0,
      temperature: this.calculateTemperature(velocities),
      kineticEnergy: this.calculateKineticEnergy(velocities),
      potentialEnergy: 0
    };
  }

  /**
   * Run a single MD step
   */
  step(state: MDState, calculateForces: (positions: number[][]) => number[][]): MDState {
    // Calculate forces at current positions
    const forces = calculateForces(state.positions);
    
    // Velocity Verlet integration
    let newState = this.velocityVerletStep(state, forces);
    
    // Apply thermostat
    newState = this.applyBerendsenThermostat(newState);
    
    // Update energies
    newState.kineticEnergy = this.calculateKineticEnergy(newState.velocities);
    newState.temperature = this.calculateTemperature(newState.velocities);
    
    return newState;
  }
}

