'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Timesheet } from '@/types'
import { toast } from 'sonner'

export function useAttendance(month?: number, year?: number) {
  const queryClient = useQueryClient()

  // Fetch attendance records
  const { data: attendance, isLoading, error } = useQuery<Timesheet[]>({
    queryKey: ['attendance', month, year],
    queryFn: async () => {
      const params = month !== undefined && year !== undefined ? { month, year } : {}
      const { data } = await api.get('/attendance', { params })
      return data
    },
  })

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/attendance')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Clocked in successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/attendance/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Clocked out successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // Helper to find today's record
  const todayRecord = attendance?.find(record => {
    const recordDate = new Date(record.date)
    const today = new Date()
    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    )
  })

  return {
    attendance,
    isLoading,
    error,
    clockIn: clockInMutation.mutate,
    isClockingIn: clockInMutation.isPending,
    clockOut: clockOutMutation.mutate,
    isClockingOut: clockOutMutation.isPending,
    todayRecord
  }
}
