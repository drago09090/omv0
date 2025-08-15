"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RedisStatus } from "@/components/redis/redis-status"
import { DatabaseStatus } from "@/components/database/database-status"
import { Settings, Globe, Bell, Shield, Database, Webhook, Key, Server } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"

interface SettingsModuleProps {
  userRole: UserRole
}

const webhookEndpoints = [
  {
    id: 1,
    name: "Activación de SIM",
    url: "https://api.partner.com/webhooks/activation",
    status: "Activo",
    lastCall: "2024-01-15 14:30",
    success: "98.5%"
  },
  {
    id: 2,
    name: "Recarga de Saldo",
    url: "https://api.partner.com/webhooks/recharge",
    status: "Activo",
    lastCall: "2024-01-15 14:25",
    success: "99.2%"
  },
  {
    id: 3,
    name: "Suspensión de Línea",
    url: "https://api.partner.com/webhooks/suspend",
    status: "Inactivo",
    lastCall: "2024-01-14 10:15",
    success: "97.8%"
  }
]

const apiKeys = [
  {
    id: 1,
    name: "API Principal",
    key: "sk_live_****************************",
    created: "2024-01-01",
    lastUsed: "2024-01-15 14:30",
    status: "Activa"
  },
  {
    id: 2,
    name: "API Desarrollo",
    key: "sk_test_****************************",
    created: "2024-01-01",
    lastUsed: "2024-01-14 16:20",
    status: "Activa"
  }
]

export function SettingsModule({ userRole }: SettingsModuleProps) {
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const { canPerformAction } = usePermissions()

  const canManageSettings = canPerformAction('settings.write')

  if (!canManageSettings) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la configuración del sistema.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
            <p className="text-gray-600">Administrar configuraciones globales y parámetros</p>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
          <TabsTrigger value="redis">Redis Cache</TabsTrigger>
          <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Configuración General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input id="companyName" defaultValue="OMV Telecom" />
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select defaultValue="america/mexico_city">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/mexico_city">América/Ciudad de México</SelectItem>
                      <SelectItem value="america/new_york">América/Nueva York</SelectItem>
                      <SelectItem value="europe/madrid">Europa/Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select defaultValue="mxn">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mxn">Peso Mexicano (MXN)</SelectItem>
                      <SelectItem value="usd">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="supportEmail">Email de Soporte</Label>
                <Input id="supportEmail" type="email" defaultValue="soporte@omv.com" />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Configuración de Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Activación</Label>
                    <p className="text-sm text-gray-600">Recibir notificaciones cuando se active una nueva línea</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Stock Bajo</Label>
                    <p className="text-sm text-gray-600">Notificar cuando el stock de SIMs esté por debajo del límite</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reportes de Webhook Fallidos</Label>
                    <p className="text-sm text-gray-600">Alertar sobre fallos en webhooks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Balance</Label>
                    <p className="text-sm text-gray-600">Alertar sobre cambios importantes en el balance</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="stockThreshold">Límite de Stock Bajo</Label>
                  <Input id="stockThreshold" type="number" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="balanceThreshold">Límite de Balance Bajo</Label>
                  <Input id="balanceThreshold" type="number" defaultValue="1000" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Guardar Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Webhook className="h-5 w-5" />
                  <span>Configuración de Webhooks</span>
                </div>
                <Button 
                  onClick={() => setIsWebhookModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Agregar Webhook
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Llamada</TableHead>
                    <TableHead>Éxito</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEndpoints.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                      <TableCell>
                        <Badge variant={webhook.status === "Activo" ? "default" : "secondary"}>
                          {webhook.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{webhook.lastCall}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{webhook.success}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm">Probar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Gestión de API Keys</span>
                </div>
                <Button 
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Generar Nueva Key
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-sm">{key.key}</TableCell>
                      <TableCell>{key.created}</TableCell>
                      <TableCell>{key.lastUsed}</TableCell>
                      <TableCell>
                        <Badge variant="default">{key.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Regenerar</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Revocar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configuración de Base de Datos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dbHost">Host</Label>
                  <Input id="dbHost" defaultValue="localhost" />
                </div>
                <div>
                  <Label htmlFor="dbPort">Puerto</Label>
                  <Input id="dbPort" defaultValue="5432" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dbName">Nombre de la Base de Datos</Label>
                  <Input id="dbName" defaultValue="omv_database" />
                </div>
                <div>
                  <Label htmlFor="dbUser">Usuario</Label>
                  <Input id="dbUser" defaultValue="omv_user" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-gray-600">Realizar backup diario de la base de datos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Logs de Consultas</Label>
                    <p className="text-sm text-gray-600">Registrar todas las consultas SQL</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Probar Conexión
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redis" className="space-y-4">
          <RedisStatus />
        </TabsContent>

        <TabsContent value="mongodb" className="space-y-4">
          <DatabaseStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
