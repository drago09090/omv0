import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/contexts/auth-context"

// Permission mappings for different modules
const modulePermissions: Record<string, string[]> = {
  dashboard: ['dashboard.read'],
  activations: ['activations.read', 'activations.write'],
  recharges: ['recharges.read', 'recharges.write'],
  'plans-offers': ['plans.read', 'plans.write'],
  customers: ['customers.read', 'customers.write'],
  lines: ['customers.read', 'customers.write'],
  sims: ['sims.read', 'sims.write'],
  warehouse: ['warehouse.read', 'warehouse.write'],
  balance: ['balance.read', 'balance.write'],
  billing: ['billing.read', 'billing.write'],
  transactions: ['billing.read'],
  tickets: ['tickets.read', 'tickets.write'],
  reports: ['reports.read', 'reports.generate'],
  users: ['users.read', 'users.write'],
  settings: ['settings.read', 'settings.write'],
  'webhook-logs': ['webhooks.read']
}

// Role hierarchy - higher roles inherit permissions from lower roles
const roleHierarchy: Record<UserRole, UserRole[]> = {
  superadmin: ['superadmin', 'admin', 'gerente', 'operator', 'subdistributor', 'vendor'],
  admin: ['admin', 'gerente', 'operator', 'subdistributor', 'vendor'],
  gerente: ['gerente', 'operator', 'subdistributor', 'vendor'],
  operator: ['operator', 'subdistributor', 'vendor'],
  subdistributor: ['subdistributor', 'vendor'],
  vendor: ['vendor']
}

export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth()

  const canAccessModule = (moduleId: string): boolean => {
    if (!user) return false

    // Superadmin has access to everything
    if (user.role === 'superadmin') return true

    // Check if user has required permissions for the module
    const requiredPermissions = modulePermissions[moduleId] || []
    
    // User needs at least one of the required permissions
    if (requiredPermissions.length === 0) return true
    
    return requiredPermissions.some(permission => hasPermission(permission))
  }

  const canPerformAction = (action: string): boolean => {
    if (!user) return false
    
    // Superadmin can perform any action
    if (user.role === 'superadmin') return true
    
    return hasPermission(action)
  }

  const canManageUser = (targetUserRole: UserRole): boolean => {
    if (!user) return false
    
    // Check if current user's role can manage the target role
    const allowedRoles = roleHierarchy[user.role] || []
    return allowedRoles.includes(targetUserRole)
  }

  const getAccessibleModules = (): string[] => {
    if (!user) return []
    
    return Object.keys(modulePermissions).filter(moduleId => canAccessModule(moduleId))
  }

  return {
    canAccessModule,
    canPerformAction,
    canManageUser,
    getAccessibleModules,
    hasPermission,
    hasRole
  }
}