/**
 * Maps a professional position name to its corresponding system role.
 * This ensures consistency between the organizational structure and system permissions.
 */
export function mapPositionToRole(position: string): string {
  const pos = position.toLowerCase()

  if (pos.includes('super admin')) return 'super_admin'
  if (pos.includes('hr')) return 'hr'
  if (pos.includes('project manager')) return 'project_manager'
  if (pos.includes('graphic designer')) return 'graphic_designer'
  if (pos.includes('associate software developer')) return 'associate_software_developer'
  if (pos.includes('senior software developer')) return 'senior_software_developer'
  if (pos.includes('software developer')) return 'software_developer'

  // Default fallback for any unspecified roles
  return 'software_developer'
}
