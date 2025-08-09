import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Atom, Zap, Ruler } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AtomInfo {
  element: string;
  position: [number, number, number];
  charge?: number;
  bondCount?: number;
  hybridization?: string;
}

interface MolecularTooltipProps {
  atomInfo?: AtomInfo;
  position: { x: number; y: number };
  visible: boolean;
  className?: string;
}

export const MolecularTooltip: React.FC<MolecularTooltipProps> = ({
  atomInfo,
  position,
  visible,
  className
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (visible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if tooltip goes off-screen
      if (position.x + rect.width > viewportWidth) {
        newX = position.x - rect.width - 10;
      }

      // Adjust vertical position if tooltip goes off-screen
      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height - 10;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, visible]);

  if (!visible || !atomInfo) {
    return null;
  }

  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      H: 'bg-gray-100 text-gray-800',
      C: 'bg-gray-800 text-white',
      N: 'bg-blue-100 text-blue-800',
      O: 'bg-red-100 text-red-800',
      F: 'bg-green-100 text-green-800',
      Cl: 'bg-green-200 text-green-900',
      Br: 'bg-orange-100 text-orange-800',
      I: 'bg-purple-100 text-purple-800',
      S: 'bg-yellow-100 text-yellow-800',
      P: 'bg-orange-200 text-orange-900',
    };
    return colors[element] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-50 pointer-events-none animate-fade-in",
        className
      )}
      style={{
        left: adjustedPosition.x + 10,
        top: adjustedPosition.y - 10,
      }}
    >
      <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-3 space-y-2">
          {/* Element Header */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-primary" />
              <Badge className={cn("text-xs font-bold", getElementColor(atomInfo.element))}>
                {atomInfo.element}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Átomo
            </div>
          </div>

          {/* Position */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Ruler className="w-3 h-3 text-blue-500" />
              <span className="text-muted-foreground">Posição:</span>
            </div>
            <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1">
              x: {atomInfo.position[0].toFixed(3)}<br />
              y: {atomInfo.position[1].toFixed(3)}<br />
              z: {atomInfo.position[2].toFixed(3)}
            </div>
          </div>

          {/* Additional Properties */}
          <div className="space-y-1">
            {atomInfo.bondCount !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Ligações:</span>
                <Badge variant="outline" className="text-xs">
                  {atomInfo.bondCount}
                </Badge>
              </div>
            )}

            {atomInfo.charge !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Carga:</span>
                <Badge 
                  variant={atomInfo.charge > 0 ? "destructive" : atomInfo.charge < 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {atomInfo.charge > 0 ? '+' : ''}{atomInfo.charge.toFixed(2)}
                </Badge>
              </div>
            )}

            {atomInfo.hybridization && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hibridização:</span>
                <Badge variant="outline" className="text-xs">
                  {atomInfo.hybridization}
                </Badge>
              </div>
            )}
          </div>

          {/* Element Info */}
          <div className="pt-1 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              Clique para selecionar • Arraste para mover
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

