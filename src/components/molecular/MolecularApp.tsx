import React, { useState, useEffect } from 'react';
import { MoleculeViewer3D } from './MoleculeViewer3D';
import { MolecularToolbar } from './MolecularToolbar';
import { MolecularStatus } from './MolecularStatus';
import { MolecularAnalysisPanel } from './MolecularAnalysisPanel';
import { AIPhysicsEditor } from './AIPhysicsEditor';
import { useMolecularStore } from '../../store/molecularStore';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export const MolecularApp: React.FC = () => {
  const [showPhysicsEditor, setShowPhysicsEditor] = useState(false);
  const { loadMoleculeTemplate } = useMolecularStore();

  useEffect(() => {
    // Load a default molecule when the app starts
    loadMoleculeTemplate('water');
    toast.success('Visualizador Molecular carregado! 🧪', {
      description: 'Molécula de água carregada como exemplo.',
    });
  }, [loadMoleculeTemplate]);

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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent animate-orbital-pulse"></div>
            <div className="text-sm text-muted-foreground">Sistema Ativo</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <MolecularToolbar onShowPhysicsEditor={() => setShowPhysicsEditor(true)} />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <MoleculeViewer3D />
        
        {/* Analysis Panel - Positioned on the right side */}
        <div className="absolute top-4 right-4 z-10">
          <MolecularAnalysisPanel />
        </div>
      </div>

      {/* Status Bar */}
      <MolecularStatus />
    </div>
  );
};