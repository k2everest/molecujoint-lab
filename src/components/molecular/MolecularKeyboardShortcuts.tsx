import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Keyboard } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

interface MolecularKeyboardShortcutsProps {
  visible: boolean;
  onClose: () => void;
}

export const MolecularKeyboardShortcuts: React.FC<MolecularKeyboardShortcutsProps> = ({
  visible,
  onClose
}) => {
  const shortcuts: Shortcut[] = [
    // File Operations
    { keys: ['Ctrl', 'O'], description: 'Importar molécula', category: 'Arquivo' },
    { keys: ['Ctrl', 'S'], description: 'Exportar molécula', category: 'Arquivo' },
    { keys: ['Ctrl', 'N'], description: 'Nova molécula', category: 'Arquivo' },
    { keys: ['Delete'], description: 'Limpar tudo', category: 'Arquivo' },

    // Visualization
    { keys: ['1'], description: 'Modo spheres', category: 'Visualização' },
    { keys: ['2'], description: 'Modo sticks', category: 'Visualização' },
    { keys: ['3'], description: 'Modo ball & stick', category: 'Visualização' },
    { keys: ['4'], description: 'Modo space fill', category: 'Visualização' },
    { keys: ['L'], description: 'Alternar rótulos', category: 'Visualização' },
    { keys: ['B'], description: 'Alternar ligações', category: 'Visualização' },
    { keys: ['H'], description: 'Alternar hidrogênios', category: 'Visualização' },

    // Calculations
    { keys: ['Ctrl', 'P'], description: 'Calcular propriedades', category: 'Cálculos' },
    { keys: ['Ctrl', 'G'], description: 'Otimizar geometria', category: 'Cálculos' },
    { keys: ['Ctrl', 'R'], description: 'Iniciar simulação', category: 'Cálculos' },
    { keys: ['Ctrl', 'E'], description: 'Editor de física', category: 'Cálculos' },

    // Navigation
    { keys: ['Mouse Drag'], description: 'Rotacionar molécula', category: 'Navegação' },
    { keys: ['Mouse Wheel'], description: 'Zoom in/out', category: 'Navegação' },
    { keys: ['Shift', 'Mouse Drag'], description: 'Mover molécula', category: 'Navegação' },
    { keys: ['R'], description: 'Resetar visualização', category: 'Navegação' },

    // General
    { keys: ['?'], description: 'Mostrar atalhos', category: 'Geral' },
    { keys: ['Esc'], description: 'Fechar diálogos', category: 'Geral' },
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Atalhos de Teclado
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use estes atalhos para navegar mais rapidamente pelo MolecuJoint Lab
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-primary border-b border-border pb-1">
                {category}
              </h3>
              <div className="grid gap-2">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-mono px-2 py-1",
                                key.length === 1 ? "min-w-[24px] text-center" : ""
                              )}
                            >
                              {key}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Pressione <Badge variant="outline" className="text-xs mx-1">Esc</Badge> para fechar
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

