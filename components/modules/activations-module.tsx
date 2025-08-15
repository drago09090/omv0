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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Zap, RefreshCw, Plus, Search, CheckCircle, Clock, AlertCircle, Eye, User, Smartphone, CreditCard, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import type { UserRole } from "@/components/dashboard"

interface ActivationsModuleProps {
  type: "activations" | "recharges"
  userRole: UserRole
}

const initialOperations = [
  {
    id: "ACT001",
    type: "Activación",
    customer: "María López",
    customerPhone: "+52 55 1234 5678",
    sim: "8934071234567890123",
    plan: "Plan Básico 500MB",
    amount: "$25.00",
    status: "Completado",
    date: "2024-01-15 14:30",
    operator: "Juan Pérez"
  },
  {
    id: "REC001",
    type: "Recarga",
    customer: "Carlos García",
    customerPhone: "+52 55 2345 6789",
    sim: "8934071234567890124",
    plan: "Recarga $20",
    amount: "$20.00",
    status: "Pendiente",
    date: "2024-01-15 14:25",
    operator: "Ana Martín"
  },
]

const availableCustomers = [
  { id: "CUST001", name: "María López", phone: "+52 55 1234 5678", email: "maria@email.com", status: "Activo" },
  { id: "CUST002", name: "Carlos García", phone: "+52 55 2345 6789", email: "carlos@email.com", status: "Activo" },
  { id: "CUST003", name: "Luis Rodríguez", phone: "+52 55 3456 7890", email: "luis@email.com", status: "Activo" },
]

const availableSims = [
  { id: "SIM001", iccid: "8934071234567890123", msisdn: "+52 55 1234 5678", status: "Disponible", operator: "Telcel" },
  { id: "SIM002", iccid: "8934071234567890124", msisdn: "+52 55 1234 5679", status: "Disponible", operator: "AT&T" },
  { id: "SIM003", iccid: "8934071234567890125", msisdn: "+52 55 1234 5680", status: "Disponible", operator: "Movistar" },
]

const availablePlans = [
  { id: "PLAN001", name: "Plan Básico 500MB", price: 25.00, description: "500MB + 100 min + 50 SMS", duration: "30 días" },
  { id: "PLAN002", name: "Plan Premium 2GB", price: 35.00, description: "2GB + 300 min + 200 SMS", duration: "30 días" },
  { id: "PLAN003", name: "Plan Empresarial 5GB", price: 50.00, description: "5GB + 500 min + 500 SMS", duration: "30 días" },
]

const statusColors = {
  Completado: "bg-green-100 text-green-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Fallido: "bg-red-100 text-red-800",
}

const statusIcons = {
  Completado: CheckCircle,
  Pendiente: Clock,
  Fallido: AlertCircle,
}

const stepIcons = {
  1: User,
  2: Smartphone,
  3: CreditCard,
  4: FileText
}

const stepTitles = {
  1: "Seleccionar Cliente",
  2: "Configurar SIM",
  3: "Elegir Plan",
  4: "Confirmar Operación"
}

