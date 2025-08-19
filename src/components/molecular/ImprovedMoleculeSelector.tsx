import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { 
  Atom, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye,
  EyeOff,
  Beaker,
  Dna,
  Move,
  Maximize2,
  Minimize2,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMolecularStore } from '../../store/molecularStore';

interface ImprovedMoleculeSelectorProps {
  className?: string;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  size?: 'small' | 'medium' | 'large';
  onSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ImprovedMoleculeSelector: React.FC<ImprovedMoleculeSelectorProps> = ({
  className,
  position = { x: 20, y: 20 },
  onPositionChange,
  size = 'medium',
  onSizeChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { 
    molecules, 
    activeMoleculeId, 
    setActiveMolecule, 
    removeMolecule 
  } = useMolecularStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);
  const currentIndex = molecules.findIndex(m => m.id === activeMoleculeId);

  const sizeClasses = {
    small: 'w-64',
    medium: 'w-80',
    large: 'w-96'
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handlePrevious = () => {
    if (molecules.length > 1) {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : molecules.length - 1;
      setActiveMolecule(molecules[prevIndex].id);
    }
  };

  const handleNext = () => {
    if (molecules.length > 1) {
      const nextIndex = currentIndex < molecules.length - 1 ? currentIndex + 1 : 0;
      setActiveMolecule(molecules[nextIndex].id);
    }
  };

  const handleSelectMolecule = (moleculeId: string) => {
    setActiveMolecule(moleculeId);
  };

  const handleRemoveMolecule = (moleculeId: string) => {
    if (molecules.length > 1) {
      removeMolecule(moleculeId);
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'PubMed':
        return <Beaker className="w-3 h-3" />;
      case 'AI Designer':
        return <Dna className="w-3 h-3" />;
      default:
        return <Atom className="w-3 h-3" />;
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'PubMed':
        return 'border-blue-300 text-blue-700 bg-blue-50';
      case 'AI Designer':
        return 'border-purple-300 text-purple-700 bg-purple-50';
      default:
        return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  if (molecules.length === 0) {
    return (
      <Card 
        className={cn(
          "bg-card/95 backdrop-blur-sm border-2 border-dashed border-muted-foreground/20 absolute z-50",
          sizeClasses[size],
          className
        )}
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <CardContent className="p-4 text-center">
          <div className="text-muted-foreground">
            <Atom className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma molécula carregada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "bg-card/95 backdrop-blur-sm border shadow-lg absolute z-50 transition-all duration-200",
        sizeClasses[size],
        isDragging && "cursor-grabbing",
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Header with drag handle and controls */}
      <CardHeader 
        className="pb-2 cursor-grab drag-handle flex flex-row items-center justify-between space-y-0"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Seletor de Moléculas
          </CardTitle>
        </div>
        
        <div className="flex items-center gap-1">
          {molecules.length > 1 && (
            <Badge variant="outline" className="text-xs">
              {currentIndex + 1} de {molecules.length}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </Button>
        </div>
      </CardHeader>

      {/* Settings Panel */}
      {showSettings && !isCollapsed && (
        <div className="px-4 pb-2 border-b">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Tamanho:</span>
              <div className="flex gap-1">
                {(['small', 'medium', 'large'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={size === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSizeChange?.(s)}
                    className="h-6 px-2 text-xs"
                  >
                    {s === 'small' && <Minimize2 className="w-3 h-3" />}
                    {s === 'medium' && <Maximize2 className="w-3 h-3" />}
                    {s === 'large' && <Maximize2 className="w-3 h-3" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!isCollapsed && (
        <CardContent className="space-y-3">
          {/* Navigation Controls */}
          {molecules.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="flex-1"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Dropdown Selector */}
          {molecules.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Selecionar Molécula:
              </label>
              <Select value={activeMoleculeId || ''} onValueChange={handleSelectMolecule}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione uma molécula" />
                </SelectTrigger>
                <SelectContent>
                  {molecules.map((molecule, index) => (
                    <SelectItem key={molecule.id} value={molecule.id}>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(molecule.metadata?.source)}
                        <span>{molecule.name}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {molecule.atoms.length} átomos
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Current Molecule Info */}
          {activeMolecule && (
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{activeMolecule.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMolecule(activeMolecule.id)}
                  disabled={molecules.length <= 1}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Átomos:</span>
                  <div className="font-medium">{activeMolecule.atoms.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Ligações:</span>
                  <div className="font-medium">{activeMolecule.bonds.length}</div>
                </div>
              </div>

              {activeMolecule.metadata?.formula && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Fórmula:</span>
                  <div className="font-mono font-medium">{activeMolecule.metadata.formula}</div>
                </div>
              )}

              {activeMolecule.metadata?.source && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs w-fit", getSourceColor(activeMolecule.metadata.source))}
                >
                  {getSourceIcon(activeMolecule.metadata.source)}
                  <span className="ml-1">{activeMolecule.metadata.source}</span>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

