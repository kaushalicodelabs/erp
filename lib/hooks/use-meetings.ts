'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Meeting } from '@/types'
import { toast } from 'sonner'

export function useMeetings(status?: string, page: number = 0, limit: number = 6, search: string = '') {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ meetings: Meeting[], total: number, pageCount: number }>({
    queryKey: ['meetings', status, page, limit, search],
    queryFn: async () => {
      const url = `/meetings?page=${page}&limit=${limit}&search=${search}${status ? `&status=${status}` : ''}`
      const { data } = await api.get(url)
      return data
    },
  })

  const createMeetingMutation = useMutation({
    mutationFn: async (newMeeting: Partial<Meeting>) => {
      const { data } = await api.post('/meetings', newMeeting)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting scheduled successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to schedule meeting')
    }
  })

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Meeting> }) => {
      const { data: responseData } = await api.put(`/meetings/${id}`, data)
      return responseData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting updated')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update meeting')
    }
  })

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/meetings/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting cancelled')
    },
  })

  return {
    meetings: data?.meetings,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    createMeeting: createMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,
    updateMeeting: updateMeetingMutation.mutate,
    isUpdating: updateMeetingMutation.isPending,
    deleteMeeting: deleteMeetingMutation.mutate,
    isDeleting: deleteMeetingMutation.isPending,
  }
}
