export type UserRole = 
  | 'super_admin' 
  | 'hr' 
  | 'project_manager' 
  | 'employee'
  | 'senior_software_developer'
  | 'software_developer'
  | 'associate_software_developer'
  | 'graphic_designer'

export interface RoutePermission {
  path: string
  roles: UserRole[]
  exact?: boolean
}

export const routePermissions: RoutePermission[] = [
  { path: '/dashboard', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/profile', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/employees', roles: ['super_admin', 'hr'], exact: true },
  { path: '/employees/performance', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/projects', roles: ['super_admin', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'], exact: true },
  { path: '/projects/reports', roles: ['super_admin', 'project_manager'] },
  { path: '/projects/tasks', roles: ['super_admin', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/clients', roles: ['super_admin', 'hr'] },
  { path: '/time-tracking', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'], exact: true },
  { path: '/time-tracking/leaves', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/time-tracking/reports', roles: ['super_admin', 'hr', 'project_manager'] },
  { path: '/time-tracking/wfh', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/meetings', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/interviews', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/finance', roles: ['super_admin', 'hr'], exact: true },
  { path: '/finance/reports', roles: ['super_admin', 'hr'] },
  { path: '/finance/payments', roles: ['super_admin', 'hr'] },
  { path: '/finance/expenses', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
  { path: '/finance/salaries', roles: ['super_admin', 'hr'] },
  { path: '/notifications', roles: ['super_admin', 'hr', 'project_manager', 'employee', 'senior_software_developer', 'software_developer', 'associate_software_developer', 'graphic_designer'] },
]

export function isRouteAllowed(path: string, role: string): boolean {
  // Find matching permission
  const permission = routePermissions.find(p => {
    if (p.exact) return path === p.path
    return path.startsWith(p.path)
  })

  if (!permission) return true // Allow if no specific rule is defined (e.g., dashboard root)
  
  return permission.roles.includes(role as UserRole)
}
