import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PubMedArticle } from '../utils/pubmedApi';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  maxHistoryEntries: number;
  enableNotifications: boolean;
  enableAnimations: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

export interface ProjectState {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  moleculeIds: string[];
  tags: string[];
  isStarred: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  moleculeId?: string;
  undoData?: any;
}

export interface AppState {
  // Settings
  settings: AppSettings;
  
  // Projects
  projects: ProjectState[];
  activeProjectId: string | null;
  
  // History & Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  
  // UI State
  sidebarCollapsed: boolean;
  activePanel: 'analysis' | 'pubmed' | 'quantum' | 'none';
  fullscreenMode: boolean;
  
  // Research & Literature
  savedArticles: PubMedArticle[];
  searchHistory: string[];
  
  // Performance & Cache
  lastSaveTime: string | null;
  isDirty: boolean;
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  createProject: (name: string, description?: string) => string;
  updateProject: (id: string, updates: Partial<ProjectState>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  
  addHistoryEntry: (action: string, description: string, moleculeId?: string, undoData?: any) => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: 'analysis' | 'pubmed' | 'quantum' | 'none') => void;
  setFullscreenMode: (fullscreen: boolean) => void;
  
  saveArticle: (article: PubMedArticle) => void;
  removeArticle: (pmid: string) => void;
  addSearchTerm: (term: string) => void;
  
  markDirty: () => void;
  markClean: () => void;
  autoSave: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'pt',
  autoSave: true,
  autoSaveInterval: 5,
  maxHistoryEntries: 100,
  enableNotifications: true,
  enableAnimations: true,
  performanceMode: 'high'
};

