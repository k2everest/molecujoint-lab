import React from 'react';
import { MoleculeViewer3D } from '../components/molecular/MoleculeViewer3D';
import { MolecularToolbar } from '../components/molecular/MolecularToolbar';
import { MolecularStatus } from '../components/molecular/MolecularStatus';
import { MaestroInterface } from '../components/molecular/MaestroInterface';
import { ActiveLearningPanel } from '../components/molecular/ActiveLearningPanel';
import { ReactionPredictor } from '../components/molecular/ReactionPredictor';
import { MaterialsPredictor } from '../components/molecular/MaterialsPredictor';
import { MolecularNotifications } from '../components/molecular/MolecularNotifications';
import { Button } from '../components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMolecularStore } from '../store/molecularStore';
import { toast } from 'sonner';

export const Maestro: React.FC = () => {
  const { loadMoleculeTemplate } = useMolecularStore();

  React.useEffect(() => {
    // Load a crystal structure for materials science
    loadMoleculeTemplate('benzene');
    toast.success('MS Maestro carregado!', {
      description: 'Ambiente de descoberta de materiais ativo.',
    });
  }, [loadMoleculeTemplate]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with Navigation */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MS Maestro
              </h1>
              <p className="text-muted-foreground text-sm">
                Ambiente completo para descoberta de materiais
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-orbital-pulse"></div>
            <div className="text-sm text-muted-foreground">Sistema Integrado</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <MolecularToolbar />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* 3D Viewer */}
        <MoleculeViewer3D />
        
        {/* Maestro Interface - Left side */}
        <div className="absolute top-4 left-4 z-10">
          <MaestroInterface />
        </div>
        
        {/* Active Learning Panel - Bottom right */}
        <div className="absolute bottom-20 right-4 z-10">
          <ActiveLearningPanel />
        </div>

        {/* Reaction Predictor - Top center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <ReactionPredictor />
        </div>

        {/* Materials Predictor - Bottom left */}
        <div className="absolute bottom-20 left-4 z-10">
          <MaterialsPredictor />
        </div>
      </div>

      {/* Status Bar */}
      <MolecularStatus />

      {/* Floating Components */}
      <MolecularNotifications />
    </div>
  );
};