"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, AlertCircle, Clock, CheckCircle, MessageSquare, User } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import type { UserRole } from "@/components/dashboard"

const priorityColors = {
  Baja: "bg-green-100 text-green-800",
  Media: "bg-yellow-100 text-yellow-800",
  Alta: "bg-red-100 text-red-800",
  Crítica: "bg-purple-100 text-purple-800",
}

const statusColors = {
  Abierto: "bg-blue-100 text-blue-800",
  "En Progreso": "bg-yellow-100 text-yellow-800",
  Resuelto: "bg-green-100 text-green-800",
  Cerrado: "bg-gray-100 text-gray-800",
}

const statusIcons = {
  Abierto: AlertCircle,
  "En Progreso": Clock,
  Resuelto: CheckCircle,
  Cerrado: CheckCircle,
}

interface TicketSystemProps {
  userRole: UserRole
}

export function TicketSystem({ userRole }: TicketSystemProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [newTicket, setNewTicket] = useState({
    title: "",
    category: "",
    priority: "",
    customer: "",
    description: ""
  })
  const [newComment, setNewComment] = useState("")

  const api = useApi()

  useEffect(() => {
    loadTickets()
  }, [statusFilter, priorityFilter])

  const loadTickets = async () => {
    try {
      const filters: Record<string, string> = {}
      if (statusFilter !== "all") filters.status = statusFilter === "Abierto" ? "open" : statusFilter.toLowerCase()
      if (priorityFilter !== "all") filters.priority = priorityFilter.toLowerCase()
      
      const response = await api.tickets.getAll(filters)
      if (response.success) {
        setTickets(response.data || [])
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los tickets",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Load tickets error:', error)
      toast({
        title: "Error",
        description: "Error al conectar con la base de datos",
        variant: "destructive"
      })
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.customer && ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "Abierto" && ticket.status === "open") ||
      (statusFilter === "En Progreso" && ticket.status === "in_progress") ||
      (statusFilter === "Resuelto" && ticket.status === "resolved") ||
      (statusFilter === "Cerrado" && ticket.status === "closed")
    const matchesPriority = priorityFilter === "all" || 
      ticket.priority === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.category || !newTicket.priority || !newTicket.description) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const ticketData = {
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category.toLowerCase(),
        priority: newTicket.priority.toLowerCase(),
        customerId: newTicket.customer || undefined,
        assignedTo: newTicket.category === "Técnico" ? "Soporte Técnico" : "Ventas"
      }

      const response = await api.tickets.create(ticketData)
      
      if (response.success) {
        await loadTickets()
        setNewTicket({ title: "", category: "", priority: "", customer: "", description: "" })
        setIsCreateModalOpen(false)
        
        toast({
          title: "Ticket Creado",
          description: `Ticket creado exitosamente`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo crear el ticket",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Create ticket error:', error)
      toast({
        title: "Error",
        description: "Error al crear el ticket",
        variant: "destructive"
      })
    }
  }

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setIsViewModalOpen(true)
  }

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const statusMap = {
        "Abierto": "open",
        "En Progreso": "in_progress", 
        "Resuelto": "resolved",
        "Cerrado": "closed"
      }
      
      const response = await api.tickets.update(ticketId, { 
        status: statusMap[newStatus as keyof typeof statusMap] || newStatus.toLowerCase()
      })
      
      if (response.success) {
        await loadTickets()
        toast({
          title: "Estado Actualizado",
          description: `Ticket marcado como ${newStatus}`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo actualizar el ticket",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Update ticket error:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el ticket",
        variant: "destructive"
      })
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await api.tickets.addComment(selectedTicket._id, newComment)
      
      if (response.success) {
        // Update local state
        const updatedTicket = {
          ...selectedTicket,
          comments: [...(selectedTicket.comments || []), response.data]
        }
        setSelectedTicket(updatedTicket)
        setNewComment("")
        
        toast({
          title: "Comentario Agregado",
          description: "Comentario agregado exitosamente"
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo agregar el comentario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Add comment error:', error)
      toast({
        title: "Error",
        description: "Error al agregar el comentario",
        variant: "destructive"
      })
    }
  }

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, assignedTo: assignee } : t
    ))
    
    toast({
      title: "Ticket Asignado",
      description: `Ticket ${ticketId} asignado a ${assignee}`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Tickets</h1>
          <p className="text-gray-600">Gestionar tickets de soporte y consultas</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span>Crear Nuevo Ticket</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ticketTitle" className="text-base font-semibold">Título *</Label>
                  <Input 
                    id="ticketTitle" 
                    placeholder="Descripción breve del problema"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketCategory" className="text-base font-semibold">Categoría *</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Técnico">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Técnico</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Comercial">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Comercial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Facturación">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Facturación</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="General">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span>General</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ticketPriority" className="text-base font-semibold">Prioridad *</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Baja</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Media">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Media</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Alta">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Alta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Crítica">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Crítica</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketCustomer" className="text-base font-semibold">Cliente (Opcional)</Label>
                  <Input 
                    id="ticketCustomer" 
                    placeholder="Nombre del cliente relacionado"
                    value={newTicket.customer}
                    onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticketDescription" className="text-base font-semibold">Descripción *</Label>
                <Textarea 
                  id="ticketDescription" 
                  placeholder="Descripción detallada del problema o consulta" 
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  🎫 <strong>Información:</strong> Los campos marcados con * son obligatorios. El ticket será asignado automáticamente según la categoría.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Ticket
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abiertos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === "open").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === "in_progress").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltos Hoy</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === "resolved" && new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tickets por ID, título o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Abierto">Abierto</SelectItem>
                <SelectItem value="En Progreso">En Progreso</SelectItem>
                <SelectItem value="Resuelto">Resuelto</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons]
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket._id}</TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) as keyof typeof priorityColors]}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusColors[ticket.status === "open" ? "Abierto" : ticket.status === "in_progress" ? "En Progreso" : ticket.status === "resolved" ? "Resuelto" : "Cerrado"]}>
                          {ticket.status === "open" ? "Abierto" : ticket.status === "in_progress" ? "En Progreso" : ticket.status === "resolved" ? "Resuelto" : "Cerrado"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.customer || "-"}</TableCell>
                    <TableCell>{ticket.createdBy}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewTicket(ticket)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Ticket Modal */}
      {selectedTicket && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ticket {selectedTicket._id} - {selectedTicket.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={statusColors[selectedTicket.status === "open" ? "Abierto" : selectedTicket.status === "in_progress" ? "En Progreso" : selectedTicket.status === "resolved" ? "Resuelto" : "Cerrado"]}>
                      {selectedTicket.status === "open" ? "Abierto" : selectedTicket.status === "in_progress" ? "En Progreso" : selectedTicket.status === "resolved" ? "Resuelto" : "Cerrado"}
                    </Badge>
                    <Select 
                      value={selectedTicket.status === "open" ? "Abierto" : selectedTicket.status === "in_progress" ? "En Progreso" : selectedTicket.status === "resolved" ? "Resuelto" : "Cerrado"} 
                      onValueChange={(value) => handleUpdateTicketStatus(selectedTicket._id, value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Abierto">Abierto</SelectItem>
                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                        <SelectItem value="Resuelto">Resuelto</SelectItem>
                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                  <Badge className={priorityColors[selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1) as keyof typeof priorityColors]}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoría</Label>
                  <p>{selectedTicket.category.charAt(0).toUpperCase() + selectedTicket.category.slice(1)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p>{selectedTicket.customer || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Creado por</Label>
                  <p>{selectedTicket.createdBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Asignado a</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <p>{selectedTicket.assignedTo}</p>
                    <Select 
                      value={selectedTicket.assignedTo} 
                      onValueChange={(value) => handleAssignTicket(selectedTicket._id, value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soporte Técnico">Soporte Técnico</SelectItem>
                        <SelectItem value="Ventas">Ventas</SelectItem>
                        <SelectItem value="Administración">Administración</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Descripción</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Comentarios ({selectedTicket.comments.length})</Label>
                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                    </div>
                  ))}
                  {selectedTicket.comments.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No hay comentarios aún</p>
                  )}
                </div>
              </div>

              {/* Add Comment */}
              <div>
                <Label htmlFor="newComment">Agregar Comentario</Label>
                <div className="flex space-x-2 mt-1">
                  <Textarea
                    id="newComment"
                    placeholder="Escribir comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()}
                    loading={api.loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {api.loading ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Cerrar
                </Button>
                {selectedTicket.status !== "resolved" && (
                  <Button 
                    onClick={() => {
                      handleUpdateTicketStatus(selectedTicket._id, "Resuelto")
                      setIsViewModalOpen(false)
                    }}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Marcar como Resuelto
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
