'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Client } from '@/types'
import { toast } from 'sonner'

export function useClients() {
  const queryClient = useQueryClient()

  // Fetch all clients
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients')
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
    clients,
    isLoading,
    error,
    createClient: createClientMutation.mutate,
    isCreating: createClientMutation.isPending,
  }
}
