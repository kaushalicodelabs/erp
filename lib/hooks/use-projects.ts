'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Project } from '@/types'
import { toast } from 'sonner'

export function useProjects() {
  const queryClient = useQueryClient()

  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects')
      return data
    },
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      const { data } = await api.post('/projects', newProject)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
  })

  // Update project status/progress
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<Project> }) => {
      const { data } = await api.put(`/projects/${id}`, updateData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated')
    },
  })

  return {
    projects,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutate,
    isUpdating: updateProjectMutation.isPending,
  }
}
