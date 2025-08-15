"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Users, Plus, Search, Edit, Trash2, Shield, Eye, UserCheck } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { usePermissions } from "@/hooks/use-permissions"
import type { UserRole } from "@/contexts/auth-context"

interface UserManagementProps {
  userRole: UserRole
}

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "operator", label: "Operador" },
  { value: "subdistributor", label: "Subdistribuidor" },
  { value: "vendor", label: "Vendedor" }
]

const permissionGroups = {
  users: ["users.read", "users.write", "users.delete"],
  customers: ["customers.read", "customers.write", "customers.delete"],
  sims: ["sims.read", "sims.write", "sims.delete"],
  tickets: ["tickets.read", "tickets.write", "tickets.assign"],
  balance: ["balance.read", "balance.write", "balance.transfer"],
  reports: ["reports.read", "reports.generate", "reports.export"],
  settings: ["settings.read", "settings.write"],
  warehouse: ["warehouse.read", "warehouse.write"],
  billing: ["billing.read", "billing.write"],
  plans: ["plans.read", "plans.write"]
}

export function UserManagement({ userRole }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    supervisor: "",
    permissions: [] as string[]
  })

  const api = useApi()
  const { canManageUser, canPerformAction } = usePermissions()

  const canCreateUser = canPerformAction('users.write')
  const canEditUser = canPerformAction('users.write')
  const canDeleteUser = canPerformAction('users.delete')

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const loadUsers = async () => {
    try {
      const filters: Record<string, string> = {}
      if (roleFilter !== "all") filters.role = roleFilter
      
      const response = await api.users.getAll(filters)
      if (response.success) {
        setUsers(response.data || [])
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast({
        title: "Error",
        description: "Error al conectar con la base de datos",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await api.users.create(newUser)
      
      if (response.success) {
        await loadUsers()
        setIsCreateModalOpen(false)
        setNewUser({
          name: "",
          email: "",
          role: "",
          department: "",
          supervisor: "",
          permissions: []
        })
        
        toast({
          title: "Usuario Creado",
          description: `Usuario ${newUser.name} creado exitosamente`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo crear el usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive"
      })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const response = await api.users.update(editingUser._id, editingUser)
      
      if (response.success) {
        await loadUsers()
        setIsEditModalOpen(false)
        setEditingUser(null)
        
        toast({
          title: "Usuario Actualizado",
          description: "Usuario actualizado exitosamente"
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo actualizar el usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Update user error:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el usuario",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar al usuario ${userName}?`)) {
      return
    }

    try {
      const response = await api.users.delete(userId)
      
      if (response.success) {
        await loadUsers()
        toast({
          title: "Usuario Eliminado",
          description: `Usuario ${userName} eliminado exitosamente`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo eliminar el usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive"
      })
    }
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (isCreateModalOpen) {
      setNewUser(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permission]
          : prev.permissions.filter(p => p !== permission)
      }))
    } else if (editingUser) {
      setEditingUser(prev => ({
        ...prev,
        permissions: checked 
          ? [...(prev.permissions || []), permission]
          : (prev.permissions || []).filter(p => p !== permission)
      }))
    }
  }

  if (!canPerformAction('users.read')) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la gestión de usuarios.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administrar usuarios del sistema</p>
          </div>
        </div>
        {canCreateUser && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <span>Crear Nuevo Usuario</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="userName" className="text-base font-semibold">Nombre Completo *</Label>
                    <Input
                      id="userName"
                      placeholder="Nombre completo del usuario"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="userEmail" className="text-base font-semibold">Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="usuario@omv.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="userRole" className="text-base font-semibold">Rol *</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Seleccionar rol..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.filter(role => canManageUser(role.value as UserRole)).map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="userDepartment" className="text-base font-semibold">Departamento</Label>
                    <Input
                      id="userDepartment"
                      placeholder="Departamento"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="userSupervisor" className="text-base font-semibold">Supervisor</Label>
                    <Input
                      id="userSupervisor"
                      placeholder="Supervisor"
                      value={newUser.supervisor}
                      onChange={(e) => setNewUser({ ...newUser, supervisor: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Permisos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(permissionGroups).map(([group, permissions]) => (
                      <div key={group} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3 capitalize">{group}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission}
                                checked={newUser.permissions.includes(permission)}
                                onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                              />
                              <Label htmlFor={permission} className="text-sm">
                                {permission.split('.')[1]}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateUser} 
                    disabled={api.loading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {api.loading ? "Creando..." : "Crear Usuario"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(user => user.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(user => ['admin', 'superadmin'].includes(user.role)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operadores</p>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(user => ['operator', 'vendor'].includes(user.role)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar usuarios por nombre, email o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 h-12">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Usuarios ({filteredUsers.length})</span>
            <Badge variant="outline" className="text-sm">
              {users.filter(user => user.isActive).length} activos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roleOptions.find(r => r.value === user.role)?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>{user.supervisor || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEditUser && canManageUser(user.role) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingUser(user)
                            setIsEditModalOpen(true)
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUser && canManageUser(user.role) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <span>Editar Usuario</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="editName" className="text-base font-semibold">Nombre Completo</Label>
                  <Input
                    id="editName"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="editEmail" className="text-base font-semibold">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="editRole" className="text-base font-semibold">Rol</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.filter(role => canManageUser(role.value as UserRole)).map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="editDepartment" className="text-base font-semibold">Departamento</Label>
                  <Input
                    id="editDepartment"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="editSupervisor" className="text-base font-semibold">Supervisor</Label>
                  <Input
                    id="editSupervisor"
                    value={editingUser.supervisor || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, supervisor: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Permisos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissionGroups).map(([group, permissions]) => (
                    <div key={group} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3 capitalize">{group}</h4>
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission}`}
                              checked={(editingUser.permissions || []).includes(permission)}
                              onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                            />
                            <Label htmlFor={`edit-${permission}`} className="text-sm">
                              {permission.split('.')[1]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleEditUser} 
                  disabled={api.loading}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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