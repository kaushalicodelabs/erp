'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Leave } from '@/types'
import { toast } from 'sonner'

export function useLeaves(page: number = 0, limit: number = 10, filters?: { status?: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ leaves: Leave[], total: number, pageCount: number }>({
    queryKey: ['leaves', page, limit, filters],
    queryFn: async () => {
      const params = { page, limit, ...filters }
      const { data } = await api.get('/time-tracking/leaves', { params })
      return data
    },
  })

  const submitLeaveMutation = useMutation({
    mutationFn: async (data: Partial<Leave>) => {
      const { data: result } = await api.post('/time-tracking/leaves', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('Leave request submitted')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit leave request')
    }
  })

  const updateLeaveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Leave> }) => {
      const { data: result } = await api.put(`/time-tracking/leaves/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('Leave status updated')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update leave request')
    }
  })

  const deleteLeaveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/time-tracking/leaves/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('Leave request removed')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete leave request')
    }
  })

  return {
    leaves: data?.leaves,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    submitLeave: submitLeaveMutation.mutate,
    isSubmitting: submitLeaveMutation.isPending,
    updateLeave: updateLeaveMutation.mutate,
    isUpdating: updateLeaveMutation.isPending,
    deleteLeave: deleteLeaveMutation.mutate,
    isDeleting: deleteLeaveMutation.isPending,
  }
}
