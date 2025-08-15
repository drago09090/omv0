"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Smartphone, Upload, Plus, Search, Eye, Edit, Trash2, Download, FileText, CheckCircle, Clock, AlertCircle, Wifi, WifiOff, Info } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import type { UserRole } from "@/components/dashboard"

interface SimManagementProps {
  userRole: UserRole
}

const operators = [
  { id: "telcel", name: "Telcel", color: "bg-blue-500" },
  { id: "att", name: "AT&T", color: "bg-red-500" },
  { id: "movistar", name: "Movistar", color: "bg-green-500" },
]

const statusColors = {
  Activa: "bg-green-100 text-green-800",
  Disponible: "bg-blue-100 text-blue-800",
  Suspendida: "bg-yellow-100 text-yellow-800",
  Inactiva: "bg-red-100 text-red-800",
}

const statusIcons = {
  Activa: Wifi,
  Disponible: CheckCircle,
  Suspendida: Clock,
  Inactiva: WifiOff,
}

export function SimManagement({ userRole }: SimManagementProps) {
  const [sims, setSims] = useState<any[]>([])
  const [isNewSimOpen, setIsNewSimOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newSim, setNewSim] = useState({
    iccid: "",
    msisdn: "",
    operator: "",
    notes: ""
  })

  const api = useApi()

  useEffect(() => {
    loadSims()
  }, [])

  const loadSims = async () => {
    try {
      const response = await api.sims.getAll()
      if (response.success) {
        setSims(response.data || [])
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las SIMs",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Load sims error:', error)
      toast({
        title: "Error",
        description: "Error al conectar con la base de datos",
        variant: "destructive"
      })
    }
  }

  const filteredSims = sims.filter(sim =>
    sim.iccid.includes(searchTerm) ||
    sim.msisdn.includes(searchTerm) ||
    sim.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sim.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSim = async () => {
    if (!newSim.iccid || !newSim.msisdn || !newSim.operator) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const simData = {
        iccid: newSim.iccid,
        msisdn: newSim.msisdn,
        operator: operators.find(op => op.id === newSim.operator)?.name || newSim.operator,
        notes: newSim.notes
      }

      const response = await api.sims.create(simData)
      
      if (response.success) {
        await loadSims()
        setIsNewSimOpen(false)
        setNewSim({ iccid: "", msisdn: "", operator: "", notes: "" })
        
        toast({
          title: "SIM Creada",
          description: `SIM ${newSim.iccid} agregada exitosamente`
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo crear la SIM",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Create sim error:', error)
      toast({
        title: "Error",
        description: "Error al crear la SIM",
        variant: "destructive"
      })
    }
  }

  const handleBulkUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo",
        variant: "destructive"
      })
      return
    }

    // Simulate bulk upload processing
    toast({
      title: "Procesando Archivo",
      description: "Cargando SIMs masivamente...",
    })

    setTimeout(() => {
      const newSims = [
        {
          iccid: "8934071234567890125",
          msisdn: "+52 55 1234 5680",
          operator: "Telcel",
          status: "available"
        },
        {
          iccid: "8934071234567890126",
          msisdn: "+52 55 1234 5681",
          operator: "AT&T",
          status: "available"
        }
      ]

      setSims([...sims, ...newSims])
      setIsBulkUploadOpen(false)
      setSelectedFile(null)

      toast({
        title: "Carga Completada",
        description: `${newSims.length} SIMs cargadas exitosamente`,
      })
    }, 2000)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleOpenNewSim = () => {
    console.log("Opening new SIM modal"); // Debug log
    setIsNewSimOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de SIMs</h1>
            <p className="text-gray-600">Administrar inventario de tarjetas SIM</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Upload className="mr-2 h-5 w-5" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span>Carga Masiva de SIMs</span>
                    <p className="text-sm font-normal text-gray-600 mt-1">Importar múltiples SIMs desde archivo Excel/CSV</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Format Requirements Card */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800">📋 Formato Requerido</p>
                      <p className="text-sm text-blue-700 mt-1">El archivo debe contener las siguientes columnas:</p>
                      <ul className="text-sm text-blue-600 mt-2 space-y-1">
                        <li>• <strong>ICCID:</strong> Identificador único de la SIM</li>
                        <li>• <strong>MSISDN:</strong> Número de teléfono asignado</li>
                        <li>• <strong>Operador:</strong> Telcel, AT&T, o Movistar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="file-upload" className="text-base font-semibold">Seleccionar Archivo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {selectedFile ? selectedFile.name : "Seleccionar archivo"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedFile ? `Tamaño: ${(selectedFile.size / 1024).toFixed(2)} KB` : "Formatos soportados: CSV, Excel (.xlsx, .xls)"}
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {selectedFile ? "Cambiar archivo" : "Examinar archivos"}
                        </Button>
                      </div>
                    </label>
                  </div>
                </div>

                {/* File Format Guide */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">CSV</p>
                    <p className="text-xs text-gray-500">Recomendado</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Excel (.xlsx)</p>
                    <p className="text-xs text-gray-500">Compatible</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Excel (.xls)</p>
                    <p className="text-xs text-gray-500">Compatible</p>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">⚠️ Importante</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Verifique que no haya ICCIDs duplicados</li>
                        <li>• Los números MSISDN deben tener formato válido</li>
                        <li>• El proceso puede tardar varios minutos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={!selectedFile}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Procesar Archivo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewSimOpen} onOpenChange={setIsNewSimOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handleOpenNewSim}
              >
                <Plus className="mr-2 h-5 w-5" />
                Nueva Línea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span>Nueva Línea SIM</span>
                    <p className="text-sm font-normal text-gray-600 mt-1">Agregar nueva tarjeta SIM al inventario</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Info Card */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">📱 Nueva SIM</p>
                      <p className="text-sm text-purple-700">Complete la información de la tarjeta SIM</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="iccid" className="text-base font-semibold">ICCID *</Label>
                    <Input
                      id="iccid"
                      placeholder="8934071234567890123"
                      value={newSim.iccid}
                      onChange={(e) => setNewSim({...newSim, iccid: e.target.value})}
                      className="h-12 font-mono"
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="msisdn" className="text-base font-semibold">MSISDN *</Label>
                    <Input
                      id="msisdn"
                      placeholder="+52 55 1234 5678"
                      value={newSim.msisdn}
                      onChange={(e) => setNewSim({...newSim, msisdn: e.target.value})}
                      className="h-12 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="operator" className="text-base font-semibold">Operador *</Label>
                  <Select value={newSim.operator} onValueChange={(value) => setNewSim({...newSim, operator: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar operador..." />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${operator.color}`}></div>
                            <span className="font-medium">{operator.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="notes" className="text-base font-semibold">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Comentarios adicionales sobre la SIM..."
                    value={newSim.notes}
                    onChange={(e) => setNewSim({...newSim, notes: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <Separator />

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsNewSimOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateSim} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Crear SIM
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SIMs</p>
                <p className="text-3xl font-bold text-purple-600">{sims.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-3xl font-bold text-green-600">
                  {sims.filter(sim => sim.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-blue-600">
                  {sims.filter(sim => sim.status === "available").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspendidas</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {sims.filter(sim => sim.status === "suspended").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar SIMs por ICCID, MSISDN, operador o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* SIMs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Inventario de SIMs ({filteredSims.length})</span>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-sm">
                {sims.filter(sim => sim.status === "active").length} activas
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ICCID</TableHead>
                <TableHead>MSISDN</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Activación</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSims.map((sim) => {
                const StatusIcon = statusIcons[sim.status as keyof typeof statusIcons]
                return (
                  <TableRow key={sim.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{sim._id}</TableCell>
                    <TableCell className="font-mono text-sm">{sim.iccid}</TableCell>
                    <TableCell className="font-mono">{sim.msisdn}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          sim.operator === 'Telcel' ? 'bg-blue-500' :
                          sim.operator === 'AT&T' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span>{sim.operator}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusColors[sim.status === "active" ? "Activa" : sim.status === "available" ? "Disponible" : sim.status === "suspended" ? "Suspendida" : "Inactiva"]}>
                          {sim.status === "active" ? "Activa" : sim.status === "available" ? "Disponible" : sim.status === "suspended" ? "Suspendida" : "Inactiva"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{sim.customer || "-"}</TableCell>
                    <TableCell>{sim.plan || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {sim.activationDate ? new Date(sim.activationDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {sim.expiryDate ? new Date(sim.expiryDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {userRole === "superadmin" && (
                          <Button variant="ghost" size="sm" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
