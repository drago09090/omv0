"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Eye, Phone, Mail, User, Edit, Trash2, PhoneCall, UserCheck } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { useApi } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

const customerLines = [
  {
    id: 1,
    customerId: 1,
    msisdn: "+52 55 1234 5678",
    plan: "Plan Básico 500MB",
    status: "Activa",
    validity: "2024-02-15",
    sim: "8934071234567890123",
    balance: "$15.50",
    dataUsed: "250MB / 500MB"
  },
  {
    id: 2,
    customerId: 1,
    msisdn: "+52 55 1234 5679",
    plan: "Plan Premium 2GB",
    status: "Activa",
    validity: "2024-02-20",
    sim: "8934071234567890124",
    balance: "$25.00",
    dataUsed: "1.2GB / 2GB"
  },
]

const customerTransactions = [
  {
    id: "TXN001",
    type: "Activación",
    amount: "$25.00",
    date: "2024-01-15 14:30",
    status: "Completado",
    description: "Activación Plan Básico"
  },
  {
    id: "TXN002",
    type: "Recarga",
    amount: "$20.00",
    date: "2024-01-14 10:15",
    status: "Completado",
    description: "Recarga de saldo"
  }
]

interface CustomerManagementProps {
  userRole: UserRole
  activeTab?: string
}

