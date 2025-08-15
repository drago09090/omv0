"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth, demoUsers } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Crown, Shield, Users, User, Building, ShoppingCart, LogIn, Loader2 } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"

const roleIcons: Record<UserRole, any> = {
  superadmin: Crown,
  admin: Shield,
  gerente: Users,
  operator: User,
  subdistributor: Building,
  vendor: ShoppingCart
}

const roleColors: Record<UserRole, string> = {
  superadmin: "from-red-500 to-red-600",
  admin: "from-blue-500 to-blue-600",
  gerente: "from-green-500 to-green-600",
  operator: "from-yellow-500 to-yellow-600",
  subdistributor: "from-purple-500 to-purple-600",
  vendor: "from-gray-500 to-gray-600"
}

const roleDescriptions: Record<UserRole, string> = {
  superadmin: "Acceso completo al sistema, gestión de usuarios y configuración global",
  admin: "Gestión de operaciones, usuarios y reportes avanzados",
  gerente: "Supervisión de equipos, reportes y gestión de clientes",
  operator: "Activaciones, recargas y atención al cliente",
  subdistributor: "Ventas y gestión de clientes asignados",
  vendor: "Ventas básicas y activaciones de líneas"
}

const roleLabels: Record<UserRole, string> = {
  superadmin: "Super Administrador",
  admin: "Administrador",
  gerente: "Gerente",
  operator: "Operador",
  subdistributor: "Subdistribuidor",
  vendor: "Vendedor"
}

export function DemoLogin() {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null)
  const { loginAsDemo, isLoading } = useAuth()
  const { toast } = useToast()

  const handleDemoLogin = async (role: UserRole) => {
    setLoadingRole(role)
    
    try {
      const success = await loginAsDemo(role)
      
      if (success) {
        const user = demoUsers[role]
        toast({
          title: "¡Bienvenido!",
          description: `Sesión iniciada como ${user.name} (${roleLabels[role]})`
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo iniciar la sesión demo",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
        variant: "destructive"
      })
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OMV Dashboard</h1>
          <p className="text-xl text-gray-600 mb-2">Sistema BSS/CRM Profesional</p>
          <p className="text-gray-500">Selecciona un rol para acceder al sistema con permisos específicos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(demoUsers) as UserRole[]).map((role) => {
            const user = demoUsers[role]
            const Icon = roleIcons[role]
            const isCurrentlyLoading = loadingRole === role
            
            return (
              <Card key={role} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{roleLabels[role]}</CardTitle>
                      <p className="text-sm text-gray-600">{user.name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{roleDescriptions[role]}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{user.department}</span>
                      {user.supervisor && (
                        <>
                          <span>•</span>
                          <span>Supervisor: {user.supervisor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Permisos principales:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission.split('.')[0]}
                        </Badge>
                      ))}
                      {user.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleDemoLogin(role)}
                    disabled={isLoading || isCurrentlyLoading}
                    className={`w-full bg-gradient-to-r ${roleColors[role]} hover:shadow-lg transition-all duration-300`}
                    size="lg"
                  >
                    {isCurrentlyLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Acceder como {roleLabels[role]}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sistema en línea</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Versión 1.0.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Entorno: Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}