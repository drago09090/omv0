"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DemoLogin } from "@/components/auth/demo-login"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SuperadminDashboard } from "@/components/dashboards/superadmin-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { OperatorDashboard } from "@/components/dashboards/operator-dashboard"
import { UserManagement } from "@/components/modules/user-management"
import { SimManagement } from "@/components/modules/sim-management"
import { CustomerManagement } from "@/components/modules/customer-management"
import { TicketSystem } from "@/components/modules/ticket-system"
import { BalanceSystem } from "@/components/modules/balance-system"
import { Reports } from "@/components/modules/reports"
import { ActivationsModule } from "@/components/modules/activations-module"
import { PlansOffersModule } from "@/components/modules/plans-offers-module"
import { BillingModule } from "@/components/modules/billing-module"
import { WarehouseModule } from "@/components/modules/warehouse-module"
import { SettingsModule } from "@/components/modules/settings-module"
import { WebhookLogsModule } from "@/components/modules/webhook-logs-module"

export type ActiveView = 
  | "dashboard" 
  | "activations" 
  | "recharges" 
  | "plans-offers"
  | "customers" 
  | "lines"
  | "sims" 
  | "warehouse"
  | "balance" 
  | "billing"
  | "transactions"
  | "tickets" 
  | "reports"
  | "users" 
  | "settings"
  | "webhook-logs"

export type { UserRole } from "@/contexts/auth-context"
export function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">⚡</span>
          </div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    return <DemoLogin />
  }

  const userRole = user.role
  const handleNavigation = (view: string) => {
    setActiveView(view as ActiveView)
  }

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        switch (userRole) {
          case "superadmin":
            return <SuperadminDashboard />
          case "admin":
          case "gerente":
            return <AdminDashboard role={userRole} />
          case "operator":
          case "subdistributor":
          case "vendor":
            return <OperatorDashboard role={userRole} />
          default:
            return <SuperadminDashboard />
        }
      case "activations":
      case "recharges":
        return <ActivationsModule type={activeView} userRole={userRole} />
      case "plans-offers":
        return <PlansOffersModule userRole={userRole} />
      case "customers":
        return <CustomerManagement userRole={userRole} />
      case "lines":
        return <CustomerManagement userRole={userRole} activeTab="lines" />
      case "sims":
        return <SimManagement userRole={userRole} />
      case "warehouse":
        return <WarehouseModule userRole={userRole} />
      case "balance":
        return <BalanceSystem userRole={userRole} />
      case "billing":
      case "transactions":
        return <BillingModule type={activeView} userRole={userRole} />
      case "tickets":
        return <TicketSystem userRole={userRole} />
      case "reports":
        return <Reports userRole={userRole} />
      case "users":
        return <UserManagement userRole={userRole} />
      case "settings":
        return <SettingsModule userRole={userRole} />
      case "webhook-logs":
        return <WebhookLogsModule userRole={userRole} />
      default:
        return <SuperadminDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          userRole={userRole} 
          user={user}
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed}
          onNavigate={handleNavigation}
        />
        <main className="flex-1 overflow-auto bg-gray-50">{renderMainContent()}</main>
      </div>
    </div>
  )
}
