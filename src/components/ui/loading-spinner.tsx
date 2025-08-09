import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "animate-spin rounded-full border-2 border-muted",
          sizeClasses[size]
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin",
            sizeClasses[size]
          )} style={{ animationDuration: '1s' }} />
        </div>
        
        {/* Inner ring */}
        <div className={cn(
          "absolute inset-1 animate-spin rounded-full border border-muted",
          size === 'sm' ? 'inset-0.5' : size === 'lg' ? 'inset-1.5' : 'inset-1'
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full border border-transparent border-t-accent animate-spin",
          )} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
      </div>
      
      {text && (
        <div className="text-sm text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
};