export function CustomerManagement({ userRole, activeTab = "customers" }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [isNewLineModalOpen, setIsNewLineModalOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })
  
  const api = useApi()
  const { canPerformAction } = usePermissions()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await api.customers.getAll()
      if (response.success) {
        setCustomers(response.data || [])
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Load customers error:', error)
      toast({
        title: "Error",
        description: "Error al conectar con la base de datos",
        variant: "destructive"
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const canCreateCustomer = canPerformAction('customers.write')
  const canEditCustomer = canPerformAction('customers.write')

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await api.customers.create(newCustomer)
      
      if (response.success) {
        await loadCustomers()
        setIsCreateModalOpen(false)
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: ""
        })
        
        toast({
          title: "Cliente Creado",
          description: `Cliente ${newCustomer.name} creado exitosamente`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo crear el cliente",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Create customer error:', error)
      toast({
        title: "Error",
        description: "Error al crear el cliente",
        variant: "destructive"
      })
    }
  }

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return

    try {
      const response = await api.customers.update(editingCustomer._id, editingCustomer)
      
      if (response.success) {
        await loadCustomers()
        setIsEditModalOpen(false)
        setEditingCustomer(null)
        
        toast({
          title: "Cliente Actualizado",
          description: "Cliente actualizado exitosamente"
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo actualizar el cliente",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Update customer error:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el cliente",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCustomer = (customerId: number) => {
    if (confirm("¿Está seguro de que desea eliminar este cliente?")) {
      // Handle delete logic here
      console.log("Deleting customer:", customerId)
    }
  }

  if (activeTab === "lines") {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PhoneCall className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Líneas</h1>
              <p className="text-gray-600">Administrar líneas telefónicas activas</p>
            </div>
          </div>
          <Dialog open={isNewLineModalOpen} onOpenChange={setIsNewLineModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Línea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <PhoneCall className="h-5 w-5 text-white" />
                  </div>
                  <span>Nueva Línea Telefónica</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newLineMsisdn" className="text-base font-semibold">MSISDN</Label>
                    <Input id="newLineMsisdn" placeholder="+52 55 1234 5678" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newLineCustomer" className="text-base font-semibold">Cliente</Label>
                    <Input id="newLineCustomer" placeholder="Seleccionar cliente" className="h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newLinePlan" className="text-base font-semibold">Plan</Label>
                    <Input id="newLinePlan" placeholder="Seleccionar plan" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newLineSim" className="text-base font-semibold">SIM Card</Label>
                    <Input id="newLineSim" placeholder="8934071234567890123" className="h-12" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    📱 <strong>Información:</strong> La nueva línea será activada inmediatamente después de la creación.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsNewLineModalOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setIsNewLineModalOpen(false)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <PhoneCall className="mr-2 h-5 w-5" />
                    Crear Línea
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">2,156</p>
                <p className="text-sm text-gray-600">Líneas Activas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">89</p>
                <p className="text-sm text-gray-600">Nuevas Hoy</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">45</p>
                <p className="text-sm text-gray-600">Suspendidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">$45,230</p>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Líneas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MSISDN</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Uso de Datos</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.msisdn}</TableCell>
                    <TableCell>
                      {customers.find(c => c.id === line.customerId)?.name || "N/A"}
                    </TableCell>
                    <TableCell>{line.plan}</TableCell>
                    <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                      <Badge variant={line.status === "Activa" ? "default" : "destructive"}>
                      <Badge variant="outline">{customer.lines || 0}</Badge>
                      </Badge>
                    <TableCell className="font-semibold text-green-600">
                      ${(customer.totalSpent || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">{line.balance}</TableCell>
                      <Badge variant={customer.status === "active" ? "default" : "destructive"}>
                        {customer.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    <TableCell>{line.validity}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer._id)} title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEditCustomer && (
                          <Button variant="ghost" size="sm" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-gray-600">Administrar clientes y sus líneas telefónicas</p>
          </div>
        </div>
        {canCreateCustomer && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <span>Crear Nuevo Cliente</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-base font-semibold">Nombre Completo</Label>
                    <Input id="customerName" placeholder="Ingrese el nombre completo" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-base font-semibold">Email</Label>
                    <Input id="customerEmail" type="email" placeholder="cliente@email.com" className="h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-base font-semibold">Teléfono</Label>
                    <Input id="customerPhone" placeholder="+52 55 1234 5678" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress" className="text-base font-semibold">Dirección</Label>
                    <Input id="customerAddress" placeholder="Dirección completa" className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerNotes" className="text-base font-semibold">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="customerNotes"
                    placeholder="Información adicional sobre el cliente..."
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    👤 <strong>Información:</strong> Todos los campos marcados son obligatorios para crear el cliente.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setIsCreateModalOpen(false)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <UserCheck className="mr-2 h-5 w-5" />
                    Crear Cliente
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-gray-600">Total Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">1,156</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">45</p>
              <p className="text-sm text-gray-600">Nuevos Hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">46</p>
              <p className="text-sm text-gray-600">Suspendidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Líneas</TableHead>
                <TableHead>Gasto Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.createdBy}</TableCell>
                  <TableCell>{customer.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.lines}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">{customer.totalSpent}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "Activo" ? "default" : "destructive"}>{customer.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer.id)} title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEditCustomer && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCustomer(customer._id)} 
                            className="text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalle del Cliente</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="lines">Líneas</TabsTrigger>
                <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Juan Pérez González</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>juan.perez@email.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>+52 55 1234 5678</span>
                  </div>
                  <div>
                    <span className="font-medium">Estado: </span> 
                    <Badge>Activo</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Gasto Total: </span> 
                    <span className="text-green-600 font-semibold">$450.00</span>
                  </div>
                  <div>
                    <span className="font-medium">Última Actividad: </span> 
                    <span className="text-gray-600">2024-01-15 14:30</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lines">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MSISDN</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Validez</TableHead>
                      <TableHead>SIM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerLines.filter(line => line.customerId === selectedCustomer).map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.msisdn}</TableCell>
                        <TableCell>{line.plan}</TableCell>
                        <TableCell>
                          <Badge variant="default">{line.status}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">{line.balance}</TableCell>
                        <TableCell>{line.validity}</TableCell>
                        <TableCell className="font-mono text-sm">{line.sim}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="transactions">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{transaction.amount}</TableCell>
                        <TableCell>
                          <Badge variant="default">{transaction.status}</Badge>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="tickets">
                <div className="text-center py-8">
                  <p className="text-gray-600">No hay tickets asociados a este cliente</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <span>Editar Cliente</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="editName" className="text-base font-semibold">Nombre Completo</Label>
                  <Input 
                    id="editName" 
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="h-12" 
                  />
                    id="customerName" 
                    placeholder="Ingrese el nombre completo" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="h-12" 
                  <Input 
                    id="customerPhone" 
                    placeholder="+52 55 1234 5678" 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail" className="text-base font-semibold">Email</Label>
                  <Input 
                    id="editEmail" 
                    type="email" 
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="h-12" 
                  />
                    id="customerEmail" 
                    type="email" 
                    placeholder="cliente@email.com" 
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="h-12" 
                  <Input 
                    id="customerAddress" 
                    placeholder="Dirección completa" 
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="h-12" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone" className="text-base font-semibold">Teléfono</Label>
                <Input 
                  id="editPhone" 
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="h-12" 
                />
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  ⚠️ <strong>Atención:</strong> Los cambios se aplicarán inmediatamente después de guardar.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateCustomer}
                  disabled={api.loading}
                  disabled={api.loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit className="mr-2 h-5 w-5" />
                  {api.loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
