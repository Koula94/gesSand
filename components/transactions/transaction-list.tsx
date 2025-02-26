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
import { EditIcon, TrashIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Transaction {
  id: string
  truck: {
    licensePlate: string
    driver: {
      name: string
    }
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
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      if (!response.ok) throw new Error("Erreur lors du chargement des transactions")
      const data = await response.json()
      setTransactions(data)
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

  const getPaymentStatusColor = (status: Transaction['payment']['status']) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Camion</TableHead>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Entrée</TableHead>
            <TableHead>Sortie</TableHead>
            <TableHead>Poids Sable (T)</TableHead>
            <TableHead>Poids Total (T)</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Statut</TableHead>
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
                <TableCell>{transaction.truck.licensePlate}</TableCell>
                <TableCell>{transaction.truck.driver.name}</TableCell>
                <TableCell>
                  {transaction.client.name}
                  {transaction.client.company && (
                    <span className="block text-sm text-muted-foreground">
                      {transaction.client.company}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.entryTime), "dd/MM/yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>
                  {transaction.exitTime
                    ? format(new Date(transaction.exitTime), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "-"}
                </TableCell>
                <TableCell>{transaction.sandWeight?.toFixed(2) || "-"}</TableCell>
                <TableCell>{transaction.totalWeight?.toFixed(2) || "-"}</TableCell>
                <TableCell>
                  {transaction.payment ? (
                    <div className="space-y-1">
                      <div>{transaction.payment.amount.toFixed(2)} DH</div>
                      <Badge variant={getPaymentStatusColor(transaction.payment.status)}>
                        {transaction.payment.method === 'CASH' ? 'Espèces' : 'Banque'}
                      </Badge>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(transaction.status)}>
                    {{
                      PENDING: 'En Attente',
                      IN_PROGRESS: 'En Cours',
                      COMPLETED: 'Terminée',
                      CANCELLED: 'Annulée'
                    }[transaction.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {}}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(transaction.id)}
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
  )
}