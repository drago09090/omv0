"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Server, Database, Globe, Shield, Plus, Edit, Trash2 } from 'lucide-react'
import type { UserRole } from "@/components/dashboard"

interface EnvironmentConfigModuleProps {
  userRole: UserRole
}

const environments = [
  {
    id: 1,
    name: "Producción",
    type: "production",
    status: "Activo",
    apiUrl: "https://api.omv.com/v1",
    dbHost: "prod-db.omv.com",
    lastUpdate: "2024-01-15 14:30"
  },
  {
    id: 2,
    name: "Desarrollo",
    type: "development",
    status: "Activo",
    apiUrl: "https://dev-api.omv.com/v1",
    dbHost: "dev-db.omv.com",
    lastUpdate: "2024-01-15 12:20"
  },
  {
    id: 3,
    name: "Testing",
    type: "testing",
    status: "Inactivo",
    apiUrl: "https://test-api.omv.com/v1",
    dbHost: "test-db.omv.com",
    lastUpdate: "2024-01-14 16:45"
  }
]

const configVariables = [
  {
    id: 1,
    key: "MAX_SIMS_PER_USER",
    value: "10",
    type: "number",
    description: "Máximo número de SIMs por usuario",
    environment: "production"
  },
  {
    id: 2,
    key: "SESSION_TIMEOUT",
    value: "3600",
    type: "number",
    description: "Tiempo de sesión en segundos",
    environment: "production"
  },
  {
    id: 3,
    key: "ENABLE_2FA",
    value: "true",
    type: "boolean",
    description: "Habilitar autenticación de dos factores",
    environment: "production"
  },
  {
    id: 4,
    key: "WEBHOOK_RETRY_ATTEMPTS",
    value: "3",
    type: "number",
    description: "Número de reintentos para webhooks",
    environment: "production"
  }
]

export function EnvironmentConfigModule({ userRole }: EnvironmentConfigModuleProps) {
  const [selectedEnvironment, setSelectedEnvironment] = useState("production")
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false)
  const [isEditVariableOpen, setIsEditVariableOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<any>(null)

  const canManageConfig = ["superadmin", "admin"].includes(userRole)

  if (!canManageConfig) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la configuración de entornos.</p>
        </div>
      </div>
    )
  }

  const filteredVariables = configVariables.filter(v => v.environment === selectedEnvironment)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Server className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Entornos</h1>
            <p className="text-gray-600">Gestionar variables y configuraciones por entorno</p>
          </div>
        </div>
      </div>

      {/* Environment Tabs */}
      <Tabs defaultValue="variables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variables">Variables de Configuración</TabsTrigger>
          <TabsTrigger value="environments">Entornos</TabsTrigger>
          <TabsTrigger value="deployment">Despliegue</TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="space-y-4">
          {/* Environment Selector */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="environment">Entorno:</Label>
                  <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Producción</SelectItem>
                      <SelectItem value="development">Desarrollo</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isAddVariableOpen} onOpenChange={setIsAddVariableOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Variable
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Variable de Configuración</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="varKey">Clave</Label>
                        <Input id="varKey" placeholder="VARIABLE_NAME" />
                      </div>
                      <div>
                        <Label htmlFor="varValue">Valor</Label>
                        <Input id="varValue" placeholder="valor" />
                      </div>
                      <div>
                        <Label htmlFor="varType">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="varDescription">Descripción</Label>
                        <Input id="varDescription" placeholder="Descripción de la variable" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddVariableOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsAddVariableOpen(false)}>
                          Agregar Variable
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Variables Table */}
          <Card>
            <CardHeader>
              <CardTitle>Variables de {selectedEnvironment}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clave</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVariables.map((variable) => (
                    <TableRow key={variable.id}>
                      <TableCell className="font-mono font-medium">{variable.key}</TableCell>
                      <TableCell className="font-mono">{variable.value}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{variable.type}</Badge>
                      </TableCell>
                      <TableCell>{variable.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingVariable(variable)
                              setIsEditVariableOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Entornos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>API URL</TableHead>
                    <TableHead>Base de Datos</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environments.map((env) => (
                    <TableRow key={env.id}>
                      <TableCell className="font-medium">{env.name}</TableCell>
                      <TableCell>
                        <Badge variant={env.type === "production" ? "default" : "secondary"}>
                          {env.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={env.status === "Activo" ? "default" : "secondary"}>
                          {env.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{env.apiUrl}</TableCell>
                      <TableCell className="font-mono text-sm">{env.dbHost}</TableCell>
                      <TableCell>{env.lastUpdate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Database className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Despliegue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Producción</p>
                      <p className="text-lg font-bold text-green-600">v1.2.3</p>
                      <p className="text-xs text-gray-500">Desplegado: 2024-01-15</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Desarrollo</p>
                      <p className="text-lg font-bold text-blue-600">v1.3.0-beta</p>
                      <p className="text-xs text-gray-500">Desplegado: 2024-01-15</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Database className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Testing</p>
                      <p className="text-lg font-bold text-yellow-600">v1.2.4-rc</p>
                      <p className="text-xs text-gray-500">Desplegado: 2024-01-14</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  Desplegar a Testing
                </Button>
                <Button variant="outline">
                  Desplegar a Producción
                </Button>
                <Button>
                  Rollback
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Variable Modal */}
      {editingVariable && (
        <Dialog open={isEditVariableOpen} onOpenChange={setIsEditVariableOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Variable de Configuración</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editKey">Clave</Label>
                <Input id="editKey" defaultValue={editingVariable.key} disabled />
              </div>
              <div>
                <Label htmlFor="editValue">Valor</Label>
                <Input id="editValue" defaultValue={editingVariable.value} />
              </div>
              <div>
                <Label htmlFor="editType">Tipo</Label>
                <Select defaultValue={editingVariable.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDescription">Descripción</Label>
                <Input id="editDescription" defaultValue={editingVariable.description} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditVariableOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsEditVariableOpen(false)}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