export const useAppStateStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      projects: [],
      activeProjectId: null,
      history: [],
      historyIndex: -1,
      sidebarCollapsed: false,
      activePanel: 'none',
      fullscreenMode: false,
      savedArticles: [],
      searchHistory: [],
      lastSaveTime: null,
      isDirty: false,

      // Settings actions
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
        isDirty: true
      })),

      // Project actions
      createProject: (name, description) => {
        const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const project: ProjectState = {
          id,
          name,
          description,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          moleculeIds: [],
          tags: [],
          isStarred: false
        };

        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: id,
          isDirty: true
        }));

        get().addHistoryEntry('create_project', `Projeto "${name}" criado`, undefined, { project });
        return id;
      },

      updateProject: (id, updates) => set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === id);
        if (projectIndex === -1) return state;

        const oldProject = state.projects[projectIndex];
        const updatedProject = {
          ...oldProject,
          ...updates,
          lastModified: new Date().toISOString()
        };

        const newProjects = [...state.projects];
        newProjects[projectIndex] = updatedProject;

        get().addHistoryEntry('update_project', `Projeto "${updatedProject.name}" atualizado`, undefined, { oldProject, newProject: updatedProject });

        return {
          projects: newProjects,
          isDirty: true
        };
      }),

      deleteProject: (id) => set((state) => {
        const project = state.projects.find(p => p.id === id);
        if (!project) return state;

        get().addHistoryEntry('delete_project', `Projeto "${project.name}" excluído`, undefined, { project });

        return {
          projects: state.projects.filter(p => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          isDirty: true
        };
      }),

      setActiveProject: (id) => set((state) => ({
        activeProjectId: id,
        isDirty: true
      })),

      // History actions
      addHistoryEntry: (action, description, moleculeId, undoData) => set((state) => {
        const entry: HistoryEntry = {
          id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          action,
          description,
          moleculeId,
          undoData
        };

        // Remove entries after current index (when adding new entry after undo)
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(entry);

        // Limit history size
        const maxEntries = state.settings.maxHistoryEntries;
        if (newHistory.length > maxEntries) {
          newHistory.splice(0, newHistory.length - maxEntries);
        }

        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true
        };
      }),

      undo: () => {
        const state = get();
        if (state.historyIndex < 0) return false;

        const entry = state.history[state.historyIndex];
        
        // Apply undo logic based on action type
        if (entry.undoData) {
          switch (entry.action) {
            case 'create_project':
              if (entry.undoData.project) {
                set((state) => ({
                  projects: state.projects.filter(p => p.id !== entry.undoData.project.id),
                  activeProjectId: state.activeProjectId === entry.undoData.project.id ? null : state.activeProjectId
                }));
              }
              break;
            case 'delete_project':
              if (entry.undoData.project) {
                set((state) => ({
                  projects: [...state.projects, entry.undoData.project]
                }));
              }
              break;
            case 'update_project':
              if (entry.undoData.oldProject) {
                set((state) => {
                  const projectIndex = state.projects.findIndex(p => p.id === entry.undoData.oldProject.id);
                  if (projectIndex !== -1) {
                    const newProjects = [...state.projects];
                    newProjects[projectIndex] = entry.undoData.oldProject;
                    return { projects: newProjects };
                  }
                  return state;
                });
              }
              break;
          }
        }

        set((state) => ({
          historyIndex: state.historyIndex - 1,
          isDirty: true
        }));

        return true;
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return false;

        const nextIndex = state.historyIndex + 1;
        const entry = state.history[nextIndex];

        // Apply redo logic based on action type
        if (entry.undoData) {
          switch (entry.action) {
            case 'create_project':
              if (entry.undoData.project) {
                set((state) => ({
                  projects: [...state.projects, entry.undoData.project],
                  activeProjectId: entry.undoData.project.id
                }));
              }
              break;
            case 'delete_project':
              if (entry.undoData.project) {
                set((state) => ({
                  projects: state.projects.filter(p => p.id !== entry.undoData.project.id),
                  activeProjectId: state.activeProjectId === entry.undoData.project.id ? null : state.activeProjectId
                }));
              }
              break;
            case 'update_project':
              if (entry.undoData.newProject) {
                set((state) => {
                  const projectIndex = state.projects.findIndex(p => p.id === entry.undoData.newProject.id);
                  if (projectIndex !== -1) {
                    const newProjects = [...state.projects];
                    newProjects[projectIndex] = entry.undoData.newProject;
                    return { projects: newProjects };
                  }
                  return state;
                });
              }
              break;
          }
        }

        set({ historyIndex: nextIndex, isDirty: true });
        return true;
      },

      clearHistory: () => set({
        history: [],
        historyIndex: -1,
        isDirty: true
      }),

      // UI actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setFullscreenMode: (fullscreen) => set({ fullscreenMode: fullscreen }),

      // Research actions
      saveArticle: (article) => set((state) => {
        const exists = state.savedArticles.some(a => a.pmid === article.pmid);
        if (exists) return state;

        get().addHistoryEntry('save_article', `Artigo "${article.title}" salvo`, undefined, { article });

        return {
          savedArticles: [...state.savedArticles, article],
          isDirty: true
        };
      }),

      removeArticle: (pmid) => set((state) => {
        const article = state.savedArticles.find(a => a.pmid === pmid);
        if (!article) return state;

        get().addHistoryEntry('remove_article', `Artigo "${article.title}" removido`, undefined, { article });

        return {
          savedArticles: state.savedArticles.filter(a => a.pmid !== pmid),
          isDirty: true
        };
      }),

      addSearchTerm: (term) => set((state) => {
        const exists = state.searchHistory.includes(term);
        if (exists) return state;

        const newHistory = [term, ...state.searchHistory.slice(0, 19)]; // Keep last 20 searches

        return {
          searchHistory: newHistory,
          isDirty: true
        };
      }),

      // Save actions
      markDirty: () => set({ isDirty: true }),
      markClean: () => set({ 
        isDirty: false, 
        lastSaveTime: new Date().toISOString() 
      }),

      autoSave: () => {
        const state = get();
        if (state.settings.autoSave && state.isDirty) {
          // Auto-save logic would go here
          // For now, just mark as clean
          set({ 
            isDirty: false, 
            lastSaveTime: new Date().toISOString() 
          });
        }
      }
    }),
    {
      name: 'molecujoint-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        savedArticles: state.savedArticles,
        searchHistory: state.searchHistory,
        sidebarCollapsed: state.sidebarCollapsed,
        activePanel: state.activePanel
      })
    }
  )
);

// Auto-save hook
export const useAutoSave = () => {
  const { settings, autoSave } = useAppStateStore();
  
  React.useEffect(() => {
    if (!settings.autoSave) return;

    const interval = setInterval(() => {
      autoSave();
    }, settings.autoSaveInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [settings.autoSave, settings.autoSaveInterval, autoSave]);
};

