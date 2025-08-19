import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, CheckCircle, AlertCircle, Info, Zap, Atom, FlaskConical, Brain, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'calculation' | 'molecule' | 'analysis' | 'optimization' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  progress?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MolecularNotificationsProps {
  className?: string;
}

// Global notification system
let notificationSystem: {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
} | null = null;

export const MolecularNotifications: React.FC<MolecularNotificationsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    
    // Auto-hide if specified
    if (notification.autoHide !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.type === 'error' ? 8000 : 5000);
    }
  };

  // Expose global notification functions
  useEffect(() => {
    notificationSystem = { addNotification };
    
    // Add to window for global access
    (window as any).molecularNotifications = {
      showMoleculeLoaded: (moleculeName: string, source: string) => {
        addNotification({
          type: 'molecule',
          title: `Molécula carregada: ${moleculeName}`,
          message: `Fonte: ${source}`,
          autoHide: true,
          action: {
            label: 'Visualizar',
            onClick: () => console.log('Navigate to molecule viewer')
          }
        });
      },
      
      showAnalysisComplete: (analysisType: string, results: any) => {
        addNotification({
          type: 'analysis',
          title: `Análise ${analysisType} concluída!`,
          message: `${results.moleculesFound || 0} moléculas identificadas`,
          autoHide: true,
          action: {
            label: 'Ver Resultados',
            onClick: () => console.log('Show analysis results')
          }
        });
      },
      
      showOptimizationProgress: (progress: number, stage: string) => {
        addNotification({
          type: 'optimization',
          title: `Otimização em progresso: ${progress}%`,
          message: `Estágio atual: ${stage}`,
          progress,
          autoHide: false
        });
      },
      
      showOptimizationComplete: (optimizedMolecules: number) => {
        addNotification({
          type: 'success',
          title: 'Otimização concluída! 🎯',
          message: `${optimizedMolecules} moléculas otimizadas geradas`,
          autoHide: true,
          action: {
            label: 'Carregar Moléculas',
            onClick: () => console.log('Load optimized molecules')
          }
        });
      },
      
      showError: (operation: string, error: string) => {
        addNotification({
          type: 'error',
          title: `Erro em ${operation}`,
          message: error,
          autoHide: true,
          action: {
            label: 'Tentar Novamente',
            onClick: () => console.log('Retry operation')
          }
        });
      },
      
      showInfo: (title: string, message: string) => {
        addNotification({
          type: 'info',
          title,
          message,
          autoHide: true
        });
      },
      
      showWarning: (title: string, message: string) => {
        addNotification({
          type: 'warning',
          title,
          message,
          autoHide: true
        });
      }
    };

    return () => {
      notificationSystem = null;
      delete (window as any).molecularNotifications;
    };
  }, []);

  // Demo notifications on mount
  useEffect(() => {
    const demoNotifications: Omit<Notification, 'id' | 'timestamp'>[] = [
      {
        type: 'success',
        title: 'Sistema Inicializado',
        message: 'MolecuJoint Lab carregado com sucesso',
        autoHide: true
      }
    ];

    demoNotifications.forEach(notification => {
      setTimeout(() => addNotification(notification), 1000);
    });
  }, []);

  const removeNotification = (id: string) => {
    const notification = document.querySelector(`[data-notification-id="${id}"]`);
    if (notification) {
      notification.classList.add('animate-fade-out-notification');
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 300);
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'calculation':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'molecule':
        return <Atom className="w-4 h-4 text-cyan-500" />;
      case 'analysis':
        return <FlaskConical className="w-4 h-4 text-orange-500" />;
      case 'optimization':
        return <Target className="w-4 h-4 text-indigo-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/90 dark:bg-green-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/90 dark:bg-yellow-900/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50/90 dark:bg-blue-900/20';
      case 'calculation':
        return 'border-l-purple-500 bg-purple-50/90 dark:bg-purple-900/20';
      case 'molecule':
        return 'border-l-cyan-500 bg-cyan-50/90 dark:bg-cyan-900/20';
      case 'analysis':
        return 'border-l-orange-500 bg-orange-50/90 dark:bg-orange-900/20';
      case 'optimization':
        return 'border-l-indigo-500 bg-indigo-50/90 dark:bg-indigo-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50/90 dark:bg-red-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50/90 dark:bg-blue-900/20';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 left-4 z-50 space-y-2 max-w-sm", className)}>
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          data-notification-id={notification.id}
          className={cn(
            "border-l-4 shadow-lg animate-slide-in-notification bg-card/95 backdrop-blur-sm border border-border/50 hover:shadow-xl transition-all duration-200",
            getTypeColor(notification.type)
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs h-5">
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {/* Progress bar for optimization notifications */}
                  {notification.progress !== undefined && (
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${notification.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Action button */}
                  {notification.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={notification.action.onClick}
                      className="h-6 text-xs mt-2"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {notification.timestamp.toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Fechar notificação"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

