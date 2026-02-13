'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Loader2, Camera, Upload, FileText, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEmployees } from '@/lib/hooks/use-employees'
import { useState, useRef } from 'react'
import api from '@/lib/api/axios'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Task, Employee } from '@/types'
import { useEffect } from 'react'

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  position: z.string().min(2, 'Position is required'),
  department: z.string().min(2, 'Department is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive', 'on-leave']).default('active'),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function AddEmployeeModal({ isOpen, onClose, employee }: { isOpen: boolean, onClose: () => void, employee?: Employee | null }) {
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees()
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [documents, setDocuments] = useState<File[]>([])
  const [existingDocuments, setExistingDocuments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0
    }
  })

  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        salary: employee.salary,
        status: employee.status,
        joiningDate: new Date(employee.joiningDate).toISOString().split('T')[0],
      })
      if (employee.profilePhoto) {
        setPhotoPreview(`/api/files/${employee.profilePhoto}`)
      } else {
        setPhotoPreview(null)
      }
      setExistingDocuments(employee.documents || [])
      setDocuments([])
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        status: 'active',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: 0
      })
      setPhotoPreview(null)
      setProfilePhoto(null)
      setDocuments([])
      setExistingDocuments([])
    }
  }, [employee, reset, isOpen])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocuments(prev => [...prev, ...files])
  }

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingDoc = (index: number) => {
    setExistingDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setIsUploading(true)
    try {
      let profilePhotoId = employee?.profilePhoto || null
      let docData = [...existingDocuments]

      // Upload profile photo if changed
      if (profilePhoto) {
        const photoFormData = new FormData()
        photoFormData.append('files', profilePhoto)
        const photoRes = await api.post('/upload', photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        profilePhotoId = photoRes.data.files[0].id
      }

      // Upload new documents
      if (documents.length > 0) {
        const docsFormData = new FormData()
        documents.forEach(doc => docsFormData.append('files', doc))
        const docsRes = await api.post('/upload', docsFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const newDocs = docsRes.data.files.map((f: any) => ({
          name: f.name,
          fileId: f.id,
          uploadDate: new Date()
        }))
        docData = [...docData, ...newDocs]
      }

      return { profilePhotoId, docData }
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const { profilePhotoId, docData } = await uploadFiles()

      const submissionData = {
        ...data,
        joiningDate: new Date(data.joiningDate),
        profilePhoto: profilePhotoId,
        documents: docData
      }
      
      if (employee) {
        updateEmployee({ id: employee._id, data: submissionData as any }, {
          onSuccess: () => {
            onClose()
          }
        })
      } else {
        createEmployee(submissionData as any, {
          onSuccess: () => {
            reset()
            setProfilePhoto(null)
            setPhotoPreview(null)
            setDocuments([])
            onClose()
          }
        })
      }
    } catch (error: any) {
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 gap-4 mb-2">
              <div className="relative group/photo">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-zinc-300">
                      <Camera className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors border-2 border-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-900">Profile Photo</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mt-1">JPG, PNG up to 5MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} placeholder="Jane" />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} placeholder="Doe" />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} placeholder="jane.doe@company.com" disabled={!!employee} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <select 
                  id="position" 
                  {...register('position')} 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Position</option>
                  {[
                    'Super Admin',
                    'HR',
                    'Project Manager',
                    'Graphic Designer',
                    'Associate Software Developer',
                    'Software Developer',
                    'Senior Software Developer',
                    'QA'
                  ].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
                {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select 
                  id="department" 
                  {...register('department')} 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {[
                    'Admin',
                    'HR',
                    'MERN',
                    'React Native',
                    'Project Management',
                    'UI/UX',
                    'QA'
                  ].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary ($)</Label>
                <Input id="salary" type="number" {...register('salary')} placeholder="85000" />
                {errors.salary && <p className="text-xs text-red-500">{errors.salary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" type="date" {...register('joiningDate')} />
                {errors.joiningDate && <p className="text-xs text-red-500">{errors.joiningDate.message}</p>}
              </div>

              {/* Status Section (only for edit mode) */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  {...register('status')} 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Documents</h4>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mt-1">Upload ID, Contract, etc. (MAX 10MB)</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => docInputRef.current?.click()}
                  className="h-8 text-[11px] font-bold uppercase border-zinc-200 hover:bg-zinc-50"
                  disabled={isUploading || isCreating || isUpdating}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  Add Files
                </Button>
                <input
                  type="file"
                  multiple
                  ref={docInputRef}
                  onChange={handleDocChange}
                  className="hidden"
                />
              </div>

              {(existingDocuments.length > 0 || documents.length > 0) && (
                <div className="space-y-2 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  {/* Existing Docs */}
                  {existingDocuments.map((doc, index) => (
                    <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-100 shadow-sm transition-all hover:border-violet-200 group/doc">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">{doc.name}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingDoc(index)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {/* New Docs */}
                  {documents.map((doc, index) => (
                    <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-violet-100 shadow-sm transition-all hover:border-violet-200 group/doc">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">{doc.name}</span>
                          <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest">New File</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDoc(index)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating || isUploading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]" disabled={isCreating || isUpdating || isUploading}>
                {isCreating || isUpdating || isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isUploading ? 'Uploading...' : 'Saving...'}</span>
                  </div>
                ) : (
                  employee ? 'Update Employee' : 'Create Employee'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
