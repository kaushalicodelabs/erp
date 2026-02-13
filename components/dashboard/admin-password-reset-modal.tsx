'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, ShieldAlert, Loader2, RefreshCcw } from 'lucide-react'
import api from '@/lib/api/axios'
import { toast } from 'sonner'

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm the password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetFormValues = z.infer<typeof resetSchema>

interface AdminPasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  employee: {
    _id: string
    firstName: string
    lastName: string
    userId: string
  } | null
}

export function AdminPasswordResetModal({ isOpen, onClose, employee }: AdminPasswordResetModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormValues) => {
    if (!employee?.userId) return
    
    setIsLoading(true)
    try {
      await api.post('/admin/reset-password', {
        userId: employee.userId,
        newPassword: data.newPassword
      })
      toast.success(`Password for ${employee.firstName} reset successfully`)
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-violet-600 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <RefreshCcw className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Reset User Password</DialogTitle>
          <p className="text-violet-50 text-sm opacity-90">Resetting credentials for **{employee.firstName} {employee.lastName}**.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">New Password</Label>
              <Input
                {...register('newPassword')}
                type="password"
                placeholder="••••••••"
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
              {errors.newPassword && <p className="text-xs font-bold text-red-500 pl-1">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Confirm New Password</Label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
              {errors.confirmPassword && <p className="text-xs font-bold text-red-500 pl-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
