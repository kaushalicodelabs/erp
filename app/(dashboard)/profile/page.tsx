'use client'

import { useEffect, useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Shield, 
  Clock,
  Building2,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/employees/me')
      .then(res => res.json())
      .then(data => {
        setEmployee(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching profile:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    )
  }

  if (!employee || employee.error) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-200 shadow-sm">
        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-zinc-200" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Profile Not Found</h3>
        <p className="text-zinc-500 mt-2">Could not find employee records associated with your account.</p>
      </div>
    )
  }

  const sections = [
    {
      title: "Personal Information",
      icon: <User className="w-5 h-5" />,
      items: [
        { label: "Full Name", value: `${employee.firstName} ${employee.lastName}`, icon: <User className="w-4 h-4" /> },
        { label: "Email Address", value: employee.email, icon: <Mail className="w-4 h-4" /> },
        { label: "Phone Number", value: employee.phone, icon: <Phone className="w-4 h-4" /> },
        { label: "Mailing Address", value: employee.address || 'Not Provided', icon: <MapPin className="w-4 h-4" /> },
      ]
    },
    {
      title: "Professional Details",
      icon: <Briefcase className="w-5 h-5" />,
      items: [
        { label: "Employee ID", value: employee.employeeId, icon: <Shield className="w-4 h-4" /> },
        { label: "Department", value: employee.department, icon: <Building2 className="w-4 h-4" /> },
        { label: "Position", value: employee.position, icon: <Briefcase className="w-4 h-4" /> },
        { label: "Joining Date", value: format(new Date(employee.joiningDate), 'MMMM dd, yyyy'), icon: <Calendar className="w-4 h-4" /> },
      ]
    },
    {
      title: "Emergency Contact",
      icon: <FileText className="w-5 h-5" />,
      items: [
        { label: "Contact Name", value: employee.emergencyContact?.name || 'Not Provided', icon: <User className="w-4 h-4" /> },
        { label: "Relationship", value: employee.emergencyContact?.relationship || 'Not Provided', icon: <ArrowRight className="w-4 h-4" /> },
        { label: "Phone Number", value: employee.emergencyContact?.phone || 'Not Provided', icon: <Phone className="w-4 h-4" /> },
      ]
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-zinc-100 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                {employee.profilePhoto ? (
                  <img src={`/api/files/${employee.profilePhoto}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-zinc-200" />
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge className={cn(
                  "uppercase tracking-widest text-[10px] font-black px-3 py-1 rounded-lg border",
                  employee.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1 flex items-center gap-2">
                {employee.position} <span className="w-1 h-1 rounded-full bg-zinc-300" /> {employee.department}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {sections.map((section, idx) => (
            <Card key={idx} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-violet-600 border border-violet-50">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {section.items.map((item, i) => (
                    <div key={i} className="group">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 group-hover:text-violet-500 transition-colors">
                        {item.label}
                      </label>
                      <div className="flex items-center gap-3 font-bold text-zinc-600 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-all">
                          {item.icon}
                        </div>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 px-8 py-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  <Clock className="w-5 h-5" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Tenure</div>
                <div className="text-xl font-black text-violet-700">
                  {Math.floor((new Date().getTime() - new Date(employee.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} Years
                </div>
                <div className="text-[9px] font-bold text-violet-400 mt-1 uppercase tracking-tighter italic">Joined {format(new Date(employee.joiningDate), 'MMMM yyyy')}</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Status</span>
                  <Badge variant="outline" className="bg-white border-emerald-100 text-emerald-600 uppercase text-[9px] font-black">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Profile Visibility</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Private</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-24 h-24" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10">Data Privacy</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium relative z-10">
              Your profile information is only visible to you and authorized HR administrators. For any updates, please contact your HR representative.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
