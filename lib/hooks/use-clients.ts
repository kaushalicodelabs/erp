'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Client } from '@/types'
import { toast } from 'sonner'

export function useClients(page: number = 0, limit: number = 8, search: string = '') {
  const queryClient = useQueryClient()

  // Fetch all clients
  const { data, isLoading, error } = useQuery<{ clients: Client[], total: number, pageCount: number }>({
    queryKey: ['clients', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get(`/clients?page=${page}&limit=${limit}&search=${search}`)
      return data
    },
  })

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      const { data } = await api.post('/clients', newClient)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client added successfully')
    },
  })

  return {
    clients: data?.clients,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    error,
    createClient: createClientMutation.mutate,
    isCreating: createClientMutation.isPending,
  }
}
