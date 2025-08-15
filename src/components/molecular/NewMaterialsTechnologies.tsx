import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Zap, 
  Battery, 
  Atom, 
  Lightbulb,
  Cpu,
  Thermometer,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useMolecularStore } from '../../store/molecularStore';
import { Molecule } from '../../types/molecular';

interface MaterialProperty {
  name: string;
  value: number;
  unit: string;
  description: string;
  potential: 'low' | 'medium' | 'high';
}

interface EnergyApplication {
  type: string;
  efficiency: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const NewMaterialsTechnologies: React.FC = () => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [materialProperties, setMaterialProperties] = useState<MaterialProperty[]>([]);
  const [energyApplications, setEnergyApplications] = useState<EnergyApplication[]>([]);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  const analyzeMolecularProperties = (molecule: Molecule) => {
    // Análise baseada na estrutura molecular
    const carbonCount = molecule.atoms.filter(a => a.element === 'C').length;
    const nitrogenCount = molecule.atoms.filter(a => a.element === 'N').length;
    const oxygenCount = molecule.atoms.filter(a => a.element === 'O').length;
    const sulfurCount = molecule.atoms.filter(a => a.element === 'S').length;
    const conjugatedBonds = molecule.bonds.filter(b => b.type === 'double' || b.type === 'triple').length;
    const aromaticRings = Math.floor(conjugatedBonds / 3); // Estimativa simplificada

    // Propriedades condutivas baseadas na conjugação
    const conductivity = Math.min(100, (conjugatedBonds * 15) + (aromaticRings * 25));
    
    // Propriedades piezoelétricas baseadas em assimetria
    const asymmetry = calculateMolecularAsymmetry(molecule);
    const piezoelectricity = Math.min(100, asymmetry * 30);
    
    // Propriedades termoelétricas
    const thermoelectricity = Math.min(100, (conjugatedBonds * 10) + (nitrogenCount * 15));
    
    // Propriedades supercondutoras (baseadas em estruturas específicas)
    const superconductivity = Math.min(100, (carbonCount > 20 ? 40 : 0) + (conjugatedBonds > 10 ? 30 : 0));
    
    // Propriedades fotovoltaicas
    const photovoltaic = Math.min(100, (aromaticRings * 20) + (conjugatedBonds * 8));

    return [
      {
        name: 'Condutividade Elétrica',
        value: conductivity,
        unit: 'S/cm',
        description: 'Capacidade de conduzir corrente elétrica através de ligações conjugadas',
        potential: conductivity > 70 ? 'high' : conductivity > 40 ? 'medium' : 'low'
      },
      {
        name: 'Piezoeletricidade',
        value: piezoelectricity,
        unit: 'pC/N',
        description: 'Geração de eletricidade sob pressão mecânica',
        potential: piezoelectricity > 60 ? 'high' : piezoelectricity > 30 ? 'medium' : 'low'
      },
      {
        name: 'Termoeletricidade',
        value: thermoelectricity,
        unit: 'μV/K',
        description: 'Conversão de diferenças de temperatura em eletricidade',
        potential: thermoelectricity > 50 ? 'high' : thermoelectricity > 25 ? 'medium' : 'low'
      },
      {
        name: 'Supercondutividade',
        value: superconductivity,
        unit: 'K',
        description: 'Condução elétrica sem resistência em baixas temperaturas',
        potential: superconductivity > 60 ? 'high' : superconductivity > 30 ? 'medium' : 'low'
      },
      {
        name: 'Fotovoltaico',
        value: photovoltaic,
        unit: '%',
        description: 'Conversão de luz solar em eletricidade',
        potential: photovoltaic > 55 ? 'high' : photovoltaic > 30 ? 'medium' : 'low'
      }
    ];
  };

  const calculateMolecularAsymmetry = (molecule: Molecule): number => {
    // Cálculo simplificado de assimetria molecular
    const centerOfMass = molecule.atoms.reduce(
      (acc, atom) => ({
        x: acc.x + atom.position[0],
        y: acc.y + atom.position[1],
        z: acc.z + atom.position[2]
      }),
      { x: 0, y: 0, z: 0 }
    );
    
    centerOfMass.x /= molecule.atoms.length;
    centerOfMass.y /= molecule.atoms.length;
    centerOfMass.z /= molecule.atoms.length;

    const asymmetryScore = molecule.atoms.reduce((acc, atom) => {
      const distance = Math.sqrt(
        Math.pow(atom.position[0] - centerOfMass.x, 2) +
        Math.pow(atom.position[1] - centerOfMass.y, 2) +
        Math.pow(atom.position[2] - centerOfMass.z, 2)
      );
      return acc + distance;
    }, 0) / molecule.atoms.length;

    return Math.min(3, asymmetryScore);
  };

