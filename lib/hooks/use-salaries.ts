'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Salary } from '@/types'
import { toast } from 'sonner'

export function useSalaries(employeeId?: string) {
  const queryClient = useQueryClient()

  const { data: salaries, isLoading, error } = useQuery<Salary[]>({
    queryKey: ['salaries', employeeId],
    queryFn: async () => {
      const url = employeeId ? `/finance/salaries/${employeeId}` : '/finance/salaries'
      const { data } = await api.get(url)
      return Array.isArray(data) ? data : [data]
    },
  })

  const updateSalaryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Salary> }) => {
      const { data: result } = await api.post('/finance/salaries', { ...data, employeeId: id })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('Salary record updated')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  return {
    salaries,
    isLoading,
    error,
    updateSalary: updateSalaryMutation.mutate,
    isUpdating: updateSalaryMutation.isPending,
  }
}
