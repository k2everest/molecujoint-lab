import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  FolderPlus, 
  Folder, 
  Star, 
  StarOff,
  Trash2, 
  Edit3,
  Calendar,
  Tag,
  Save,
  X,
  History,
  Undo,
  Redo,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStateStore, ProjectState } from '../../store/appStateStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectManagerProps {
  className?: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ className }) => {
  const {
    projects,
    activeProjectId,
    history,
    historyIndex,
    isDirty,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    undo,
    redo,
    clearHistory
  } = useAppStateStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
    setNewProjectName('');
    setNewProjectDescription('');
    setIsCreating(false);
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectState>) => {
    updateProject(id, updates);
    setEditingId(null);
  };

  const handleToggleStar = (project: ProjectState) => {
    updateProject(project.id, { isStarred: !project.isStarred });
  };

  const handleDeleteProject = (project: ProjectState) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    // Starred projects first
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    
    // Then by last modified
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });

  return (
    <Card className={cn("w-80 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-500" />
            Projetos
          </CardTitle>
          <div className="flex items-center gap-1">
            {/* Undo/Redo buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="h-8 w-8 p-0"
              title="Histórico"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isDirty && (
          <div className="flex items-center gap-2 text-xs text-orange-600">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Alterações não salvas
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create New Project */}
        {isCreating ? (
          <Card className="p-3 border-dashed">
            <div className="space-y-3">
              <Input
                placeholder="Nome do projeto"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="h-20 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Criar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="w-full"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        )}

        {/* Active Project Info */}
        {activeProject && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projeto Ativo</span>
                <Badge variant="default" className="text-xs">
                  Ativo
                </Badge>
              </div>
              <h4 className="font-semibold">{activeProject.name}</h4>
              {activeProject.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {activeProject.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  Modificado {formatDistanceToNow(new Date(activeProject.lastModified), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Project List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Todos os Projetos ({projects.length})</span>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {sortedProjects.map((project) => (
              <Card
                key={project.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-md",
                  activeProjectId === project.id && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={() => setActiveProject(project.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {project.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                      <h4 className="text-sm font-semibold line-clamp-1">
                        {project.name}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(project);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {project.isStarred ? (
                          <StarOff className="w-3 h-3" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(project.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(project.lastModified), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                    
                    {project.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{project.tags.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Card className="p-3 border-dashed">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Histórico</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs h-6"
                >
                  Limpar
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {history.slice(-10).reverse().map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "text-xs p-2 rounded border",
                      index === 0 && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="font-medium">{entry.description}</div>
                    <div className="text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

