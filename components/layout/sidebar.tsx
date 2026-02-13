'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Building2, 
  Clock, 
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  Receipt,
  Wallet,
  CalendarDays,
  Home,
  BarChart3,
  ClipboardList,
  Briefcase,
  Star,
  History as HistoryIcon
} from 'lucide-react'
import { useUIStore } from '@/lib/store/ui-store'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['super_admin', 'hr'] },
  { name: 'Performance', href: '/employees/performance', icon: Star, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Projects', href: '/projects', icon: Briefcase, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Project Reports', href: '/projects/reports', icon: ClipboardList, roles: ['super_admin', 'hr', 'project_manager'] },
  { name: 'Clients', href: '/clients', icon: Building2, roles: ['super_admin', 'hr'] },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Leaves', href: '/time-tracking/leaves', icon: CalendarDays, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Reports', href: '/time-tracking/reports', icon: BarChart3, roles: ['super_admin', 'hr', 'project_manager'] },
  { name: 'WFH', href: '/time-tracking/wfh', icon: Home, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Finance', href: '/finance', icon: DollarSign, roles: ['super_admin', 'hr'] },
  { name: 'Financial Reports', href: '/finance/reports', icon: BarChart3, roles: ['super_admin', 'hr'] },
  { name: 'Payment Tracking', href: '/finance/payments', icon: HistoryIcon, roles: ['super_admin', 'hr'] },
  { name: 'Expenses', href: '/finance/expenses', icon: Receipt, roles: ['super_admin', 'hr', 'project_manager', 'employee'] },
  { name: 'Salaries', href: '/finance/salaries', icon: Wallet, roles: ['super_admin', 'hr'] },
]

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'employee'

  const filteredNavigation = navigation.filter((item: any) => {
    if (item.roles.includes(userRole)) return true;
    
    // Specific roles that should see employee-level items
    const employeeRoles = [
      'senior_software_developer',
      'software_developer',
      'associate_software_developer',
      'graphic_designer'
    ];
    
    if (employeeRoles.includes(userRole) && item.roles.includes('employee')) {
      return true;
    }
    
    return false;
  })

  return (
    <>
      {/* Sidebar aside */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-[#1e1e2d] transition-all duration-300 ease-in-out flex flex-col',
          sidebarCollapsed ? 'w-[70px]' : 'w-[250px]',
          // Mobile responsive classes
          'lg:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center flex-shrink-0 border-b border-white/5",
        sidebarCollapsed ? "justify-center px-0" : "px-5"
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-[15px] font-bold text-white tracking-tight">
              ERP Engine
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {!sidebarCollapsed && (
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
        )}
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  sidebarCollapsed ? 'justify-center px-2' : 'px-3',
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
                title={sidebarCollapsed ? item.name : ''}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  isActive ? "text-white" : "text-gray-500"
                )} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-white/5 py-3 px-3 space-y-1 flex-shrink-0">
        {bottomNav.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150',
                sidebarCollapsed ? 'justify-center px-2' : 'px-3'
              )}
              title={sidebarCollapsed ? item.name : ''}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Icon className="w-[18px] h-[18px] text-gray-500 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </div>
    </aside>
  </>
  )
}
