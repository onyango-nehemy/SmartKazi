import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  // FIX: Use String() comparison to avoid ID type mismatches
  updateTask: (id, updatedData) => set((state) => ({
    tasks: state.tasks.map(t => 
      String(t.id) === String(id) ? { ...t, ...updatedData } : t
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => String(t.id) !== String(id))
  })),
  
  // FIX: Critical for Drag & Drop functionality
  moveTask: (taskId, newStatus, newPosition) => set((state) => ({
    tasks: state.tasks.map(t => 
      String(t.id) === String(taskId) 
        ? { ...t, status: newStatus, position: newPosition }
        : t
    )
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}))