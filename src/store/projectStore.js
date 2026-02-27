import { create } from 'zustand'

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  updateProject: (id, updatedData) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updatedData }
      : state.currentProject
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}))
