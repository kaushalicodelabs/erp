'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClients } from '@/lib/hooks/use-clients'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const clientSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

export function AddClientModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { createClient, isCreating } = useClients()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
    }
  })

  const onSubmit = (data: ClientFormValues) => {
    createClient(data, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register New Client</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...register('companyName')} placeholder="Acme Corp" />
                {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" {...register('contactPerson')} placeholder="John Smith" />
                {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="john@acme.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL (Optional)</Label>
                <Input id="website" {...register('website')} placeholder="https://acme.com" />
                {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Client'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
