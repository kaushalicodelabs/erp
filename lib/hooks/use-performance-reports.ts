'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'

interface PerformanceFilters {
  employeeId?: string
  month?: number
  year?: number
}

export function usePerformanceReports(filters: PerformanceFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['performance-reports', filters],
    queryFn: async () => {
      const { data } = await api.get('/employees/performance', { params: filters })
      return data
    },
  })

  return {
    performanceData: data,
    isLoading,
    error,
  }
}
