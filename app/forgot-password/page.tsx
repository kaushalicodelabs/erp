'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true)
    // Simulate API call - In a real app, this would send a reset link via email
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      toast.success('Reset instructions sent if email exists.')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white">
        <div className="p-8 md:p-12">
          {!isSubmitted ? (
            <>
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-violet-200">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
                <p className="text-slate-500 font-medium">No worries, it happens. Enter your email and we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="name@company.com"
                      className="h-14 bg-slate-50 border-transparent rounded-2xl pl-12 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                  {errors.email && <p className="text-xs font-bold text-red-500 pl-1">{errors.email.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-200 transition-all hover:-translate-y-0.5"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Reset Link'}
                </Button>

                <div className="text-center pt-2">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Mail className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Check Your Email</h1>
              <p className="text-slate-500 font-medium mb-10">We've sent password reset instructions to your email address.</p>
              
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400">
            Need help? <Link href="mailto:support@erp.com" className="text-violet-600 hover:underline">Contact IT Support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
