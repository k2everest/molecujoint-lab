import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'calculation';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
}

interface MolecularNotificationsProps {
  className?: string;
}

export const MolecularNotifications: React.FC<MolecularNotificationsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulated notifications for demonstration
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'calculation',
        title: 'Cálculo Concluído',
        message: 'Propriedades moleculares calculadas com sucesso',
        timestamp: new Date(),
        autoHide: true
      },
      {
        id: '2',
        type: 'info',
        title: 'Otimização Geométrica',
        message: 'Geometria otimizada em 15 iterações',
        timestamp: new Date(Date.now() - 30000),
        autoHide: false
      }
    ];

    setNotifications(demoNotifications);

    // Auto-hide notifications after 5 seconds
    const timer = setTimeout(() => {
      setNotifications(prev => prev.filter(n => !n.autoHide));
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const removeNotification = (id: string) => {
    // Add fade out animation before removing
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

