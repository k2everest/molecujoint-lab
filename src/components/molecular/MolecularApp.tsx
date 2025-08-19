import React, { useState, useEffect } from 'react';
import { MoleculeViewer3D } from './MoleculeViewer3D';
import { MolecularToolbar } from './MolecularToolbar';
import { MolecularStatus } from './MolecularStatus';
import { MolecularAnalysisPanel } from './MolecularAnalysisPanel';
import { MolecularNotifications } from './MolecularNotifications';
import { MolecularProgressBar } from './MolecularProgressBar';
import { MolecularKeyboardShortcuts } from './MolecularKeyboardShortcuts';
import { PubMedSearchPanel } from './PubMedSearchPanel';
import { DiseaseAnalysisPanel } from './DiseaseAnalysisPanel';
import { AIMoleculeDesignerPanel } from './AIMoleculeDesignerPanel';
import { MoleculeSelector } from './MoleculeSelector';
import { AIPhysicsEditor } from './AIPhysicsEditor';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ActiveLearningPanel } from './ActiveLearningPanel';
import { DraggablePanel, useDraggablePanels } from '../ui/draggable-panel';
import { useMolecularStore } from '../../store/molecularStore';
import { ExtractedMolecule } from '../../utils/moleculeExtractor';
import { DesignedMolecule } from '../../utils/aiMoleculeDesigner';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { X, FlaskConical, BookOpen, Microscope, Sparkles, BarChart3, GraduationCap } from 'lucide-react';

