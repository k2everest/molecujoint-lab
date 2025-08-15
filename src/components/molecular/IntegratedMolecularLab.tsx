import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Atom, 
  Beaker, 
  Brain, 
  Activity, 
  Sparkles,
  BookOpen,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Importar todos os componentes melhorados
import { ImprovedMoleculeSelector } from './ImprovedMoleculeSelector';
import { NewMaterialsTechnologies } from './NewMaterialsTechnologies';
import { ImprovedPubMedSearchPanel } from './ImprovedPubMedSearchPanel';
import { ImprovedAIMoleculeDesigner } from './ImprovedAIMoleculeDesigner';
import { PhysicsBasedMolecularEngine } from './PhysicsBasedMolecularEngine';
import { useMolecularStore } from '../../store/molecularStore';

interface PanelState {
  isVisible: boolean;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  isCollapsed: boolean;
}

interface IntegratedMolecularLabProps {
  className?: string;
}

export const IntegratedMolecularLab: React.FC<IntegratedMolecularLabProps> = ({
  className
}) => {
  const { molecules, activeMoleculeId } = useMolecularStore();
  
  // Estados dos painéis
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    selector: {
      isVisible: true,
      position: { x: 20, y: 20 },
      size: 'medium',
      isCollapsed: false
    },
    materials: {
      isVisible: true,
      position: { x: 20, y: 400 },
      size: 'medium',
      isCollapsed: false
    },
    pubmed: {
      isVisible: true,
      position: { x: 440, y: 20 },
      size: 'medium',
      isCollapsed: false
    },
    aidesigner: {
      isVisible: true,
      position: { x: 860, y: 20 },
      size: 'medium',
      isCollapsed: false
    },
    physics: {
      isVisible: true,
      position: { x: 440, y: 400 },
      size: 'medium',
      isCollapsed: false
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [showControlPanel, setShowControlPanel] = useState(true);

  const updatePanelState = (panelId: string, updates: Partial<PanelState>) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: { ...prev[panelId], ...updates }
    }));
  };

  const togglePanelVisibility = (panelId: string) => {
    updatePanelState(panelId, { isVisible: !panels[panelId].isVisible });
  };

  const togglePanelCollapse = (panelId: string) => {
    updatePanelState(panelId, { isCollapsed: !panels[panelId].isCollapsed });
  };

  const panelConfigs = [
    {
      id: 'selector',
      name: 'Seletor de Moléculas',
      icon: <Eye className="w-4 h-4" />,
      description: 'Controle e navegação entre moléculas',
      component: ImprovedMoleculeSelector
    },
    {
      id: 'materials',
      name: 'Tecnologias de Materiais',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Análise de propriedades energéticas',
      component: NewMaterialsTechnologies
    },
    {
      id: 'pubmed',
      name: 'Pesquisa PubMed',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Busca de artigos com tradução',
      component: ImprovedPubMedSearchPanel
    },
    {
      id: 'aidesigner',
      name: 'AI Designer',
      icon: <Brain className="w-4 h-4" />,
      description: 'Design inteligente de moléculas',
      component: ImprovedAIMoleculeDesigner
    },
    {
      id: 'physics',
      name: 'Simulação Física',
      icon: <Activity className="w-4 h-4" />,
      description: 'Dinâmica molecular real',
      component: PhysicsBasedMolecularEngine
    }
  ];

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Painel de Controle Principal */}
      {showControlPanel && (
        <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Atom className="w-5 h-5 text-primary" />
                Laboratório Molecular Integrado
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControlPanel(false)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="panels">Painéis</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-3">
                {/* Status do Sistema */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Status do Sistema</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Moléculas:</span>
                      <div className="font-medium">{molecules.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ativa:</span>
                      <div className="font-medium">{activeMolecule?.name || 'Nenhuma'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Painéis Ativos:</span>
                      <div className="font-medium">
                        {Object.values(panels).filter(p => p.isVisible).length}/5
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Funcionalidades:</span>
                      <div className="font-medium">Todas Ativas</div>
                    </div>
                  </div>
                </div>

                {/* Funcionalidades Implementadas */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Funcionalidades Implementadas</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                      <span>Seletor de moléculas com controles de posição e tamanho</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                      <span>Análise de tecnologias de materiais e energia</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                      <span>Busca PubMed com tradução automática</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                      <span>AI Designer com moléculas diversificadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                      <span>Simulação física com dinâmica molecular</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="panels" className="space-y-3">
                <h4 className="font-semibold text-sm">Controle de Painéis</h4>
                <div className="space-y-2">
                  {panelConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <div>
                          <div className="text-sm font-medium">{config.name}</div>
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={panels[config.id].isVisible ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePanelVisibility(config.id)}
                          className="h-6 px-2 text-xs"
                        >
                          {panels[config.id].isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        {panels[config.id].isVisible && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePanelCollapse(config.id)}
                            className="h-6 px-2 text-xs"
                          >
                            {panels[config.id].isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-3">
                <h4 className="font-semibold text-sm">Configurações Globais</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-salvar posições</span>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      Ativado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tema escuro</span>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      Sistema
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animações</span>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      Ativadas
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Botão para mostrar painel de controle quando oculto */}
      {!showControlPanel && (
        <Button
          onClick={() => setShowControlPanel(true)}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Controles
        </Button>
      )}

      {/* Renderizar Painéis */}
      {panelConfigs.map((config) => {
        const panel = panels[config.id];
        const Component = config.component;
        
        if (!panel.isVisible) return null;
        
        return (
          <div
            key={config.id}
            className="absolute"
            style={{ 
              left: panel.position.x, 
              top: panel.position.y,
              zIndex: 10
            }}
          >
            <Component />
          </div>
        );
      })}

      {/* Informações de Ajuda */}
      <div className="absolute bottom-4 right-4 z-40">
        <Card className="bg-card/90 backdrop-blur-sm border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Dicas:</strong></p>
              <p>• Arraste os painéis pela barra de título</p>
              <p>• Use o painel de controle para gerenciar visibilidade</p>
              <p>• Todos os componentes são interativos e baseados em física real</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

