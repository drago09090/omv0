"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Warehouse, Package, Search, Plus, ArrowUpDown, BarChart3 } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"

interface WarehouseModuleProps {
  userRole: UserRole
}

const warehouses = [
  {
    id: 1,
    name: "Almacén Central",
    location: "Ciudad de México",
    manager: "Carlos López",
    totalSims: 2500,
    available: 1200,
    assigned: 1100,
    reserved: 200,
    status: "Activo"
  },
  {
    id: 2,
    name: "Almacén Norte",
    location: "Monterrey",
    manager: "María García",
    totalSims: 1800,
    available: 800,
    assigned: 900,
    reserved: 100,
    status: "Activo"
  },
  {
    id: 3,
    name: "Almacén Sur",
    location: "Guadalajara",
    manager: "Juan Pérez",
    totalSims: 1500,
    available: 600,
    assigned: 800,
    reserved: 100,
    status: "Activo"
  }
]

const movements = [
  {
    id: "MOV001",
    type: "Entrada",
    warehouse: "Almacén Central",
    quantity: 500,
    operator: "Carlos López",
    date: "2024-01-15 10:30",
    description: "Recepción de nuevo lote"
  },
  {
    id: "MOV002",
    type: "Transferencia",
    warehouse: "Almacén Norte",
    quantity: 200,
    operator: "María García",
    date: "2024-01-15 09:15",
    description: "Transferencia desde Central"
  },
  {
    id: "MOV003",
    type: "Asignación",
    warehouse: "Almacén Sur",
    quantity: 50,
    operator: "Juan Pérez",
    date: "2024-01-14 16:45",
    description: "Asignación a operador"
  }
]

export function WarehouseModule({ userRole }: WarehouseModuleProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("all")
  const { canPerformAction } = usePermissions()

  const canManage = canPerformAction('warehouse.write')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Warehouse className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Almacén</h1>
            <p className="text-gray-600">Control de inventario y movimientos</p>
          </div>
        </div>
        {canManage && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Transferir SIMs
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SIMs</p>
                <p className="text-2xl font-bold text-blue-600">5,800</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">2,600</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asignadas</p>
                <p className="text-2xl font-bold text-orange-600">2,800</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservadas</p>
                <p className="text-2xl font-bold text-purple-600">400</p>
              </div>
              <Warehouse className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warehouses">Almacenes</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Almacenes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Almacén</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Disponibles</TableHead>
                    <TableHead>Asignadas</TableHead>
                    <TableHead>Reservadas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell>{warehouse.location}</TableCell>
                      <TableCell>{warehouse.manager}</TableCell>
                      <TableCell className="font-semibold">{warehouse.totalSims}</TableCell>
                      <TableCell className="text-green-600">{warehouse.available}</TableCell>
                      <TableCell className="text-orange-600">{warehouse.assigned}</TableCell>
                      <TableCell className="text-purple-600">{warehouse.reserved}</TableCell>
                      <TableCell>
                        <Badge variant="default">{warehouse.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar movimientos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Almacén" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los almacenes</SelectItem>
                    <SelectItem value="central">Almacén Central</SelectItem>
                    <SelectItem value="norte">Almacén Norte</SelectItem>
                    <SelectItem value="sur">Almacén Sur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Almacén</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.id}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            movement.type === "Entrada" ? "default" :
                            movement.type === "Transferencia" ? "secondary" : "outline"
                          }
                        >
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.warehouse}</TableCell>
                      <TableCell className="font-semibold">{movement.quantity}</TableCell>
                      <TableCell>{movement.operator}</TableCell>
                      <TableCell className="text-sm text-gray-600">{movement.date}</TableCell>
                      <TableCell>{movement.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Reportes de inventario y análisis de stock</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
