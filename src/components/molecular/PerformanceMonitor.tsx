import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Monitor, Cpu, MemoryStick, Zap, Timer } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  renderTime: number;
  atomCount: number;
  bondCount: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    renderTime: 0,
    atomCount: 0,
    bondCount: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsUpdateTime = lastTime;

    const updateMetrics = () => {
      const currentTime = performance.now();
      frameCount++;

      // Update FPS every second
      if (currentTime - fpsUpdateTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - fpsUpdateTime));
        
        // Get memory usage if available
        const memory = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;
        
        // Calculate render time
        const renderTime = currentTime - lastTime;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
          renderTime: Math.round(renderTime * 100) / 100
        }));

        frameCount = 0;
        fpsUpdateTime = currentTime;
      }

      lastTime = currentTime;
      requestAnimationFrame(updateMetrics);
    };

    updateMetrics();

    // Toggle visibility with Ctrl+Shift+M
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, good: number, poor: number) => {
    if (value >= good) return 'text-accent';
    if (value >= poor) return 'text-warning';
    return 'text-destructive';
  };

  const getFpsProgress = () => Math.min((metrics.fps / 60) * 100, 100);
  const getMemoryProgress = () => Math.min((metrics.memory / 100) * 100, 100);

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 molecular-shadow bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="w-4 h-4 text-primary" />
          Monitor de Performance
          <Badge variant="secondary" className="text-xs ml-auto">
            Ctrl+Shift+M
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={getFpsProgress()} className="w-16 h-2" />
            <span className={`text-sm font-mono ${getPerformanceColor(metrics.fps, 50, 30)}`}>
              {metrics.fps}
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={getMemoryProgress()} className="w-16 h-2" />
            <span className={`text-sm font-mono ${getPerformanceColor(100 - metrics.memory, 70, 40)}`}>
              {metrics.memory.toFixed(1)}MB
            </span>
          </div>
        </div>

        {/* Render Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Render</span>
          </div>
          <span className={`text-sm font-mono ${getPerformanceColor(100 - metrics.renderTime, 80, 50)}`}>
            {metrics.renderTime}ms
          </span>
        </div>

        {/* Scene Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Scene</span>
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            {metrics.atomCount}A {metrics.bondCount}B
          </div>
        </div>

        {/* Performance Tips */}
        {metrics.fps < 30 && (
          <div className="p-2 bg-warning/10 border border-warning/20 rounded text-xs">
            <strong>Dica:</strong> Performance baixa detectada. Considere reduzir o número de átomos ou 
            alternar para o modo "sticks" para melhor performance.
          </div>
        )}
      </CardContent>
    </Card>
  );
};