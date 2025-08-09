import React, { useState } from 'react';
import { MolecularButton } from '../ui/molecular-button';
import { 
  Atom, 
  Beaker, 
  Download, 
  Upload, 
  RotateCcw, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  Settings,
  Plus,
  Trash2,
  Save,
  FileText,
  Microscope,
  Zap,
  Target,
  Layers,
  Grid3x3,
} from 'lucide-react';
import { useMolecularStore } from '../../store/molecularStore';
import { MOLECULE_TEMPLATES } from '../../types/molecular';
import { cn } from '../../lib/utils';
import { parseXYZ, moleculeToXYZ } from '../../utils/xyzParser';

interface MolecularToolbarProps {
  onShowPhysicsEditor?: () => void;
}

export const MolecularToolbar: React.FC<MolecularToolbarProps> = ({ onShowPhysicsEditor }) => {
  const {
    viewMode,
    showLabels,
    showBonds,
    showHydrogens,
    setViewMode,
    toggleLabels,
    toggleBonds,
    toggleHydrogens,
    loadMoleculeTemplate,
    activeMoleculeId,
    calculateMoleculeProperties,
    optimizeGeometry,
    runMolecularDynamics,
    calculateAdvancedPhysics,
    clear,
    addMolecule,
  } = useMolecularStore();

  const [isSimulating, setIsSimulating] = useState(false);
  const [showMoleculeMenu, setShowMoleculeMenu] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const molecule = parseXYZ(content);
        if (molecule) {
          addMolecule(molecule);
          toast.success("Molécula importada com sucesso!", {
            description: `${molecule.name} (${molecule.atoms.length} átomos) carregada.`,
          });
        } else {
          toast.error("Erro ao importar molécula", {
            description: "Não foi possível analisar o arquivo XYZ.",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (activeMoleculeId) {
      const activeMolecule = useMolecularStore.getState().molecules.find(m => m.id === activeMoleculeId);
      if (activeMolecule) {
        const xyzContent = moleculeToXYZ(activeMolecule);
        const blob = new Blob([xyzContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeMolecule.name || "molecule"}.xyz`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Molécula exportada com sucesso!", {
          description: `Arquivo ${a.download} gerado.`, 
        });
      } else {
        toast.error("Erro ao exportar molécula", {
          description: "Molécula ativa não encontrada.",
        });
      }
    }
  };

  const handleCalculate = () => {
    if (activeMoleculeId) {
      calculateMoleculeProperties(activeMoleculeId);
    }
  };

  const handleOptimize = () => {
    if (activeMoleculeId) {
      optimizeGeometry(activeMoleculeId);
    }
  };

  const handleSimulation = () => {
    setIsSimulating(!isSimulating);
    // TODO: Implement molecular dynamics simulation
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex flex-wrap gap-2">
        {/* File Operations */}
        <div className="flex gap-2 border-r border-border pr-4">
          <input
            type="file"
            accept=".xyz,.pdb,.mol,.sdf"
            onChange={handleFileImport}
            className="hidden"
            id="file-import"
          />
          <MolecularButton
            variant="lab"
            size="sm"
            onClick={() => document.getElementById('file-import')?.click()}
            title="Importar molécula"
          >
            <Upload className="w-4 h-4" />
          </MolecularButton>
          
          <MolecularButton
            variant="lab"
            size="sm"
            onClick={handleExport}
            title="Exportar molécula"
            disabled={!activeMoleculeId}
          >
            <Download className="w-4 h-4" />
          </MolecularButton>

          <MolecularButton
            variant="lab"
            size="sm"
            title="Salvar projeto"
            disabled={!activeMoleculeId}
          >
            <Save className="w-4 h-4" />
          </MolecularButton>
        </div>

        {/* Molecule Templates */}
        <div className="flex gap-2 border-r border-border pr-4">
          <div className="relative">
            <MolecularButton
              variant="molecular"
              size="sm"
              onClick={() => setShowMoleculeMenu(!showMoleculeMenu)}
              title="Carregar moléculas padrão"
            >
              <Beaker className="w-4 h-4" />
              <Plus className="w-3 h-3 ml-1" />
            </MolecularButton>
            
            {showMoleculeMenu && (
              <div className="absolute top-full left-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 min-w-48">
                <div className="p-2">
                  <div className="text-sm font-semibold text-popover-foreground mb-2 px-2">
                    Moléculas Padrão
                  </div>
                  {Object.entries(MOLECULE_TEMPLATES).map(([key, template]) => (
                    <MolecularButton
                      key={key}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        loadMoleculeTemplate(key as keyof typeof MOLECULE_TEMPLATES);
                        setShowMoleculeMenu(false);
                      }}
                    >
                      <Atom className="w-4 h-4 mr-2" />
                      {template.name}
                    </MolecularButton>
                  ))}
                </div>
              </div>
            )}
          </div>

          <MolecularButton
            variant="destructive"
            size="sm"
            onClick={clear}
            title="Limpar tudo"
            disabled={!activeMoleculeId}
          >
            <Trash2 className="w-4 h-4" />
          </MolecularButton>
        </div>

        {/* View Mode */}
        <div className="flex gap-2 border-r border-border pr-4">
          <div className="text-sm text-muted-foreground self-center mr-2">Visualização:</div>
          {(['spheres', 'sticks', 'ballAndStick', 'spaceFill'] as const).map((mode) => (
            <MolecularButton
              key={mode}
              variant={viewMode === mode ? "molecular" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
              title={`Modo ${mode}`}
            >
              {mode === 'spheres' && <div className="w-4 h-4 rounded-full bg-current" />}
              {mode === 'sticks' && <div className="w-4 h-1 bg-current" />}
              {mode === 'ballAndStick' && <Layers className="w-4 h-4" />}
              {mode === 'spaceFill' && <div className="w-4 h-4 rounded-full bg-current opacity-60" />}
            </MolecularButton>
          ))}
        </div>

        {/* Display Options */}
        <div className="flex gap-2 border-r border-border pr-4">
          <MolecularButton
            variant={showLabels ? "molecular" : "outline"}
            size="sm"
            onClick={toggleLabels}
            title="Mostrar/ocultar rótulos"
          >
            <FileText className="w-4 h-4" />
          </MolecularButton>

          <MolecularButton
            variant={showBonds ? "molecular" : "outline"}
            size="sm"
            onClick={toggleBonds}
            title="Mostrar/ocultar ligações"
          >
            <Grid3x3 className="w-4 h-4" />
          </MolecularButton>

          <MolecularButton
            variant={showHydrogens ? "molecular" : "outline"}
            size="sm"
            onClick={toggleHydrogens}
            title="Mostrar/ocultar hidrogênios"
          >
            H
          </MolecularButton>
        </div>

        {/* Calculations */}
        <div className="flex gap-2 border-r border-border pr-4">
          <MolecularButton
            variant="orbital"
            size="sm"
            onClick={handleCalculate}
            title="Calcular propriedades"
            disabled={!activeMoleculeId}
          >
            <Zap className="w-4 h-4" />
          </MolecularButton>

          <MolecularButton
            variant="orbital"
            size="sm"
            onClick={handleOptimize}
            title="Otimizar geometria"
            disabled={!activeMoleculeId}
          >
            <Target className="w-4 h-4" />
          </MolecularButton>

          <MolecularButton
            variant={isSimulating ? "destructive" : "orbital"}
            size="sm"
            onClick={handleSimulation}
            title={isSimulating ? "Parar simulação" : "Iniciar simulação"}
            disabled={!activeMoleculeId}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </MolecularButton>
        </div>

        {/* Advanced Tools */}
        <div className="flex gap-2">
          {onShowPhysicsEditor && (
            <MolecularButton
              onClick={onShowPhysicsEditor}
              variant="molecular"
              size="sm"
              title="Editor de Física com IA"
            >
              <Settings className="w-4 h-4" />
            </MolecularButton>
          )}

          <MolecularButton
            variant="ghost"
            size="sm"
            title="Análise espectroscópica"
            disabled={!activeMoleculeId}
          >
            <Microscope className="w-4 h-4" />
          </MolecularButton>
        </div>
      </div>
    </div>
  );
};