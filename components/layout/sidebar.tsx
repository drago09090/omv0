"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { LayoutDashboard, Users, CreditCard, UserCheck, Ticket, Wallet, BarChart3, Settings, ChevronLeft, ChevronRight, Zap, RefreshCw, Package, Phone, Warehouse, Receipt, DollarSign, FileText, Building2, Webhook } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import type { ActiveView } from "@/components/dashboard"

interface SidebarProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  userRole: UserRole
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

interface MenuSection {
  title: string
  items: {
    id: ActiveView
    label: string
    icon: any
    roles: UserRole[]
  }[]
}

const menuSections: MenuSection[] = [
  {
    title: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
    ]
  },
  {
    title: "Ventas y Operaciones",
    items: [
      { id: "activations", label: "Activaciones", icon: Zap, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
      { id: "recharges", label: "Recargas", icon: RefreshCw, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
      { id: "plans-offers", label: "Planes y Ofertas", icon: Package, roles: ["superadmin", "admin", "gerente"] },
    ]
  },
  {
    title: "Gestión de Clientes",
    items: [
      { id: "customers", label: "Clientes", icon: UserCheck, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
      { id: "lines", label: "Líneas", icon: Phone, roles: ["superadmin", "admin", "gerente", "operator"] },
    ]
  },
  {
    title: "Inventario",
    items: [
      { id: "sims", label: "SIMs", icon: CreditCard, roles: ["superadmin", "admin", "gerente", "operator"] },
      { id: "warehouse", label: "Almacén", icon: Warehouse, roles: ["superadmin", "admin", "gerente"] },
    ]
  },
  {
    title: "Financiero",
    items: [
      { id: "balance", label: "Balance", icon: Wallet, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
      { id: "billing", label: "Facturación", icon: Receipt, roles: ["superadmin", "admin", "gerente"] },
      { id: "transactions", label: "Transacciones", icon: DollarSign, roles: ["superadmin", "admin", "gerente"] },
    ]
  },
  {
    title: "Soporte y Reportes",
    items: [
      { id: "tickets", label: "Tickets", icon: Ticket, roles: ["superadmin", "admin", "gerente", "operator", "subdistributor", "vendor"] },
      { id: "reports", label: "Reportes", icon: BarChart3, roles: ["superadmin", "admin", "gerente"] },
      { id: "webhook-logs", label: "Webhook Logs", icon: Webhook, roles: ["superadmin", "admin"] },
    ]
  },
  {
    title: "Administración",
    items: [
      { id: "users", label: "Usuarios", icon: Users, roles: ["superadmin", "admin", "gerente"] },
      { id: "settings", label: "Configuración", icon: Settings, roles: ["superadmin", "admin"] },
    ]
  },
]

export function Sidebar({ activeView, setActiveView, userRole, collapsed, setCollapsed }: SidebarProps) {
  const { canAccessModule, canPerformAction } = usePermissions()
  const { user } = useAuth()
  
  const hasAccessToItem = (itemRoles: UserRole[], moduleId?: string) => {
    // Check role-based access
    const hasRoleAccess = itemRoles.includes(userRole)
    
    // Check permission-based access if module is specified
    const hasModuleAccess = moduleId ? canAccessModule(moduleId) : true
    
    return hasRoleAccess && hasModuleAccess
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">OMV Dashboard</h1>
                <p className="text-xs text-gray-500">{user?.department || "Sistema BSS/CRM"}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-1 h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-6">
          {menuSections.map((section, sectionIndex) => {
            const visibleItems = section.items.filter(item => hasAccessToItem(item.roles, item.id))
            
            if (visibleItems.length === 0) return null

            return (
              <div key={sectionIndex}>
                {!collapsed && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeView === item.id
                    
                    return (
                      <li key={item.id}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-10 font-medium transition-all",
                            collapsed ? "px-2" : "px-3",
                            isActive 
                              ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" 
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          )}
                          onClick={() => setActiveView(item.id)}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                          {!collapsed && <span>{item.label}</span>}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
                {!collapsed && sectionIndex < menuSections.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        {!collapsed && (
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">© 2024 OMV System</p>
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
            {user && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.department}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
