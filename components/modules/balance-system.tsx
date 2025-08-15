"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ArrowRightLeft, DollarSign, TrendingUp, TrendingDown, Plus, Search, Eye, RefreshCw, AlertTriangle, Info } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import type { UserRole } from "@/components/dashboard"

interface BalanceSystemProps {
  userRole: UserRole
}

const initialTransactions = [
  {
    id: "TXN001",
    type: "Transferencia Enviada",
    from: "Admin Principal",
    to: "Operador 1",
    amount: -500.00,
    balance: 4500.00,
    date: "2024-01-15 14:30",
    status: "Completado",
    reference: "REF001"
  },
  {
    id: "TXN002",
    type: "Transferencia Recibida",
    from: "Sistema",
    to: "Admin Principal",
    amount: 1000.00,
    balance: 5000.00,
    date: "2024-01-15 10:00",
    status: "Completado",
    reference: "REF002"
  },
]

const availableUsers = [
  { id: "USER001", name: "Operador 1", role: "Operador", balance: 250.00, status: "Activo" },
  { id: "USER002", name: "Operador 2", role: "Operador", balance: 180.50, status: "Activo" },
  { id: "USER003", name: "Admin Sucursal", role: "Admin", balance: 750.00, status: "Activo" },
]

const statusColors = {
  Completado: "bg-green-100 text-green-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Fallido: "bg-red-100 text-red-800",
}

export function BalanceSystem({ userRole }: BalanceSystemProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [transferData, setTransferData] = useState({
    recipient: "",
    amount: "",
    reference: "",
    notes: ""
  })

  const currentBalance = 4500.00

  const filteredTransactions = transactions.filter(txn =>
    txn.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTransfer = () => {
    if (!transferData.recipient || !transferData.amount) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(transferData.amount)
    if (amount <= 0 || amount > currentBalance) {
      toast({
        title: "Error",
        description: "Monto inválido o insuficiente balance",
        variant: "destructive"
      })
      return
    }

    const processTransfer = async () => {
      try {
        const response = await api.balance.transfer({
          fromUserId: user?.id,
          toUserId: transferData.recipient,
          amount: amount,
          reference: transferData.reference,
          notes: transferData.notes
        })
        
        if (response.success) {
          // Reload transactions
          await loadTransactions()
          setIsTransferOpen(false)
          setTransferData({ recipient: "", amount: "", reference: "", notes: "" })
          
          toast({
            title: "Transferencia Completada",
            description: `$${amount.toFixed(2)} transferidos exitosamente`
          })
        } else {
          toast({
            title: "Error",
            description: response.error || "No se pudo procesar la transferencia",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Transfer error:', error)
        toast({
          title: "Error",
          description: "Error al procesar la transferencia",
          variant: "destructive"
        })
      }
    }

    processTransfer()
  }

  const api = useApi()
  const { user } = useAuth()

  const loadTransactions = async () => {
    try {
      const response = await api.transactions.getAll({ 
        operatorId: user?.id,
        type: "transfer"
      })
      if (response.success) {
        // Transform data to match component expectations
        const transformedTransactions = (response.data || []).map((transaction: any) => ({
          id: transaction._id,
          type: transaction.metadata?.transferType === "outgoing" ? "Transferencia Enviada" : "Transferencia Recibida",
          from: transaction.metadata?.transferType === "outgoing" ? "Usuario Actual" : transaction.metadata?.senderId || "Sistema",
          to: transaction.metadata?.transferType === "incoming" ? "Usuario Actual" : transaction.metadata?.recipientId || "Usuario",
          amount: transaction.amount,
          balance: currentBalance, // This should be calculated properly
          date: new Date(transaction.createdAt).toLocaleString('es-MX'),
          status: transaction.status === "completed" ? "Completado" : transaction.status === "pending" ? "Pendiente" : "Fallido",
          reference: transaction.reference || transaction._id
        }))
        setTransactions(transformedTransactions)
      }
    } catch (error) {
      console.error('Load transactions error:', error)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [user])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Balance</h1>
            <p className="text-gray-600">Gestionar transferencias y balance de usuarios</p>
          </div>
        </div>
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <ArrowRightLeft className="mr-2 h-5 w-5" />
              Transferir Balance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowRightLeft className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span>Transferir Balance</span>
                  <p className="text-sm font-normal text-gray-600 mt-1">Enviar balance a otro usuario del sistema</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Balance Info Card */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">💰 Balance Disponible</p>
                    <p className="text-2xl font-bold text-green-700">${currentBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="recipient" className="text-base font-semibold">Destinatario</Label>
                  <Select value={transferData.recipient} onValueChange={(value) => setTransferData({...transferData, recipient: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar usuario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              user.role === 'Admin' ? 'bg-purple-500' : 'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.role} • Balance: ${user.balance.toFixed(2)}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="amount" className="text-base font-semibold">Monto a Transferir</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    className="h-12 text-lg"
                    min="0"
                    max={currentBalance}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="reference" className="text-base font-semibold">Referencia (Opcional)</Label>
                <Input
                  id="reference"
                  placeholder="Referencia de la transferencia..."
                  value={transferData.reference}
                  onChange={(e) => setTransferData({...transferData, reference: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="notes" className="text-base font-semibold">Notas (Opcional)</Label>
                <Input
                  id="notes"
                  placeholder="Comentarios adicionales..."
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  className="h-12"
                />
              </div>

              {/* Warning Card */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">⚠️ Importante</p>
                    <p className="text-sm text-yellow-700">Las transferencias son irreversibles. Verifique los datos antes de confirmar.</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsTransferOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleTransfer} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowRightLeft className="mr-2 h-5 w-5" />
                  Confirmar Transferencia
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Actual</p>
                <p className="text-3xl font-bold text-green-600">${currentBalance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviado Hoy</p>
                <p className="text-3xl font-bold text-red-600">
                  ${Math.abs(filteredTransactions
                    .filter(t => t.amount < 0 && t.date.includes(new Date().toISOString().split('T')[0]))
                    .reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recibido Hoy</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${filteredTransactions
                    .filter(t => t.amount > 0 && t.date.includes(new Date().toISOString().split('T')[0]))
                    .reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-3xl font-bold text-purple-600">{filteredTransactions.length}</p>
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
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Transacciones ({filteredTransactions.length})</span>
            <Badge variant="outline" className="text-sm">
              Balance: ${currentBalance.toFixed(2)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.from}</TableCell>
                  <TableCell>{transaction.to}</TableCell>
                  <TableCell className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-medium">${transaction.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                  <TableCell className="text-sm text-gray-600">{transaction.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" title="Ver detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
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
