import React, { useEffect } from 'react';
import { MoleculeViewer3D } from './MoleculeViewer3D';
import { MolecularToolbar } from './MolecularToolbar';
import { MolecularStatus } from './MolecularStatus';
import { useMolecularStore } from '../../store/molecularStore';
import { toast } from 'sonner';

export const MolecularApp: React.FC = () => {
  const { loadMoleculeTemplate } = useMolecularStore();

  useEffect(() => {
    // Load a default molecule when the app starts
    loadMoleculeTemplate('water');
    toast.success('Visualizador Molecular carregado! 🧪', {
      description: 'Molécula de água carregada como exemplo.',
    });
  }, [loadMoleculeTemplate]);

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
      <MolecularToolbar />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <MoleculeViewer3D />
      </div>

      {/* Status Bar */}
      <MolecularStatus />
    </div>
  );
};