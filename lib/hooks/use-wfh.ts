'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { WFH } from '@/types'
import { toast } from 'sonner'

export function useWFH(page: number = 0, limit: number = 10, filters?: { status?: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ wfhRequests: WFH[], total: number, pageCount: number }>({
    queryKey: ['wfh-requests', page, limit, filters],
    queryFn: async () => {
      const params = { page, limit, ...filters }
      const { data } = await api.get('/time-tracking/wfh', { params })
      return data
    },
  })

  const submitWFHMutation = useMutation({
    mutationFn: async (data: Partial<WFH>) => {
      const { data: result } = await api.post('/time-tracking/wfh', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wfh-requests'] })
      toast.success('WFH request submitted')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit WFH request')
    }
  })

  const updateWFHMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WFH> }) => {
      const { data: result } = await api.put(`/time-tracking/wfh/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wfh-requests'] })
      toast.success('WFH status updated')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update WFH request')
    }
  })

  const deleteWFHMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/time-tracking/wfh/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wfh-requests'] })
      toast.success('WFH request removed')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete WFH request')
    }
  })

  return {
    wfhRequests: data?.wfhRequests,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    submitWFH: submitWFHMutation.mutate,
    isSubmitting: submitWFHMutation.isPending,
    updateWFH: updateWFHMutation.mutate,
    isUpdating: updateWFHMutation.isPending,
    deleteWFH: deleteWFHMutation.mutate,
    isDeleting: deleteWFHMutation.isPending,
  }
}
