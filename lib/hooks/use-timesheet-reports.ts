'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'

interface ReportFilters {
  startDate?: string
  endDate?: string
  employeeId?: string
  department?: string
}

export function useTimesheetReports(filters: ReportFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['timesheet-reports', filters],
    queryFn: async () => {
      const { data } = await api.get('/time-tracking/reports', { params: filters })
      return data
    },
  })

  return {
    reportData: data,
    isLoading,
    error,
  }
}
