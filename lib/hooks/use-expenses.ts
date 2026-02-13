'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Expense } from '@/types'
import { toast } from 'sonner'

export function useExpenses(filters?: { status?: string }) {
  const queryClient = useQueryClient()

  const { data: expenses, isLoading, error } = useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/expenses', { params: filters })
      return data
    },
  })

  const submitExpenseMutation = useMutation({
    mutationFn: async (newExpense: Partial<Expense>) => {
      const { data } = await api.post('/finance/expenses', newExpense)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense submitted successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Expense> }) => {
      const { data: result } = await api.put(`/finance/expenses/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense updated')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/finance/expenses/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense removed')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  return {
    expenses,
    isLoading,
    error,
    submitExpense: submitExpenseMutation.mutate,
    isSubmitting: submitExpenseMutation.isPending,
    updateExpense: updateExpenseMutation.mutate,
    isUpdating: updateExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutate,
    isDeleting: deleteExpenseMutation.isPending,
  }
}
