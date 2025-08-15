"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"

interface PlansOffersModuleProps {
  userRole: UserRole
}

const plans = [
  {
    id: 1,
    name: "Plan Básico 500MB",
    type: "Principal",
    data: "500MB",
    minutes: "100 min",
    sms: "50 SMS",
    validity: "30 días",
    baseCost: "$20.00",
    retailPrice: "$25.00",
    status: "Activo"
  },
  {
    id: 2,
    name: "Plan Premium 2GB",
    type: "Principal",
    data: "2GB",
    minutes: "300 min",
    sms: "150 SMS",
    validity: "30 días",
    baseCost: "$28.00",
    retailPrice: "$35.00",
    status: "Activo"
  },
  {
    id: 3,
    name: "Plan Empresarial 5GB",
    type: "Principal",
    data: "5GB",
    minutes: "500 min",
    sms: "200 SMS",
    validity: "30 días",
    baseCost: "$40.00",
    retailPrice: "$50.00",
    status: "Activo"
  }
]

const offers = [
  {
    id: 1,
    name: "Recarga $10",
    type: "Complementaria",
    linkedPlan: "Plan Básico 500MB",
    price: "$10.00",
    validity: "7 días",
    status: "Activo"
  },
  {
    id: 2,
    name: "Recarga $20",
    type: "Complementaria",
    linkedPlan: "Plan Premium 2GB",
    price: "$20.00",
    validity: "15 días",
    status: "Activo"
  }
]

export function PlansOffersModule({ userRole }: PlansOffersModuleProps) {
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false)
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { canPerformAction } = usePermissions()

  const canManage = canPerformAction('plans.write')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planes y Ofertas</h1>
            <p className="text-gray-600">Gestionar planes principales y ofertas complementarias</p>
          </div>
        </div>
        {canManage && (
          <div className="flex space-x-2">
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span>Crear Nuevo Plan</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="planName" className="text-base font-semibold">Nombre del Plan</Label>
                      <Input id="planName" placeholder="Plan Premium 3GB" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planType" className="text-base font-semibold">Tipo</Label>
                      <Select>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="complementario">Complementario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data" className="text-base font-semibold">Datos</Label>
                      <Input id="data" placeholder="3GB" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minutes" className="text-base font-semibold">Minutos</Label>
                      <Input id="minutes" placeholder="400 min" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms" className="text-base font-semibold">SMS</Label>
                      <Input id="sms" placeholder="100 SMS" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validity" className="text-base font-semibold">Validez</Label>
                      <Input id="validity" placeholder="30 días" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseCost" className="text-base font-semibold">Costo Base</Label>
                      <Input id="baseCost" placeholder="$30.00" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retailPrice" className="text-base font-semibold">Precio Venta</Label>
                      <Input id="retailPrice" placeholder="$40.00" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> Asegúrate de que el precio de venta sea mayor al costo base para mantener rentabilidad.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)} size="lg">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => setIsCreatePlanOpen(false)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Package className="mr-2 h-5 w-5" />
                      Crear Plan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateOfferOpen} onOpenChange={setIsCreateOfferOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Oferta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span>Crear Nueva Oferta</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="offerName" className="text-base font-semibold">Nombre de la Oferta</Label>
                      <Input id="offerName" placeholder="Recarga $30" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerType" className="text-base font-semibold">Tipo</Label>
                      <Select>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complementaria">Complementaria</SelectItem>
                          <SelectItem value="promocional">Promocional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="linkedPlan" className="text-base font-semibold">Plan Vinculado</Label>
                      <Select>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Plan Básico 500MB</SelectItem>
                          <SelectItem value="premium">Plan Premium 2GB</SelectItem>
                          <SelectItem value="enterprise">Plan Empresarial 5GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerPrice" className="text-base font-semibold">Precio</Label>
                      <Input id="offerPrice" placeholder="$30.00" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="offerValidity" className="text-base font-semibold">Validez</Label>
                    <Input id="offerValidity" placeholder="15 días" className="h-12" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700">
                      🎯 <strong>Sugerencia:</strong> Las ofertas complementarias ayudan a aumentar el valor promedio por cliente.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateOfferOpen(false)} size="lg">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => setIsCreateOfferOpen(false)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Crear Oferta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar planes y ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Planes Principales</TabsTrigger>
          <TabsTrigger value="offers">Ofertas Complementarias</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planes Principales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Datos</TableHead>
                    <TableHead>Minutos</TableHead>
                    <TableHead>SMS</TableHead>
                    <TableHead>Validez</TableHead>
                    <TableHead>Costo Base</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Estado</TableHead>
                    {canManage && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.data}</TableCell>
                      <TableCell>{plan.minutes}</TableCell>
                      <TableCell>{plan.sms}</TableCell>
                      <TableCell>{plan.validity}</TableCell>
                      <TableCell>{plan.baseCost}</TableCell>
                      <TableCell className="font-semibold text-green-600">{plan.retailPrice}</TableCell>
                      <TableCell>
                        <Badge variant="default">{plan.status}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas Complementarias</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plan Vinculado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Validez</TableHead>
                    <TableHead>Estado</TableHead>
                    {canManage && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{offer.type}</Badge>
                      </TableCell>
                      <TableCell>{offer.linkedPlan}</TableCell>
                      <TableCell className="font-semibold text-blue-600">{offer.price}</TableCell>
                      <TableCell>{offer.validity}</TableCell>
                      <TableCell>
                        <Badge variant="default">{offer.status}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
