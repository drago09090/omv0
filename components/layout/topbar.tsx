"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, LogOut, User, Settings, HelpCircle, Search, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/contexts/auth-context"

interface TopbarProps {
  userRole: UserRole
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  onNavigate?: (view: string) => void
}

const roleLabels = {
  superadmin: "Super Administrador",
  admin: "Administrador",
  gerente: "Gerente",
  operator: "Operador",
  subdistributor: "Subdistribuidor",
  vendor: "Vendedor",
}

const roleColors = {
  superadmin: "bg-red-100 text-red-800 border-red-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  gerente: "bg-green-100 text-green-800 border-green-200",
  operator: "bg-yellow-100 text-yellow-800 border-yellow-200",
  subdistributor: "bg-purple-100 text-purple-800 border-purple-200",
  vendor: "bg-gray-100 text-gray-800 border-gray-200",
}


export function Topbar({ userRole, sidebarCollapsed, setSidebarCollapsed, onNavigate }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const { toast } = useToast()

  // Mock notifications for client-side
  const notifications = [
    { id: '1', title: 'Nueva activación', message: 'SIM activada exitosamente', type: 'success', read: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Recarga completada', message: 'Recarga de $20 procesada', type: 'info', read: true, createdAt: new Date().toISOString() }
  ]
  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = async (id: string) => {
    toast({ title: "Notificación marcada", description: "Notificación marcada como leída" })
  }
  const markAllAsRead = async () => {
    toast({ title: "Notificaciones marcadas", description: "Todas las notificaciones han sido marcadas como leídas" })
  }

  const handleMarkAllAsRead = markAllAsRead

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    toast({
      title: "Cerrando sesión",
      description: "Cerrando sesión de forma segura..."
    })
    
    try {
      await logout()
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente"
      })
      
      // In a real app, redirect to login page
      // window.location.href = '/login'
      
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: "Ocurrió un error, pero la sesión local ha sido limpiada",
        variant: "destructive"
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileSettings = () => {
    if (onNavigate) {
      onNavigate('settings')
    }
    toast({
      title: "Configuración",
      description: "Navegando a configuración del perfil"
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar clientes, SIMs, transacciones..."
                  className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      toast({
                        title: "Búsqueda",
                        description: `Buscando: ${e.currentTarget.value}`
                      })
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Balance</p>
                <p className="font-semibold text-green-600">$2,450</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">SIMs</p>
                <p className="font-semibold text-blue-600">156</p>
              </div>
            </div>

            {/* Help */}
            <Button 
              variant="ghost" 
              size="sm" 
              title="Ayuda"
              onClick={() => setHelpOpen(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              title="Notificaciones"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || "Usuario"}</p>
                <Badge className={cn("text-xs", roleColors[userRole])}>
                  {roleLabels[userRole]}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">JP</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "Usuario"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || "usuario@omv.com"}</p>
                      <Badge className={cn("text-xs w-fit mt-1", roleColors[userRole])}>
                        {roleLabels[userRole]}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleProfileSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Ayuda</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={handleLogout}
                    disabled={isLoggingOut || isLoading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Notificaciones
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  Marcar todas como leídas
                </Button>
              )}
            </SheetTitle>
            <SheetDescription>
              Tienes {unreadCount} notificaciones sin leer
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  notification.read 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-blue-50 border-blue-200"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Centro de Ayuda</DialogTitle>
            <DialogDescription>
              Encuentra respuestas a las preguntas más frecuentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🚀 Primeros Pasos</h3>
                <p className="text-sm text-gray-600">Aprende a usar el sistema BSS/CRM</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📱 Gestión de SIMs</h3>
                <p className="text-sm text-gray-600">Activar, suspender y gestionar SIMs</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">💰 Sistema de Balance</h3>
                <p className="text-sm text-gray-600">Recargas y gestión de saldo</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📊 Reportes</h3>
                <p className="text-sm text-gray-600">Generar y exportar reportes</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Contacto de Soporte</h3>
              <p className="text-sm text-gray-600">
                📧 soporte@omv.com<br/>
                📞 +52 55 1234 5678<br/>
                💬 Chat en vivo disponible 24/7
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
            <DialogDescription>
              Información de tu cuenta y configuración personal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user?.name || "Usuario"}</h3>
                <p className="text-gray-600">{user?.email || "usuario@omv.com"}</p>
                <Badge className={cn("text-xs mt-1", roleColors[userRole])}>
                  {roleLabels[userRole]}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Último acceso</p>
                <p className="font-medium">Hoy, 14:30</p>
              </div>
              <div>
                <p className="text-gray-500">Sesiones activas</p>
                <p className="font-medium">2 dispositivos</p>
              </div>
              <div>
                <p className="text-gray-500">Tickets creados</p>
                <p className="font-medium">23</p>
              </div>
              <div>
                <p className="text-gray-500">Activaciones</p>
                <p className="font-medium">156</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleProfileSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
              <Button variant="outline" onClick={() => setProfileOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}