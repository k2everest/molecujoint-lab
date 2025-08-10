import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Move, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DraggablePanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  onClose?: () => void;
  onMinimize?: (minimized: boolean) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  zIndex?: number;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  title,
  icon,
  children,
  className,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
  minSize = { width: 250, height: 200 },
  maxSize = { width: 800, height: 600 },
  resizable = true,
  closable = true,
  minimizable = true,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
  zIndex = 10
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const panelRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        };
        
        // Constrain to viewport
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        newPosition.x = Math.max(0, Math.min(maxX, newPosition.x));
        newPosition.y = Math.max(0, Math.min(maxY, newPosition.y));
        
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newSize = {
          width: Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX)),
          height: Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY))
        };
        
        setSize(newSize);
        onSizeChange?.(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, size, minSize, maxSize, onPositionChange, onSizeChange]);

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    onMinimize?.(newMinimized);
  };

  const handleClose = () => {
    onClose?.();
  };

  const resetPosition = () => {
    setPosition(defaultPosition);
    setSize(defaultSize);
    onPositionChange?.(defaultPosition);
    onSizeChange?.(defaultSize);
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg",
        "transition-all duration-200",
        isDragging && "cursor-move",
        isResizing && "cursor-se-resize",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 'auto' : size.height,
        zIndex: zIndex,
        userSelect: isDragging || isResizing ? 'none' : 'auto'
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b bg-card/50 rounded-t-lg",
          "drag-handle cursor-move"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          <Move className="w-3 h-3 text-muted-foreground opacity-50" />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPosition}
            className="h-6 w-6 p-0 hover:bg-muted"
            title="Reset Position"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          
          {minimizable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-6 w-6 p-0 hover:bg-muted"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </Button>
          )}
          
          {closable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              title="Close"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          className="p-3 overflow-auto"
          style={{ 
            height: size.height - 60, // Subtract header height
            maxHeight: size.height - 60
          }}
        >
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {resizable && !isMinimized && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4",
            "cursor-se-resize bg-muted/50 hover:bg-muted",
            "border-l border-t border-border/50"
          )}
          onMouseDown={handleResizeMouseDown}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
          }}
        />
      )}
    </div>
  );
};

// Hook para gerenciar múltiplos painéis
export const useDraggablePanels = () => {
  const [panels, setPanels] = useState<Array<{
    id: string;
    component: ReactNode;
    zIndex: number;
  }>>([]);

  const addPanel = (id: string, component: ReactNode) => {
    setPanels(prev => {
      const maxZ = Math.max(...prev.map(p => p.zIndex), 0);
      return [...prev.filter(p => p.id !== id), { id, component, zIndex: maxZ + 1 }];
    });
  };

  const removePanel = (id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id));
  };

  const bringToFront = (id: string) => {
    setPanels(prev => {
      const maxZ = Math.max(...prev.map(p => p.zIndex));
      return prev.map(p => 
        p.id === id ? { ...p, zIndex: maxZ + 1 } : p
      );
    });
  };

  return {
    panels,
    addPanel,
    removePanel,
    bringToFront
  };
};

