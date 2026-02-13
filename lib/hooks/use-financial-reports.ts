'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'

export function useFinancialReports(year?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-reports', year],
    queryFn: async () => {
      const { data } = await api.get('/finance/reports', { params: { year } })
      return data
    },
  })

  return {
    reportData: data,
    isLoading,
    error,
  }
}
