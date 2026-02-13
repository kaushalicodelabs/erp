'use client'

import { useState } from 'react'
import { useTasks, useTaskLogs } from '@/lib/hooks/use-tasks'
import { useProjects } from '@/lib/hooks/use-projects'
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  Filter,
  CheckCircle2,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CreateTaskModal } from '@/components/dashboard/create-task-modal'
import { LogHoursModal } from '@/components/dashboard/log-hours-modal'
import { useSession } from 'next-auth/react'
import { Task } from '@/types'
import { Edit3, ChevronDown, ChevronUp } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination-common'

function TaskLogsList({ taskId }: { taskId: string }) {
  const { data: logs, isLoading } = useTaskLogs(taskId)

  if (isLoading) return <div className="py-4 text-center text-xs text-gray-400">Loading logs...</div>
  if (!logs || logs.length === 0) return <div className="py-4 text-center text-xs text-gray-400 font-medium uppercase tracking-wider">No hours logged yet</div>

  return (
    <div className="mt-4 space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Work Logs</h4>
        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
          Total: {logs.reduce((acc, log) => acc + log.hours, 0)} hrs
        </span>
      </div>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log._id} className="flex flex-col gap-1 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">{log.hours} hours</span>
              <span className="text-[10px] font-medium text-zinc-400">{new Date(log.date).toLocaleDateString()}</span>
            </div>
            <p className="text-[11px] text-zinc-500 line-clamp-2">{log.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10
  const { tasks, total, pageCount, isLoading: tasksLoading, updateTask } = useTasks(undefined, currentPage, itemsPerPage)
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({})
  
  const isDeveloper = ['graphic_designer', 'associate_software_developer', 'software_developer', 'senior_software_developer'].includes(session?.user?.role || '')

  const toggleLogs = (taskId: string) => {
    setExpandedLogs(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const filteredTasks = tasks?.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Group tasks by project
  const tasksByProject = filteredTasks?.reduce((acc, task) => {
    const project = typeof task.projectId !== 'string' ? task.projectId?.name || 'Unknown Project' : 'Project'
    if (!acc[project]) acc[project] = []
    acc[project].push(task)
    return acc
  }, {} as Record<string, Task[]>) || {}

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-100'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100'
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'in-progress': return <Timer className="w-4 h-4 text-violet-500" />
      case 'review': return <AlertCircle className="w-4 h-4 text-amber-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    updateTask({ id: taskId, data: { status: newStatus as any } })
  }

  if (tasksLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track deliverables across all projects.</p>
        </div>
        {(session?.user?.role === 'super_admin' || session?.user?.role === 'project_manager') && (
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Assign Task
          </Button>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }} 
        task={selectedTask}
      />

      <LogHoursModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 h-11 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          {['all', 'todo', 'in-progress', 'review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                statusFilter === status 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List - Grouped by Project */}
      <div className="space-y-12">
        {Object.keys(tasksByProject).map((projectName) => (
          <div key={projectName} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[2px] flex-1 bg-gray-100" />
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                Project: {projectName}
              </h2>
              <div className="h-[2px] flex-1 bg-gray-100" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {tasksByProject[projectName].map((task) => (
                <div key={task._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          getPriorityColor(task.priority)
                        )}>
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors uppercase">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    </div>

                    <div className="flex flex-wrap md:flex-col items-end gap-4 min-w-[200px]">
                      <div className="flex items-center gap-4 text-[11px] font-bold uppercase text-gray-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{typeof task.assigneeId !== 'string' ? `${task.assigneeId?.firstName} ${task.assigneeId?.lastName}` : 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full justify-end">
                         {getStatusIcon(task.status)}
                         
                         {isDeveloper ? (
                           <select
                            className={cn(
                              "text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                              task.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              task.status === 'in-progress' ? "bg-violet-50 text-violet-600 border-violet-100" :
                              "bg-gray-50 text-gray-500 border-gray-200"
                            )}
                            value={task.status}
                            onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                          >
                            {(() => {
                              const statusOrder = ['todo', 'in-progress', 'review', 'completed']
                              const currentIndex = statusOrder.indexOf(task.status)
                              const nextStatus = statusOrder[currentIndex + 1]
                              
                              return (
                                <>
                                  <option value={task.status}>{task.status.replace('-', ' ')}</option>
                                  {nextStatus && (
                                    <option value={nextStatus}>{nextStatus.replace('-', ' ')}</option>
                                  )}
                                </>
                              )
                            })()}
                          </select>
                         ) : (
                           <span className={cn(
                             "text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg border",
                             task.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             task.status === 'in-progress' ? "bg-violet-50 text-violet-600 border-violet-100" :
                             "bg-gray-50 text-gray-500 border-gray-200"
                           )}>
                             {task.status.replace('-', ' ')}
                           </span>
                         )}

                        {(session?.user?.role === 'super_admin' || session?.user?.role === 'project_manager') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:text-violet-600 hover:bg-violet-50"
                            disabled={task.status !== 'todo'}
                            title={task.status !== 'todo' ? "Cannot edit task once work has started" : "Edit Task"}
                            onClick={() => {
                              setSelectedTask(task)
                              setIsTaskModalOpen(true)
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}

                        {isDeveloper && task.status === 'completed' && !task.hasLog && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] font-bold uppercase h-8 px-3 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition-all active:scale-95"
                            onClick={() => {
                              setSelectedTask(task)
                              setIsLogModalOpen(true)
                            }}
                          >
                            Log Hours
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg group/logs"
                          onClick={() => toggleLogs(task._id)}
                        >
                          {expandedLogs[task._id] ? (
                            <>Hide logs <ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <>View logs <ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedLogs[task._id] && (
                    <div className="pt-2">
                      <TaskLogsList taskId={task._id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(tasksByProject).length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No tasks found</h3>
            <p className="text-gray-500 mt-2 text-sm">Assign a new task to get operations moving.</p>
          </div>
        )}

        <Pagination 
          pageCount={pageCount || 0}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
