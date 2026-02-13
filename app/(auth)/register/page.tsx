'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fields = [
    { name: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'name@company.com' },
    { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'confirmPassword' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen flex bg-[#f5f6fa]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#1e1e2d] flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">ERP Engine</span>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Start your journey with ERP Engine
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create your account and get access to powerful tools for managing your enterprise operations.
          </p>
        </div>

        <p className="text-xs text-gray-500">© 2026 ERP Engine. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">ERP Engine</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-6">Get started with your enterprise dashboard</p>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                  <input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:opacity-50"
                    {...register(field.name)}
                    disabled={isLoading}
                  />
                  {errors[field.name] && <p className="text-xs text-red-600 mt-1">{errors[field.name]?.message}</p>}
                </div>
              ))}

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
