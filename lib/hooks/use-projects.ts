'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Project } from '@/types'
import { toast } from 'sonner'

export function useProjects(page: number = 0, limit: number = 6, search: string = '', clientId?: string) {
  const queryClient = useQueryClient()

  // Fetch all projects
  const { data, isLoading, error } = useQuery<{ projects: Project[], total: number, pageCount: number }>({
    queryKey: ['projects', page, limit, search, clientId],
    queryFn: async () => {
      const url = `/projects?page=${page}&limit=${limit}&search=${search}${clientId ? `&clientId=${clientId}` : ''}`
      const { data } = await api.get(url)
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
    projects: data?.projects,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutate,
    isUpdating: updateProjectMutation.isPending,
  }
}
