import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { 
  Atom, 
  Zap, 
  Eye, 
  EyeOff, 
  Settings, 
  Palette,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuantumVisualizationPanelProps {
  className?: string;
  onOrbitalToggle?: (type: string, visible: boolean) => void;
  onDensityToggle?: (visible: boolean) => void;
  onDensityLevelChange?: (level: number) => void;
  onColorSchemeChange?: (scheme: string) => void;
}

export const QuantumVisualizationPanel: React.FC<QuantumVisualizationPanelProps> = ({
  className,
  onOrbitalToggle,
  onDensityToggle,
  onDensityLevelChange,
  onColorSchemeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeOrbitals, setActiveOrbitals] = useState<Record<string, boolean>>({
    HOMO: false,
    LUMO: false,
    s: false,
    p: false,
    d: false
  });
  const [showDensity, setShowDensity] = useState(false);
  const [densityLevel, setDensityLevel] = useState(0.02);
  const [colorScheme, setColorScheme] = useState('rainbow');

  const handleOrbitalToggle = (orbitalType: string) => {
    const newState = !activeOrbitals[orbitalType];
    setActiveOrbitals(prev => ({
      ...prev,
      [orbitalType]: newState
    }));
    onOrbitalToggle?.(orbitalType, newState);
  };

  const handleDensityToggle = () => {
    const newState = !showDensity;
    setShowDensity(newState);
    onDensityToggle?.(newState);
  };

  const handleDensityLevelChange = (value: number[]) => {
    const level = value[0];
    setDensityLevel(level);
    onDensityLevelChange?.(level);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    onColorSchemeChange?.(scheme);
  };

  const orbitalTypes = [
    { key: 'HOMO', label: 'HOMO', color: 'bg-blue-500', description: 'Highest Occupied Molecular Orbital' },
    { key: 'LUMO', label: 'LUMO', color: 'bg-red-500', description: 'Lowest Unoccupied Molecular Orbital' },
    { key: 's', label: 's', color: 'bg-green-500', description: 'S Orbital (spherical)' },
    { key: 'p', label: 'p', color: 'bg-purple-500', description: 'P Orbital (dumbbell)' },
    { key: 'd', label: 'd', color: 'bg-orange-500', description: 'D Orbital (complex)' },
  ];

  const colorSchemes = [
    { key: 'rainbow', label: 'Rainbow', description: 'Multicolor gradient' },
    { key: 'redBlue', label: 'Red-Blue', description: 'Positive/negative phases' },
    { key: 'grayscale', label: 'Grayscale', description: 'Monochrome density' },
  ];

  return (
    <Card className={cn("w-80 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Visualização Quântica
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Orbitais Moleculares */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Orbitais Moleculares</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {orbitalTypes.map((orbital) => (
              <div
                key={orbital.key}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border transition-all",
                  activeOrbitals[orbital.key] 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", orbital.color)} />
                  <span className="text-sm font-medium">{orbital.label}</span>
                </div>
                <Switch
                  checked={activeOrbitals[orbital.key]}
                  onCheckedChange={() => handleOrbitalToggle(orbital.key)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Densidade Eletrônica */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-semibold">Densidade Eletrônica</h4>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                <span className="text-sm">Mostrar Densidade</span>
                <Switch
                  checked={showDensity}
                  onCheckedChange={handleDensityToggle}
                />
              </div>

              {showDensity && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nível de Densidade</span>
                    <Badge variant="outline" className="text-xs">
                      {densityLevel.toFixed(3)}
                    </Badge>
                  </div>
                  <Slider
                    value={[densityLevel]}
                    onValueChange={handleDensityLevelChange}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Esquema de Cores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold">Esquema de Cores</h4>
              </div>
              
              <div className="space-y-2">
                {colorSchemes.map((scheme) => (
                  <Button
                    key={scheme.key}
                    variant={colorScheme === scheme.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleColorSchemeChange(scheme.key)}
                    className="w-full justify-start text-xs"
                  >
                    {scheme.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Informações */}
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• HOMO/LUMO: Orbitais de fronteira</p>
                <p>• s/p/d: Orbitais atômicos</p>
                <p>• Densidade: Distribuição eletrônica</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

