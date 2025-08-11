import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Thermometer, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Activity,
  Atom,
  Magnet,
  Wind,
  Target,
  TrendingUp,
  AlertTriangle,
  Info,
  Beaker,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMolecularStore } from '../../store/molecularStore';
import { Molecule, Atom as AtomType } from '../../types/molecular';

interface PhysicsState {
  temperature: number; // Kelvin
  pressure: number; // atm
  volume: number; // Å³
  energy: {
    kinetic: number;
    potential: number;
    total: number;
  };
  forces: {
    vanDerWaals: number;
    electrostatic: number;
    hydrogen: number;
    dipole: number;
  };
}

interface InteractionSuggestion {
  type: 'hydrogen_bond' | 'van_der_waals' | 'electrostatic' | 'pi_stacking' | 'hydrophobic';
  atom1Id: string;
  atom2Id: string;
  strength: number;
  distance: number;
  angle?: number;
  description: string;
  howToObtain: string;
}

interface MolecularDynamicsParams {
  timestep: number; // fs
  temperature: number; // K
  thermostat: 'none' | 'berendsen' | 'nose_hoover';
  integrator: 'verlet' | 'leapfrog';
  cutoff: number; // Å
}

export const PhysicsBasedMolecularEngine: React.FC = () => {
  const { molecules, activeMoleculeId, updateAtomPosition } = useMolecularStore();
  const [isRunning, setIsRunning] = useState(false);
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    temperature: 298.15, // 25°C
    pressure: 1.0,
    volume: 1000,
    energy: { kinetic: 0, potential: 0, total: 0 },
    forces: { vanDerWaals: 0, electrostatic: 0, hydrogen: 0, dipole: 0 }
  });
  const [mdParams, setMdParams] = useState<MolecularDynamicsParams>({
    timestep: 1.0,
    temperature: 298.15,
    thermostat: 'berendsen',
    integrator: 'verlet',
    cutoff: 12.0
  });
  const [interactions, setInteractions] = useState<InteractionSuggestion[]>([]);
  const [simulationTime, setSimulationTime] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const animationRef = useRef<number>();
  const velocitiesRef = useRef<Map<string, [number, number, number]>>(new Map());
  const forcesRef = useRef<Map<string, [number, number, number]>>(new Map());

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  // Constantes físicas
  const BOLTZMANN = 8.314e-3; // kJ/(mol·K)
  const AVOGADRO = 6.022e23;
  const EPSILON_0 = 8.854e-12; // F/m
  const ELEMENTARY_CHARGE = 1.602e-19; // C

  // Parâmetros de Lennard-Jones para diferentes elementos
  const LJ_PARAMS: Record<string, { sigma: number; epsilon: number }> = {
    'H': { sigma: 2.81, epsilon: 0.0157 },
    'C': { sigma: 3.40, epsilon: 0.359 },
    'N': { sigma: 3.25, epsilon: 0.711 },
    'O': { sigma: 3.12, epsilon: 0.669 },
    'S': { sigma: 3.60, epsilon: 1.046 },
    'P': { sigma: 3.74, epsilon: 0.815 },
    'F': { sigma: 2.95, epsilon: 0.255 },
    'Cl': { sigma: 3.52, epsilon: 1.108 },
    'Br': { sigma: 3.73, epsilon: 1.519 },
    'I': { sigma: 3.98, epsilon: 2.315 }
  };

  // Calcular forças de van der Waals (Lennard-Jones)
  const calculateVanDerWaalsForce = useCallback((atom1: AtomType, atom2: AtomType): [number, number, number] => {
    const params1 = LJ_PARAMS[atom1.element] || LJ_PARAMS['C'];
    const params2 = LJ_PARAMS[atom2.element] || LJ_PARAMS['C'];
    
    const sigma = (params1.sigma + params2.sigma) / 2;
    const epsilon = Math.sqrt(params1.epsilon * params2.epsilon);
    
    const dx = atom2.position[0] - atom1.position[0];
    const dy = atom2.position[1] - atom1.position[1];
    const dz = atom2.position[2] - atom1.position[2];
    
    const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (r > mdParams.cutoff || r < 0.1) return [0, 0, 0];
    
    const sr = sigma / r;
    const sr6 = Math.pow(sr, 6);
    const sr12 = sr6 * sr6;
    
    const force_magnitude = 24 * epsilon * (2 * sr12 - sr6) / r;
    
    return [
      force_magnitude * dx / r,
      force_magnitude * dy / r,
      force_magnitude * dz / r
    ];
  }, [mdParams.cutoff]);

  // Calcular forças eletrostáticas (Lei de Coulomb)
  const calculateElectrostaticForce = useCallback((atom1: AtomType, atom2: AtomType): [number, number, number] => {
    const charge1 = atom1.charge || 0;
    const charge2 = atom2.charge || 0;
    
    if (charge1 === 0 || charge2 === 0) return [0, 0, 0];
    
    const dx = atom2.position[0] - atom1.position[0];
    const dy = atom2.position[1] - atom1.position[1];
    const dz = atom2.position[2] - atom1.position[2];
    
    const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (r > mdParams.cutoff || r < 0.1) return [0, 0, 0];
    
    // Constante de Coulomb em unidades apropriadas
    const k = 332.0637; // kcal·Å/(mol·e²)
    const force_magnitude = k * charge1 * charge2 / (r * r * r);
    
    return [
      force_magnitude * dx,
      force_magnitude * dy,
      force_magnitude * dz
    ];
  }, [mdParams.cutoff]);

  // Detectar ligações de hidrogênio
  const detectHydrogenBonds = useCallback((atoms: AtomType[]): InteractionSuggestion[] => {
    const hBonds: InteractionSuggestion[] = [];
    
    for (let i = 0; i < atoms.length; i++) {
      const donor = atoms[i];
      if (donor.element !== 'H') continue;
      
      for (let j = 0; j < atoms.length; j++) {
        if (i === j) continue;
        const acceptor = atoms[j];
        
        // Acceptor deve ser N, O, ou F
        if (!['N', 'O', 'F'].includes(acceptor.element)) continue;
        
        const dx = acceptor.position[0] - donor.position[0];
        const dy = acceptor.position[1] - donor.position[1];
        const dz = acceptor.position[2] - donor.position[2];
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Critério de distância para ligação de hidrogênio
        if (distance > 1.8 && distance < 3.5) {
          const strength = Math.max(0, 1 - (distance - 1.8) / 1.7);
          
          hBonds.push({
            type: 'hydrogen_bond',
            atom1Id: donor.id,
            atom2Id: acceptor.id,
            strength,
            distance,
            description: `Ligação de hidrogênio ${donor.element}-H···${acceptor.element}`,
            howToObtain: `Aproximar átomos de hidrogênio ligados a ${donor.element} de átomos de ${acceptor.element}. Distância ideal: 2.0-2.8 Å`
          });
        }
      }
    }
    
    return hBonds;
  }, []);

  // Detectar interações π-π stacking
  const detectPiStacking = useCallback((atoms: AtomType[]): InteractionSuggestion[] => {
    const piInteractions: InteractionSuggestion[] = [];
    
    // Identificar anéis aromáticos (simplificado)
    const aromaticCarbons = atoms.filter(atom => 
      atom.element === 'C' && 
      atom.hybridization === 'sp2' // Assumindo que temos essa informação
    );
    
    for (let i = 0; i < aromaticCarbons.length; i++) {
      for (let j = i + 1; j < aromaticCarbons.length; j++) {
        const atom1 = aromaticCarbons[i];
        const atom2 = aromaticCarbons[j];
        
        const dx = atom2.position[0] - atom1.position[0];
        const dy = atom2.position[1] - atom1.position[1];
        const dz = atom2.position[2] - atom1.position[2];
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Critério para π-π stacking
        if (distance > 3.0 && distance < 5.0) {
          const strength = Math.max(0, 1 - (distance - 3.0) / 2.0);
          
          piInteractions.push({
            type: 'pi_stacking',
            atom1Id: atom1.id,
            atom2Id: atom2.id,
            strength,
            distance,
            description: `Interação π-π entre anéis aromáticos`,
            howToObtain: `Posicionar anéis aromáticos paralelos a 3.5-4.5 Å de distância. Controlar orientação para maximizar sobreposição orbital.`
          });
        }
      }
    }
    
    return piInteractions;
  }, []);

  // Calcular energia cinética
  const calculateKineticEnergy = useCallback((): number => {
    if (!activeMolecule) return 0;
    
    let totalKE = 0;
    activeMolecule.atoms.forEach(atom => {
      const velocity = velocitiesRef.current.get(atom.id) || [0, 0, 0];
      const mass = getAtomicMass(atom.element);
      const v2 = velocity[0]*velocity[0] + velocity[1]*velocity[1] + velocity[2]*velocity[2];
      totalKE += 0.5 * mass * v2;
    });
    
    return totalKE;
  }, [activeMolecule]);

  // Calcular energia potencial
  const calculatePotentialEnergy = useCallback((): number => {
    if (!activeMolecule) return 0;
    
    let totalPE = 0;
    const atoms = activeMolecule.atoms;
    
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const atom1 = atoms[i];
        const atom2 = atoms[j];
        
        const dx = atom2.position[0] - atom1.position[0];
        const dy = atom2.position[1] - atom1.position[1];
        const dz = atom2.position[2] - atom1.position[2];
        const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (r > mdParams.cutoff) continue;
        
        // Lennard-Jones potential
        const params1 = LJ_PARAMS[atom1.element] || LJ_PARAMS['C'];
        const params2 = LJ_PARAMS[atom2.element] || LJ_PARAMS['C'];
        const sigma = (params1.sigma + params2.sigma) / 2;
        const epsilon = Math.sqrt(params1.epsilon * params2.epsilon);
        
        const sr = sigma / r;
        const sr6 = Math.pow(sr, 6);
        const sr12 = sr6 * sr6;
        
        totalPE += 4 * epsilon * (sr12 - sr6);
        
        // Coulomb potential
        const charge1 = atom1.charge || 0;
        const charge2 = atom2.charge || 0;
        if (charge1 !== 0 && charge2 !== 0) {
          const k = 332.0637;
          totalPE += k * charge1 * charge2 / r;
        }
      }
    }
    
    return totalPE;
  }, [activeMolecule, mdParams.cutoff]);

  // Obter massa atômica
  const getAtomicMass = (element: string): number => {
    const masses: Record<string, number> = {
      'H': 1.008, 'C': 12.011, 'N': 14.007, 'O': 15.999,
      'S': 32.065, 'P': 30.974, 'F': 18.998, 'Cl': 35.453,
      'Br': 79.904, 'I': 126.904
    };
    return masses[element] || 12.011;
  };

  // Aplicar termostato de Berendsen
  const applyBerendsenThermostat = useCallback((targetTemp: number, tau: number = 0.1) => {
    if (!activeMolecule) return;
    
    const currentKE = calculateKineticEnergy();
    const currentTemp = (2 * currentKE) / (3 * BOLTZMANN * activeMolecule.atoms.length);
    
    if (currentTemp > 0) {
      const scaleFactor = Math.sqrt(1 + (mdParams.timestep / tau) * (targetTemp / currentTemp - 1));
      
      activeMolecule.atoms.forEach(atom => {
        const velocity = velocitiesRef.current.get(atom.id) || [0, 0, 0];
        velocitiesRef.current.set(atom.id, [
          velocity[0] * scaleFactor,
          velocity[1] * scaleFactor,
          velocity[2] * scaleFactor
        ]);
      });
    }
  }, [activeMolecule, calculateKineticEnergy, mdParams.timestep]);

  // Integrador Velocity Verlet
  const velocityVerletStep = useCallback(() => {
    if (!activeMolecule) return;
    
    const dt = mdParams.timestep * 1e-15; // Convert fs to s
    
    activeMolecule.atoms.forEach(atom => {
      const mass = getAtomicMass(atom.element) * 1.66054e-27; // Convert to kg
      const velocity = velocitiesRef.current.get(atom.id) || [0, 0, 0];
      const force = forcesRef.current.get(atom.id) || [0, 0, 0];
      
      // Update position
      const newPosition: [number, number, number] = [
        atom.position[0] + velocity[0] * dt + 0.5 * (force[0] / mass) * dt * dt,
        atom.position[1] + velocity[1] * dt + 0.5 * (force[1] / mass) * dt * dt,
        atom.position[2] + velocity[2] * dt + 0.5 * (force[2] / mass) * dt * dt
      ];
      
      // Calculate new forces
      const newForce = [0, 0, 0];
      activeMolecule.atoms.forEach(otherAtom => {
        if (atom.id !== otherAtom.id) {
          const vdwForce = calculateVanDerWaalsForce(atom, otherAtom);
          const elecForce = calculateElectrostaticForce(atom, otherAtom);
          
          newForce[0] += vdwForce[0] + elecForce[0];
          newForce[1] += vdwForce[1] + elecForce[1];
          newForce[2] += vdwForce[2] + elecForce[2];
        }
      });
      
      // Update velocity
      const newVelocity: [number, number, number] = [
        velocity[0] + 0.5 * (force[0] + newForce[0]) / mass * dt,
        velocity[1] + 0.5 * (force[1] + newForce[1]) / mass * dt,
        velocity[2] + 0.5 * (force[2] + newForce[2]) / mass * dt
      ];
      
      // Update stored values
      velocitiesRef.current.set(atom.id, newVelocity);
      forcesRef.current.set(atom.id, newForce);
      
      // Update atom position in store
      updateAtomPosition(activeMolecule.id, atom.id, newPosition);
    });
  }, [activeMolecule, mdParams.timestep, calculateVanDerWaalsForce, calculateElectrostaticForce, updateAtomPosition]);

  // Loop principal da simulação
  const simulationStep = useCallback(() => {
    if (!isRunning || !activeMolecule) return;
    
    // Executar passo de dinâmica molecular
    velocityVerletStep();
    
    // Aplicar termostato
    if (mdParams.thermostat === 'berendsen') {
      applyBerendsenThermostat(mdParams.temperature);
    }
    
    // Atualizar estado físico
    const kineticEnergy = calculateKineticEnergy();
    const potentialEnergy = calculatePotentialEnergy();
    const currentTemp = (2 * kineticEnergy) / (3 * BOLTZMANN * activeMolecule.atoms.length);
    
    setPhysicsState(prev => ({
      ...prev,
      temperature: currentTemp,
      energy: {
        kinetic: kineticEnergy,
        potential: potentialEnergy,
        total: kineticEnergy + potentialEnergy
      }
    }));
    
    // Detectar interações
    const hBonds = detectHydrogenBonds(activeMolecule.atoms);
    const piStacks = detectPiStacking(activeMolecule.atoms);
    setInteractions([...hBonds, ...piStacks]);
    
    setSimulationTime(prev => prev + mdParams.timestep);
    
    animationRef.current = requestAnimationFrame(simulationStep);
  }, [isRunning, activeMolecule, velocityVerletStep, applyBerendsenThermostat, calculateKineticEnergy, calculatePotentialEnergy, detectHydrogenBonds, detectPiStacking, mdParams]);

  // Inicializar velocidades com distribuição de Maxwell-Boltzmann
  const initializeVelocities = useCallback((temperature: number) => {
    if (!activeMolecule) return;
    
    activeMolecule.atoms.forEach(atom => {
      const mass = getAtomicMass(atom.element);
      const sigma = Math.sqrt(BOLTZMANN * temperature / mass);
      
      // Gerar velocidades com distribuição gaussiana
      const vx = sigma * (Math.random() - 0.5) * 2;
      const vy = sigma * (Math.random() - 0.5) * 2;
      const vz = sigma * (Math.random() - 0.5) * 2;
      
      velocitiesRef.current.set(atom.id, [vx, vy, vz]);
      forcesRef.current.set(atom.id, [0, 0, 0]);
    });
  }, [activeMolecule]);

  // Controles da simulação
  const startSimulation = () => {
    if (!activeMolecule) return;
    
    initializeVelocities(mdParams.temperature);
    setIsRunning(true);
    setSimulationTime(0);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    velocitiesRef.current.clear();
    forcesRef.current.clear();
    setSimulationTime(0);
    setPhysicsState(prev => ({
      ...prev,
      energy: { kinetic: 0, potential: 0, total: 0 }
    }));
  };

  // Efeito para executar simulação
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(simulationStep);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, simulationStep]);

  if (!activeMolecule) {
    return (
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Atom className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione uma molécula para simulação física</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-green-500" />
          Simulação Física Molecular
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dinâmica molecular baseada em física real
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles da Simulação */}
        <div className="flex gap-2">
          <Button
            onClick={isRunning ? stopSimulation : startSimulation}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
          <Button
            onClick={resetSimulation}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Status da Simulação */}
        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tempo de Simulação</span>
            <Badge variant="outline" className="text-xs">
              {simulationTime.toFixed(1)} fs
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Temperatura:</span>
              <div className="font-medium flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {physicsState.temperature.toFixed(1)} K
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Energia Total:</span>
              <div className="font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {physicsState.energy.total.toFixed(2)} kJ/mol
              </div>
            </div>
          </div>
        </div>

        {/* Controle de Temperatura */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Temperatura Alvo</label>
            <span className="text-xs text-muted-foreground">
              {mdParams.temperature.toFixed(0)} K ({(mdParams.temperature - 273.15).toFixed(0)}°C)
            </span>
          </div>
          <Slider
            value={[mdParams.temperature]}
            onValueChange={([value]) => setMdParams(prev => ({ ...prev, temperature: value }))}
            min={200}
            max={500}
            step={5}
            className="w-full"
          />
        </div>

        {/* Parâmetros Avançados */}
        {showAdvanced && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <h4 className="font-semibold text-sm">Parâmetros de Simulação</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Timestep (fs)</label>
                <Slider
                  value={[mdParams.timestep]}
                  onValueChange={([value]) => setMdParams(prev => ({ ...prev, timestep: value }))}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />
                <span className="text-xs text-muted-foreground">{mdParams.timestep.toFixed(1)}</span>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Cutoff (Å)</label>
                <Slider
                  value={[mdParams.cutoff]}
                  onValueChange={([value]) => setMdParams(prev => ({ ...prev, cutoff: value }))}
                  min={8.0}
                  max={20.0}
                  step={0.5}
                />
                <span className="text-xs text-muted-foreground">{mdParams.cutoff.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Energias */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Componentes de Energia
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Cinética</span>
              <span className="font-mono">{physicsState.energy.kinetic.toFixed(2)} kJ/mol</span>
            </div>
            <Progress value={(physicsState.energy.kinetic / Math.max(physicsState.energy.total, 1)) * 100} className="h-1" />
            
            <div className="flex items-center justify-between text-xs">
              <span>Potencial</span>
              <span className="font-mono">{physicsState.energy.potential.toFixed(2)} kJ/mol</span>
            </div>
            <Progress value={(Math.abs(physicsState.energy.potential) / Math.max(Math.abs(physicsState.energy.total), 1)) * 100} className="h-1" />
          </div>
        </div>

        {/* Interações Detectadas */}
        {interactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Magnet className="w-4 h-4" />
              Interações Intermoleculares ({interactions.length})
            </h4>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {interactions.map((interaction, index) => (
                <Card key={index} className="p-2 bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={interaction.type === 'hydrogen_bond' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {interaction.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs font-mono">
                        {interaction.distance.toFixed(2)} Å
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {interaction.description}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-blue-500" />
                      <Progress value={interaction.strength * 100} className="flex-1 h-1" />
                      <span className="text-xs">{Math.round(interaction.strength * 100)}%</span>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
                      <div className="flex items-start gap-1">
                        <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-800 mb-1">Como obter:</p>
                          <p className="text-blue-700">{interaction.howToObtain}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Beaker className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="text-xs text-green-800">
              <p className="font-medium mb-1">Simulação Física Real</p>
              <p>
                Esta simulação usa forças de Lennard-Jones, eletrostáticas e detecção de ligações de hidrogênio. 
                A temperatura controla a energia cinética das partículas seguindo a distribuição de Maxwell-Boltzmann.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

