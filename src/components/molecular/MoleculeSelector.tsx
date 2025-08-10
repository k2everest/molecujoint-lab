import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Atom, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye,
  Beaker,
  Dna
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMolecularStore } from '../../store/molecularStore';

interface MoleculeSelectorProps {
  className?: string;
}

export const MoleculeSelector: React.FC<MoleculeSelectorProps> = ({
  className
}) => {
  const { 
    molecules, 
    activeMoleculeId, 
    setActiveMolecule, 
    removeMolecule 
  } = useMolecularStore();

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);
  const currentIndex = molecules.findIndex(m => m.id === activeMoleculeId);

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
      <Card className={cn("w-80 bg-card/95 backdrop-blur-sm", className)}>
        <CardContent className="p-4 text-center">
          <div className="text-muted-foreground">
            <Atom className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma molécula carregada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (molecules.length === 1) {
    return (
      <Card className={cn("w-80 bg-card/95 backdrop-blur-sm", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Molécula Ativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{activeMolecule?.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {activeMolecule?.atoms.length || 0} átomos
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {activeMolecule?.bonds.length || 0} ligações
                </Badge>
              </div>
            </div>
            {activeMolecule?.metadata?.source && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", getSourceColor(activeMolecule.metadata.source))}
              >
                {getSourceIcon(activeMolecule.metadata.source)}
                <span className="ml-1">{activeMolecule.metadata.source}</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-80 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Seletor de Moléculas
          </div>
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1} de {molecules.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={molecules.length <= 1}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={molecules.length <= 1}
            className="flex-1"
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Dropdown Selector */}
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
    </Card>
  );
};