  const generateEnergyApplications = (properties: MaterialProperty[]) => {
    const applications: EnergyApplication[] = [];

    properties.forEach(prop => {
      if (prop.potential === 'high' || prop.potential === 'medium') {
        switch (prop.name) {
          case 'Condutividade Elétrica':
            applications.push({
              type: 'Polímeros Condutivos',
              efficiency: prop.value,
              description: 'Materiais flexíveis para eletrônicos orgânicos e sensores',
              icon: <Cpu className="w-4 h-4" />,
              color: 'text-blue-500'
            });
            break;
          case 'Piezoeletricidade':
            applications.push({
              type: 'Coletores de Energia Mecânica',
              efficiency: prop.value,
              description: 'Conversão de movimento e vibração em eletricidade',
              icon: <Activity className="w-4 h-4" />,
              color: 'text-green-500'
            });
            break;
          case 'Termoeletricidade':
            applications.push({
              type: 'Geradores Termoelétricos',
              efficiency: prop.value,
              description: 'Aproveitamento de calor residual para geração de energia',
              icon: <Thermometer className="w-4 h-4" />,
              color: 'text-red-500'
            });
            break;
          case 'Supercondutividade':
            applications.push({
              type: 'Supercondutores Moleculares',
              efficiency: prop.value,
              description: 'Transmissão de energia sem perdas e levitação magnética',
              icon: <Zap className="w-4 h-4" />,
              color: 'text-purple-500'
            });
            break;
          case 'Fotovoltaico':
            applications.push({
              type: 'Células Solares Orgânicas',
              efficiency: prop.value,
              description: 'Painéis solares flexíveis e de baixo custo',
              icon: <Lightbulb className="w-4 h-4" />,
              color: 'text-yellow-500'
            });
            break;
        }
      }
    });

    return applications;
  };

  useEffect(() => {
    if (activeMolecule) {
      setAnalyzing(true);
      
      // Simular análise
      setTimeout(() => {
        const properties = analyzeMolecularProperties(activeMolecule);
        const applications = generateEnergyApplications(properties as MaterialProperty[]);
        
        setMaterialProperties(properties as MaterialProperty[]);
        setEnergyApplications(applications);
        setAnalyzing(false);
      }, 1500);
    }
  }, [activeMolecule]);

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPotentialLabel = (potential: string) => {
    switch (potential) {
      case 'high': return 'Alto Potencial';
      case 'medium': return 'Potencial Médio';
      case 'low': return 'Baixo Potencial';
      default: return 'Não Avaliado';
    }
  };

  if (!activeMolecule) {
    return (
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Atom className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione uma molécula para analisar tecnologias de materiais</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Tecnologias de Novos Materiais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise de potencial para aplicações energéticas
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {analyzing && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Analisando propriedades moleculares...</div>
            <Progress value={60} className="w-full" />
          </div>
        )}

        {!analyzing && materialProperties.length > 0 && (
          <>
            {/* Propriedades dos Materiais */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Propriedades dos Materiais
              </h4>
              
              {materialProperties.map((property, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{property.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPotentialColor(property.potential)}`}
                    >
                      {getPotentialLabel(property.potential)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={property.value} className="flex-1" />
                    <span className="text-xs font-mono">
                      {property.value.toFixed(1)} {property.unit}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {property.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Aplicações Energéticas */}
            {energyApplications.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Aplicações Energéticas Potenciais
                </h4>
                
                {energyApplications.map((app, index) => (
                  <div key={index} className="bg-accent/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={app.color}>{app.icon}</span>
                      <span className="font-medium text-sm">{app.type}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                      <span className="text-xs font-mono">
                        {app.efficiency.toFixed(1)}%
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {app.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Tecnologias Emergentes</p>
                  <p>
                    Esta análise identifica potenciais aplicações baseadas na estrutura molecular. 
                    Resultados experimentais podem variar dependendo de fatores como pureza, 
                    processamento e condições ambientais.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

