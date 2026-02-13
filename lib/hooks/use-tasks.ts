import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Task, TaskTimeLog } from '@/types'
import { toast } from 'sonner'

export function useTasks(projectId?: string, page: number = 0, limit: number = 10) {
  const queryClient = useQueryClient()

  // Fetch all tasks
  const { data, isLoading, error } = useQuery<{ tasks: Task[], total: number, pageCount: number }>({
    queryKey: projectId ? ['tasks', projectId, page, limit] : ['tasks', page, limit],
    queryFn: async () => {
      const url = `/tasks?${projectId ? `projectId=${projectId}&` : ''}page=${page}&limit=${limit}`
      const { data } = await api.get(url)
      return data
    },
  })

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const { data } = await api.post('/tasks', newTask)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<Task> }) => {
      const { data } = await api.put(`/tasks/${id}`, updateData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tasks/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task removed successfully')
    },
  })

  // Create time log mutation
  const logTimeMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<TaskTimeLog> }) => {
      const { data: responseData } = await api.post(`/tasks/${taskId}/logs`, data)
      return responseData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-logs'] })
      toast.success('Hours logged successfully')
    },
  })

  return {
    tasks: data?.tasks,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutate,
    isUpdating: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutate,
    isDeleting: deleteTaskMutation.isPending,
    logTime: logTimeMutation.mutate,
    isLoggingTime: logTimeMutation.isPending,
  }
}

export function useTaskLogs(taskId?: string) {
  return useQuery<TaskTimeLog[]>({
    queryKey: ['task-logs', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}/logs`)
      return data
    },
    enabled: !!taskId,
  })
}
