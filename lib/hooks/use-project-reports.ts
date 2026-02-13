'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'

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
