'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks/use-projects'
import { useClients } from '@/lib/hooks/use-clients'
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  LayoutGrid, 
  List,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { AddProjectModal } from '@/components/dashboard/add-project-modal'
import { UpdateProjectStatusModal } from '@/components/dashboard/update-project-status-modal'
import { ManageMembersModal } from '@/components/dashboard/manage-members-modal'
import { Project, Employee as EmployeeType } from '@/types'
import { useSession } from 'next-auth/react'
import { useEmployees } from '@/lib/hooks/use-employees'

export default function ProjectsPage() {
  const { data: session } = useSession()
  const { projects, isLoading: projectsLoading } = useProjects()
  const { employees } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const currentEmployee = employees?.find(e => e.userId === session?.user?.id)

  const isProjectManagerOf = (project: Project) => {
    if (!currentEmployee || !project.projectManager) return false
    const pmId = typeof project.projectManager === 'string' 
      ? project.projectManager 
      : (project.projectManager as EmployeeType)._id
    return String(pmId) === String(currentEmployee._id)
  }

  const handleUpdateStatus = (project: Project) => {
    setSelectedProject(project)
    setIsUpdateModalOpen(true)
  }

  const handleManageMembers = (project: Project) => {
    setSelectedProject(project)
    setIsManageModalOpen(true)
  }

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your enterprise project portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-violet-600" : "text-gray-400 hover:text-gray-600")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm text-violet-600" : "text-gray-400 hover:text-gray-600")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {session?.user?.role === 'super_admin' && (
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          )}
        </div>
      </div>

      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <UpdateProjectStatusModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedProject(null)
        }} 
        project={selectedProject}
      />
      <ManageMembersModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => (
            <div key={project._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
                    {typeof project.clientId !== 'string' ? project.clientId?.companyName : 'Lead Project'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{project.name}</h3>
                </div>
                <button 
                  onClick={() => handleUpdateStatus(project)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer",
                    project.status === 'in-progress' ? "bg-violet-50 text-violet-600 border border-violet-100" :
                    project.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    "bg-gray-50 text-gray-500 border border-gray-100"
                  )}
                >
                  {project.status.replace('-', ' ')}
                </button>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{project.description}</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400 uppercase tracking-widest">Progress</span>
                  <span className="text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-violet-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.assignedEmployees.slice(0, 3).map((emp, i) => {
                    const employee = typeof emp === 'string' ? null : emp as EmployeeType
                    return (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 hover:z-10 transition-all cursor-default"
                        title={employee ? `${employee.firstName} ${employee.lastName}` : 'Member'}
                      >
                        {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'M'}
                      </div>
                    )
                  })}
                  {project.assignedEmployees.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      +{project.assignedEmployees.length - 3}
                    </div>
                  )}
                  {project.assignedEmployees.length === 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-300">
                      0
                    </div>
                  )}
                </div>
                 <div className="flex items-center gap-1.5 text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">
                    {typeof project.projectManager !== 'string' ? `${project.projectManager?.firstName} ${project.projectManager?.lastName}` : 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Dec 2026</span>
                </div>
              </div>

              {/* Actions */}
              {(session?.user?.role === 'super_admin' || 
                (session?.user?.role === 'project_manager' && isProjectManagerOf(project))) && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[10px] font-bold uppercase h-8 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 gap-1.5"
                    onClick={() => handleManageMembers(project)}
                  >
                    <Users className="w-3 h-3" />
                    Members
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-bold uppercase h-8 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                    onClick={() => handleUpdateStatus(project)}
                  >
                    Update
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
           <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</th>
                {session?.user?.role === 'super_admin' && (
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                )}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects?.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{project.name}</p>
                      <p className="text-xs text-violet-600 font-medium">
                        {typeof project.clientId !== 'string' ? project.clientId?.companyName : 'Corporate Client'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                         {typeof project.projectManager !== 'string' ? `${project.projectManager?.firstName?.[0]}${project.projectManager?.lastName?.[0]}` : 'U'}
                       </div>
                       <p className="text-sm font-medium text-gray-700">
                         {typeof project.projectManager !== 'string' ? `${project.projectManager?.firstName} ${project.projectManager?.lastName}` : 'Unassigned'}
                       </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  {session?.user?.role === 'super_admin' && (
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${project.budget.toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(project)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border transition-all hover:bg-white cursor-pointer",
                          project.status === 'in-progress' ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-gray-100 text-gray-500 border-gray-200"
                        )}
                      >
                        {project.status}
                      </button>
                      {(session?.user?.role === 'super_admin' || 
                        (session?.user?.role === 'project_manager' && isProjectManagerOf(project))) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-7 w-7 text-gray-400 hover:text-violet-600"
                          onClick={() => handleManageMembers(project)}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}

      {filteredProjects?.length === 0 && (
         <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
          <p className="text-gray-500 mt-2 text-sm">Create a new project to get started tracking operations.</p>
          {session?.user?.role === 'super_admin' && (
            <Button className="mt-6 bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          )}
      </div>
      )}
    </div>
  )
}
