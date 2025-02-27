"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditIcon, TrashIcon, ScaleIcon, CreditCardIcon, PrinterIcon, SearchIcon, FilterIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { PaymentDialog } from "./payment-dialog"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Transaction {
  id: string
  truck: {
    licensePlate: string
    driver: {
      name: string
    }
    emptyWeight: number
  }
  client: {
    name: string
    company: string | null
  }
  entryTime: string
  exitTime: string | null
  sandWeight: number | null
  totalWeight: number | null
  payment: {
    amount: number
    method: 'CASH' | 'BANK_TRANSFER'
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
  } | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'ALL'>('ALL')
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'desc' })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [searchQuery, statusFilter, sortConfig])

  const fetchTransactions = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchQuery,
        status: statusFilter === 'ALL' ? '' : statusFilter,
        sortBy: sortConfig.key || '',
        sortDirection: sortConfig.direction
      })

      const response = await fetch(`/api/transactions?${queryParams}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des transactions")
      const { data, meta } = await response.json()
      setTransactions(data)
      setPagination({
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      setTransactions(transactions.filter(transaction => transaction.id !== id))
      toast({
        title: "Succès",
        description: "La transaction a été supprimée",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive",
      })
    }
  }

  const handleWeightUpdate = async (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (!transaction) return
  
    try {
      const weight = await new Promise<number>((resolve, reject) => {
        const dialog = document.createElement('dialog')
        dialog.innerHTML = `
          <form method="dialog" class="space-y-4 p-4">
            <h2 class="text-lg font-semibold">Mise à jour du poids</h2>
            <div>
              <label class="block text-sm font-medium mb-1">Poids total (T)</label>
              <input type="number" step="0.01" min="${transaction.truck.emptyWeight}" required class="w-full p-2 border rounded" />
            </div>
            <div class="text-sm text-muted-foreground mb-4">
              Poids du sable: <span id="sandWeight">0.00</span> T
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" class="px-4 py-2 border rounded">Annuler</button>
              <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded">Confirmer</button>
            </div>
          </form>
        `
  
        const form = dialog.querySelector('form')
        const input = dialog.querySelector('input')
        const sandWeightSpan = dialog.querySelector('#sandWeight')
        const cancelButton = dialog.querySelector('button[type="button"]')

        input?.addEventListener('input', (e) => {
          const totalWeight = parseFloat((e.target as HTMLInputElement).value)
          const sandWeight = !isNaN(totalWeight) ? (totalWeight - transaction.truck.emptyWeight).toFixed(2) : '0.00'
          if (sandWeightSpan) sandWeightSpan.textContent = sandWeight
        })
  
        form?.addEventListener('submit', (e) => {
          e.preventDefault()
          const value = parseFloat(input?.value || '')
          if (!isNaN(value) && value >= transaction.truck.emptyWeight) {
            resolve(value)
            dialog.close()
          }
        })
  
        cancelButton?.addEventListener('click', () => {
          dialog.close()
          reject(new Error('Cancelled'))
        })
  
        document.body.appendChild(dialog)
        dialog.showModal()
  
        dialog.addEventListener('close', () => {
          document.body.removeChild(dialog)
        })
      })
  
      const sandWeight = weight - transaction.truck.emptyWeight
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalWeight: weight,
          sandWeight: sandWeight,
          status: "IN_PROGRESS",
          exitTime: new Date().toISOString(),
        }),
      })
  
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
  
      const updatedTransaction = await response.json()
      setTransactions(transactions.map(t => t.id === id ? updatedTransaction : t))
      
      toast({
        title: "Succès",
        description: "Le poids a été mis à jour",
      })
    } catch (error) {
      if (error.message !== 'Cancelled') {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le poids",
          variant: "destructive",
        })
      }
    }
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'IN_PROGRESS':
        return 'warning'
      case 'COMPLETED':
        return 'success'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getPaymentStatusColor = (status: NonNullable<Transaction['payment']>['status']) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'COMPLETED':
        return 'success'
      case 'FAILED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const handlePaymentSuccess = () => {
    fetchTransactions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                  Tous les statuts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>
                  En Attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('IN_PROGRESS')}>
                  En Cours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('COMPLETED')}>
                  Terminée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')}>
                  Annulée
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('truck')}>Camion</TableHead>
                <TableHead onClick={() => handleSort('truck')}>Chauffeur</TableHead>
                <TableHead onClick={() => handleSort('client')}>Client</TableHead>
                <TableHead onClick={() => handleSort('entryTime')}>Entrée</TableHead>
                <TableHead onClick={() => handleSort('exitTime')}>Sortie</TableHead>
                <TableHead onClick={() => handleSort('sandWeight')}>Poids Sable (T)</TableHead>
                <TableHead onClick={() => handleSort('totalWeight')}>Poids Total (T)</TableHead>
                <TableHead onClick={() => handleSort('payment')}>Paiement</TableHead>
                <TableHead onClick={() => handleSort('status')}>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.truck?.licensePlate || '-'}</TableCell>
                    <TableCell>{transaction.truck?.driver?.name || '-'}</TableCell>
                    <TableCell>
                      {transaction.client?.name || '-'}
                      {transaction.client?.company && (
                        <span className="block text-sm text-muted-foreground">
                          {transaction.client.company}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.entryTime), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>{transaction.exitTime
                      ? format(new Date(transaction.exitTime), "dd/MM/yyyy HH:mm", { locale: fr })
                      : "-"}</TableCell>
                    <TableCell>{transaction.sandWeight?.toFixed(2) || "-"}</TableCell>
                    <TableCell>{transaction.totalWeight?.toFixed(2) || "-"}</TableCell>
                    <TableCell>
                      {transaction.payment ? (
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.payment.amount.toFixed(2)} DH</div>
                          <div className="flex items-center gap-2">
                            <Badge>
                              {transaction.payment.method === 'CASH' ? 'Espèces' : 'Banque'}
                            </Badge>
                            <Badge variant={(getPaymentStatusColor(transaction.payment.status) as "default" | "destructive" | "outline" | "secondary")}>
                              {{PENDING: 'En Attente', COMPLETED: 'Payé', FAILED: 'Échoué'}[transaction.payment.status]}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non payé</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={(getStatusColor(transaction.status) as "default" | "secondary" | "destructive" | "outline")}>
                        {{
                          PENDING: 'En Attente',
                          IN_PROGRESS: 'En Cours',
                          COMPLETED: 'Terminée',
                          CANCELLED: 'Annulée'
                        }[transaction.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {transaction.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWeightUpdate(transaction.id)}
                          title="Enregistrer le poids"
                        >
                          <ScaleIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {transaction.status === 'IN_PROGRESS' && !transaction.payment && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedTransactionId(transaction.id)
                            setPaymentDialogOpen(true)
                          }}
                          className="flex items-center gap-2"
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          <span>Payer</span>
                        </Button>
                      )}
                      {transaction.status === 'COMPLETED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Voir le reçu"
                        >
                          <Link href={`/transactions/${transaction.id}/receipt`}>
                            <PrinterIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} sur {pagination.totalPages} - {pagination.total} transactions
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>

      {selectedTransactionId && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          transactionId={selectedTransactionId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}