export const MolecularApp: React.FC = () => {
  const [showPhysicsEditor, setShowPhysicsEditor] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const { loadMoleculeTemplate, loadExtractedMolecules } = useMolecularStore();
  const { panels, addPanel, removePanel, bringToFront } = useDraggablePanels();

  const handleMoleculesExtracted = (molecules: ExtractedMolecule[]) => {
    if (molecules.length > 0) {
      loadExtractedMolecules(molecules);
      toast.success(`${molecules.length} moléculas carregadas do PubMed! 🧬`, {
        description: `Moléculas: ${molecules.slice(0, 3).map(m => m.name).join(', ')}${molecules.length > 3 ? '...' : ''}`,
      });
    }
  };

  const handleMoleculeDesigned = (molecule: DesignedMolecule) => {
    toast.success(`Molécula projetada com IA carregada! 🤖`, {
      description: `${molecule.name} - Drug-likeness: ${(molecule.drugLikeness.score * 100).toFixed(0)}%`,
    });
  };

  // Panel management functions
  const openPubMedPanel = () => {
    addPanel('pubmed', (
      <DraggablePanel
        title="Pesquisa PubMed"
        icon={<BookOpen className="w-4 h-4 text-blue-500" />}
        defaultPosition={{ x: 50, y: 100 }}
        defaultSize={{ width: 400, height: 500 }}
        onClose={() => removePanel('pubmed')}
        zIndex={panels.find(p => p.id === 'pubmed')?.zIndex || 10}
      >
        <PubMedSearchPanel onMoleculesExtracted={handleMoleculesExtracted} />
      </DraggablePanel>
    ));
  };

  const openDiseaseAnalysisPanel = () => {
    addPanel('disease', (
      <DraggablePanel
        title="Análise de Doenças"
        icon={<Microscope className="w-4 h-4 text-green-500" />}
        defaultPosition={{ x: 100, y: 150 }}
        defaultSize={{ width: 400, height: 500 }}
        onClose={() => removePanel('disease')}
        zIndex={panels.find(p => p.id === 'disease')?.zIndex || 10}
      >
        <DiseaseAnalysisPanel onMoleculeLoad={handleMoleculesExtracted} />
      </DraggablePanel>
    ));
  };

  const openAIDesignerPanel = () => {
    addPanel('ai-designer', (
      <DraggablePanel
        title="Design Molecular com IA"
        icon={<Sparkles className="w-4 h-4 text-purple-500" />}
        defaultPosition={{ x: 150, y: 200 }}
        defaultSize={{ width: 450, height: 600 }}
        onClose={() => removePanel('ai-designer')}
        zIndex={panels.find(p => p.id === 'ai-designer')?.zIndex || 10}
      >
        <AIMoleculeDesignerPanel onMoleculeDesigned={handleMoleculeDesigned} />
      </DraggablePanel>
    ));
  };

  const openAnalysisPanel = () => {
    addPanel('analysis', (
      <DraggablePanel
        title="Análise Molecular"
        icon={<BarChart3 className="w-4 h-4 text-orange-500" />}
        defaultPosition={{ x: 200, y: 100 }}
        defaultSize={{ width: 350, height: 450 }}
        onClose={() => removePanel('analysis')}
        zIndex={panels.find(p => p.id === 'analysis')?.zIndex || 10}
      >
        <MolecularAnalysisPanel />
      </DraggablePanel>
    ));
  };

  const openActiveLearningPanel = () => {
    addPanel('active-learning', (
      <DraggablePanel
        title="Aprendizado Ativo"
        icon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
        defaultPosition={{ x: 250, y: 150 }}
        defaultSize={{ width: 350, height: 400 }}
        onClose={() => removePanel('active-learning')}
        zIndex={panels.find(p => p.id === 'active-learning')?.zIndex || 10}
      >
        <ActiveLearningPanel />
      </DraggablePanel>
    ));
  };

  const openConfigurationPanel = () => {
    addPanel('configuration', (
      <DraggablePanel
        title="Configuração de Otimização"
        icon={<Settings className="w-4 h-4 text-purple-500" />}
        defaultPosition={{ x: 300, y: 200 }}
        defaultSize={{ width: 400, height: 500 }}
        onClose={() => removePanel('configuration')}
        zIndex={panels.find(p => p.id === 'configuration')?.zIndex || 10}
      >
        <ConfigurationPanel />
      </DraggablePanel>
    ));
  };

  useEffect(() => {
    // Keyboard shortcuts listener
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show keyboard shortcuts with '?' key
      if (event.key === '?' && !showPhysicsEditor) {
        event.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      // Close dialogs with Escape
      if (event.key === 'Escape') {
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        } else if (showPhysicsEditor) {
          setShowPhysicsEditor(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadMoleculeTemplate, showPhysicsEditor, showKeyboardShortcuts]);

  if (showPhysicsEditor) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header with close button */}
        <div className="border-b bg-card p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Editor de Física com IA</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPhysicsEditor(false)}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Fechar
          </Button>
        </div>
        
        {/* Physics Editor */}
        <div className="flex-1 overflow-auto p-6">
          <AIPhysicsEditor />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Visualizador Molecular 3D
            </h1>
            <p className="text-muted-foreground mt-1">
              Plataforma científica para visualização e análise molecular
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/maestro'}
              className="gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              MS Maestro
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-orbital-pulse"></div>
              <div className="text-sm text-muted-foreground">Sistema Ativo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border-b border-border p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openPubMedPanel}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              PubMed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openDiseaseAnalysisPanel}
              className="gap-2"
            >
              <Microscope className="w-4 h-4" />
              Análise de Doenças
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openAIDesignerPanel}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Design com IA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openAnalysisPanel}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Análise
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openActiveLearningPanel}
              className="gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Aprendizado
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openConfigurationPanel}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure
            </Button>
          </div>
          
          <MolecularToolbar onShowPhysicsEditor={() => setShowPhysicsEditor(true)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <MoleculeViewer3D />
        
        {/* Top Center - Molecule Selector */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <MoleculeSelector />
        </div>
        
        {/* Render draggable panels */}
        {panels.map(panel => (
          <div key={panel.id} onClick={() => bringToFront(panel.id)}>
            {panel.component}
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <MolecularStatus />

      {/* Floating UI Components */}
      <MolecularNotifications />
      <MolecularProgressBar />

      {/* Keyboard Shortcuts Modal */}
      <MolecularKeyboardShortcuts 
        visible={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};