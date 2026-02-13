'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { ProjectReport } from '@/types'
import { toast } from 'sonner'

export function useProjectReports() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-reports'],
    queryFn: async () => {
      const { data } = await api.get('/projects/reports')
      return data
    },
  })

  return {
    reportData: data,
    isLoading,
    error,
  }
}

export function useProjectStatusReports(projectId?: string) {
  const queryClient = useQueryClient()

  const { data: reports, isLoading, error } = useQuery<ProjectReport[]>({
    queryKey: projectId ? ['project-status-reports', projectId] : ['project-status-reports'],
    queryFn: async () => {
      const url = projectId ? `/projects/status-reports?projectId=${projectId}` : '/projects/status-reports'
      const { data } = await api.get(url)
      return data
    },
  })

  const submitReportMutation = useMutation({
    mutationFn: async (report: Partial<ProjectReport>) => {
      const { data } = await api.post('/projects/status-reports', report)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-status-reports'] })
      queryClient.invalidateQueries({ queryKey: ['project-reports'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project report submitted successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to submit report')
    }
  })

  return {
    reports,
    isLoading,
    error,
    submitReport: submitReportMutation.mutate,
    isSubmitting: submitReportMutation.isPending,
  }
}
