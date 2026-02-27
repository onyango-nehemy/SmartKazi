import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (id, updatedData) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, ...updatedData } : t
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  moveTask: (taskId, newStatus, newPosition) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, position: newPosition }
        : t
    )
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}))