export function ActivationsModule({ type, userRole }: ActivationsModuleProps) {
  const [operations, setOperations] = useState(initialOperations)
  const [isNewOperationOpen, setIsNewOperationOpen] = useState(false)
  const [isViewOperationOpen, setIsViewOperationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOperation, setSelectedOperation] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [newOperation, setNewOperation] = useState({
    customer: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    sim: "",
    simIccid: "",
    msisdn: "",
    operator: "",
    plan: "",
    planName: "",
    planDescription: "",
    amount: "",
    notes: ""
  })

  const title = type === "activations" ? "Activaciones" : "Recargas"
  const Icon = type === "activations" ? Zap : RefreshCw

  const filteredOperations = operations.filter(op => 
    type === "activations" ? op.type === "Activación" : op.type === "Recarga"
  ).filter(op =>
    op.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.sim.includes(searchTerm)
  )

  const handleCustomerSelect = (customerId: string) => {
    const customer = availableCustomers.find(c => c.id === customerId)
    if (customer) {
      setNewOperation({
        ...newOperation,
        customer: customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email
      })
    }
  }

  const handleSimSelect = (simId: string) => {
    const sim = availableSims.find(s => s.id === simId)
    if (sim) {
      setNewOperation({
        ...newOperation,
        sim: simId,
        simIccid: sim.iccid,
        msisdn: sim.msisdn,
        operator: sim.operator
      })
    }
  }

  const handlePlanSelect = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId)
    if (plan) {
      setNewOperation({
        ...newOperation,
        plan: planId,
        planName: plan.name,
        planDescription: plan.description,
        amount: `$${plan.price.toFixed(2)}`
      })
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !newOperation.customer) {
      toast({
        title: "Error",
        description: "Por favor seleccione un cliente",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 2 && !newOperation.sim) {
      toast({
        title: "Error",
        description: "Por favor seleccione una SIM",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 3 && !newOperation.plan) {
      toast({
        title: "Error",
        description: "Por favor seleccione un plan",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleCreateOperation = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate processing with progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 300)

      // Wait for progress to complete
      await new Promise(resolve => {
        const checkProgress = () => {
          if (processingProgress >= 100) {
            resolve(true)
          } else {
            setTimeout(checkProgress, 100)
          }
        }
        checkProgress()
      })

      // Process the actual operation
      if (type === "activations") {
        const activationData = {
          customerId: newOperation.customer,
          simId: newOperation.sim,
          planId: newOperation.plan,
          amount: parseFloat(newOperation.amount.replace('$', ''))
        }

        const response = await api.activations.create(activationData)
        
        if (response.success) {
          await loadOperations()
          resetModal()
          
          toast({
            title: "Activación Completada",
            description: "Activación procesada exitosamente"
          })
        } else {
          throw new Error(response.error || "Failed to process activation")
        }
      } else {
        const rechargeData = {
          customerId: newOperation.customer,
          amount: parseFloat(newOperation.amount.replace('$', ''))
        }

        const response = await api.recharges.create(rechargeData)
        
        if (response.success) {
          await loadOperations()
          resetModal()
          
          toast({
            title: "Recarga Completada",
            description: "Recarga procesada exitosamente"
          })
        } else {
          throw new Error(response.error || "Failed to process recharge")
        }
      }
    } catch (error) {
      console.error('Process operation error:', error)
      toast({
        title: "Error",
        description: "Error al procesar la operación",
        variant: "destructive"
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const resetModal = () => {
    setIsNewOperationOpen(false)
    setIsProcessing(false)
    setCurrentStep(1)
    setProcessingProgress(0)
    setNewOperation({
      customer: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      sim: "",
      simIccid: "",
      msisdn: "",
      operator: "",
      plan: "",
      planName: "",
      planDescription: "",
      amount: "",
      notes: ""
    })
  }

  const loadOperations = async () => {
    try {
      const response = await api.transactions.getAll({ 
        type: type === "activations" ? "activation" : "recharge" 
      })
      if (response.success) {
        // Transform data to match component expectations
        const transformedOperations = (response.data || []).map((transaction: any) => ({
          id: transaction._id,
          type: transaction.type === "activation" ? "Activación" : "Recarga",
          customer: transaction.customerId, // This should be populated with customer name
          customerPhone: transaction.metadata?.customerPhone || "",
          sim: transaction.simId || "",
          plan: transaction.metadata?.planName || "",
          amount: `$${transaction.amount.toFixed(2)}`,
          status: transaction.status === "completed" ? "Completado" : transaction.status === "pending" ? "Pendiente" : "Fallido",
          date: new Date(transaction.createdAt).toLocaleString('es-MX'),
          operator: transaction.operatorId
        }))
        setOperations(transformedOperations)
      }
    } catch (error) {
      console.error('Load operations error:', error)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [type])

  const handleViewOperation = (operation: any) => {
    setSelectedOperation(operation)
    setIsViewOperationOpen(true)
  }

  const handleRetryOperation = (operationId: string) => {
    setOperations(operations.map(op => 
      op.id === operationId ? { ...op, status: "Pendiente" } : op
    ))
    
    toast({
      title: "Reintentando Operación",
      description: `Procesando ${operationId}...`,
    })

    setTimeout(() => {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: "Completado" } : op
      ))
      toast({
        title: "Operación Completada",
        description: `${operationId} procesada exitosamente`,
      })
    }, 2000)
  }

  const resetModal = () => {
    setCurrentStep(1)
    setIsProcessing(false)
    setProcessingProgress(0)
    setNewOperation({
      customer: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      sim: "",
      simIccid: "",
      msisdn: "",
      operator: "",
      plan: "",
      planName: "",
      planDescription: "",
      amount: "",
      notes: ""
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">Gestionar {title.toLowerCase()} de líneas móviles</p>
          </div>
        </div>
        <Dialog open={isNewOperationOpen} onOpenChange={(open) => {
          setIsNewOperationOpen(open)
          if (!open) resetModal()
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva {type === "activations" ? "Activación" : "Recarga"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span>Nueva {type === "activations" ? "Activación" : "Recarga"}</span>
              </DialogTitle>
            </DialogHeader>

            {!isProcessing ? (
              <div className="space-y-8">
                {/* Enhanced Progress Indicator */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map((step) => {
                      const StepIcon = stepIcons[step as keyof typeof stepIcons]
                      const isActive = step === currentStep
                      const isCompleted = step < currentStep
                      
                      return (
                        <div key={step} className="flex flex-col items-center space-y-2">
                          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                              : isCompleted 
                                ? 'bg-green-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <StepIcon className="h-6 w-6" />
                            )}
                            {isActive && (
                              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25"></div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                              Paso {step}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                              {stepTitles[step as keyof typeof stepTitles]}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Separator />

                {/* Step Content */}
                <div className="min-h-[400px]">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h3>
                        <p className="text-gray-600">Elige el cliente para esta {type === "activations" ? "activación" : "recarga"}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label htmlFor="customerSearch" className="text-base font-semibold">Buscar Cliente</Label>
                          <Input 
                            id="customerSearch" 
                            placeholder="Buscar por nombre o teléfono..." 
                            className="h-12"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              // Filter customers based on search
                            }}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="customerSelect" className="text-base font-semibold">Cliente</Label>
                          <Select value={newOperation.customer} onValueChange={handleCustomerSelect}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Seleccionar cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCustomers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{customer.name}</p>
                                      <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {newOperation.customer && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-green-800 text-lg">Cliente Seleccionado</p>
                              <p className="text-green-700 font-medium">{newOperation.customerName}</p>
                              <p className="text-green-600">{newOperation.customerPhone} • {newOperation.customerEmail}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Smartphone className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Configurar SIM</h3>
                        <p className="text-gray-600">Selecciona la tarjeta SIM para la activación</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label htmlFor="simSelect" className="text-base font-semibold">SIM Disponible</Label>
                          <Select value={newOperation.sim} onValueChange={handleSimSelect}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Seleccionar SIM..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSims.map((sim) => (
                                <SelectItem key={sim.id} value={sim.id}>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <Smartphone className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-mono font-medium">{sim.iccid}</p>
                                      <p className="text-sm text-gray-500">{sim.operator} • {sim.status}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="msisdn" className="text-base font-semibold">Número Asignado</Label>
                          <Input 
                            id="msisdn" 
                            value={newOperation.msisdn}
                            placeholder="Se asignará automáticamente" 
                            className="h-12 font-mono"
                            readOnly
                          />
                        </div>
                      </div>

                      {newOperation.sim && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                              <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-purple-800 text-lg">SIM Configurada</p>
                              <p className="text-purple-700 font-mono font-medium">{newOperation.simIccid}</p>
                              <p className="text-purple-600">MSISDN: {newOperation.msisdn} • Operador: {newOperation.operator}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Elegir Plan</h3>
                        <p className="text-gray-600">Selecciona el plan o paquete de servicios</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availablePlans.map((plan) => (
                          <div 
                            key={plan.id}
                            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              newOperation.plan === plan.id 
                                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                            onClick={() => handlePlanSelect(plan.id)}
                          >
                            {newOperation.plan === plan.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="text-center">
                              <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                              <p className="text-3xl font-bold text-blue-600 mb-2">${plan.price}</p>
                              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                              <p className="text-xs text-gray-500">Duración: {plan.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {newOperation.plan && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-blue-800 text-lg">Plan Seleccionado</p>
                              <p className="text-blue-700 font-medium">{newOperation.planName}</p>
                              <p className="text-blue-600">{newOperation.planDescription} • {newOperation.amount}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Operación</h3>
                        <p className="text-gray-600">Revisa los detalles antes de procesar</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <User className="h-5 w-5" />
                              <span>Información del Cliente</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm text-gray-600">Nombre</Label>
                              <p className="font-medium">{newOperation.customerName}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Teléfono</Label>
                              <p className="font-medium">{newOperation.customerPhone}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Email</Label>
                              <p className="font-medium">{newOperation.customerEmail}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Smartphone className="h-5 w-5" />
                              <span>Configuración SIM</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm text-gray-600">ICCID</Label>
                              <p className="font-mono font-medium">{newOperation.simIccid}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">MSISDN</Label>
                              <p className="font-mono font-medium">{newOperation.msisdn}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Operador</Label>
                              <p className="font-medium">{newOperation.operator}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5" />
                            <span>Detalles del Plan</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Plan</Label>
                              <p className="font-medium">{newOperation.planName}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Monto</Label>
                              <p className="font-bold text-green-600 text-xl">{newOperation.amount}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Descripción</Label>
                            <p className="text-gray-700">{newOperation.planDescription}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <Label htmlFor="notes" className="text-base font-semibold">Notas Adicionales (Opcional)</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Agregar comentarios o instrucciones especiales..."
                          value={newOperation.notes}
                          onChange={(e) => setNewOperation({ ...newOperation, notes: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navigation Buttons */}
                <Separator />
                <div className="flex justify-between items-center pt-4">
                  <div>
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={handlePreviousStep} size="lg">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsNewOperationOpen(false)} size="lg">
                      Cancelar
                    </Button>
                    {currentStep < 4 ? (
                      <Button onClick={handleNextStep} size="lg" className="bg-blue-600 hover:bg-blue-700">
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleCreateOperation} size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        <Icon className="mr-2 h-5 w-5" />
                        {type === "activations" ? "Procesar Activación" : "Procesar Recarga"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Procesando {type === "activations" ? "Activación" : "Recarga"}</h3>
                  <p className="text-gray-600 mb-8">
                    Configurando servicios y activando la línea móvil...
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={processingProgress} className="h-3 mb-4" />
                    <p className="text-sm text-gray-500">{Math.round(processingProgress)}% completado</p>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">⏳ Tiempo estimado restante: {Math.max(0, Math.round((100 - processingProgress) / 20))} segundos</p>
                  <p className="text-xs text-gray-500">No cierres esta ventana durante el proceso</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredOperations.filter(op => op.date.includes(new Date().toISOString().split('T')[0])).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredOperations.filter(op => op.status === "Completado").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {filteredOperations.filter(op => op.status === "Pendiente").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${filteredOperations.filter(op => op.status === "Completado")
                    .reduce((sum, op) => sum + parseFloat(op.amount.replace('$', '')), 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-purple-600" />
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
              placeholder={`Buscar ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de {title} ({filteredOperations.length})</span>
            <Badge variant="outline" className="text-sm">
              {filteredOperations.filter(op => op.status === "Completado").length} completadas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>SIM</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => {
                const StatusIcon = statusIcons[operation.status as keyof typeof statusIcons]
                return (
                  <TableRow key={operation.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{operation.id}</TableCell>
                    <TableCell>{operation.customer}</TableCell>
                    <TableCell className="font-mono text-sm">{operation.sim}</TableCell>
                    <TableCell>{operation.plan}</TableCell>
                    <TableCell className="font-semibold">{operation.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusColors[operation.status as keyof typeof statusColors]}>
                          {operation.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{operation.operator}</TableCell>
                    <TableCell className="text-sm text-gray-600">{operation.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewOperation(operation)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {operation.status === "Fallido" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRetryOperation(operation.id)}
                            title="Reintentar"
                          >
                            <RefreshCw className="h-4 w-4" />
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

      {/* View Operation Modal */}
      {selectedOperation && (
        <Dialog open={isViewOperationOpen} onOpenChange={setIsViewOperationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>Detalles de {selectedOperation.type} - {selectedOperation.id}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="font-medium text-lg">{selectedOperation.customer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                  <p className="font-mono">{selectedOperation.customerPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">SIM</Label>
                  <p className="font-mono">{selectedOperation.sim}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Plan</Label>
                  <p>{selectedOperation.plan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Monto</Label>
                  <p className="font-bold text-green-600 text-xl">{selectedOperation.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <Badge className={statusColors[selectedOperation.status as keyof typeof statusColors]}>
                    {selectedOperation.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Operador</Label>
                  <p>{selectedOperation.operator}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                  <p>{selectedOperation.date}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {selectedOperation.status === "Fallido" && (
                  <Button onClick={() => {
                    handleRetryOperation(selectedOperation.id)
                    setIsViewOperationOpen(false)
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewOperationOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
