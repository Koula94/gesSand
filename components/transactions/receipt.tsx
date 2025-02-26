"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {  as PrinterIcon,  as MailIcon } from "lucide-react"

interface ReceiptProps {
  transaction: {
    id: string
    entryTime: string
    exitTime: string
    sandWeight: number
    totalWeight: number
    truck: {
      licensePlate: string
      emptyWeight: number
      driver: {
        name: string
      }
    }
    client: {
      name: string
      company: string | null
      email: string | null
    }
    payment: {
      amount: number
      method: 'CASH' | 'BANK_TRANSFER'
      status: 'PENDING' | 'COMPLETED' | 'FAILED'
      bankReference?: string
    }
  }
}

export function Receipt({ transaction }: ReceiptProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleEmailSend = async () => {
    if (!transaction.client.email) {
      alert("Le client n'a pas d'adresse email enregistrée")
      return
    }

    try {
      const response = await fetch("/api/receipts/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId: transaction.id }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'envoi du reçu")

      alert("Reçu envoyé avec succès")
    } catch (error) {
      console.error("Error sending receipt:", error)
      alert("Impossible d'envoyer le reçu")
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto print:shadow-none">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Reçu de Transaction</h1>
        <p className="text-muted-foreground">#{transaction.id.slice(0, 8)}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="font-semibold mb-2">Informations Client</h2>
          <p>{transaction.client.name}</p>
          {transaction.client.company && (
            <p className="text-muted-foreground">{transaction.client.company}</p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Date</h2>
          <p>
            {format(new Date(transaction.entryTime), "dd MMMM yyyy", {
              locale: fr,
            })}
          </p>
          <p className="text-muted-foreground">
            {format(new Date(transaction.entryTime), "HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      <div className="border-t border-b py-4 mb-8">
        <h2 className="font-semibold mb-4">Détails de la Transaction</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Camion</p>
            <p>{transaction.truck.licensePlate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Chauffeur</p>
            <p>{transaction.truck.driver.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Poids à Vide</p>
            <p>{transaction.truck.emptyWeight.toFixed(2)} T</p>
          </div>
          <div>
            <p className="text-muted-foreground">Poids Total</p>
            <p>{transaction.totalWeight.toFixed(2)} T</p>
          </div>
          <div>
            <p className="text-muted-foreground">Poids Sable</p>
            <p>{transaction.sandWeight.toFixed(2)} T</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-4">Paiement</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Montant</p>
            <p className="text-xl font-semibold">
              {transaction.payment.amount.toFixed(2)} DH
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Méthode</p>
            <p>
              {transaction.payment.method === "CASH" ? "Espèces" : "Virement"}
            </p>
          </div>
          {transaction.payment.method === "BANK_TRANSFER" && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Référence Bancaire</p>
              <p>{transaction.payment.bankReference}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 print:hidden">
        <Button
          variant="outline"
          className="space-x-2"
          onClick={handlePrint}
        >
          <PrinterIcon className="h-4 w-4" />
          <span>Imprimer</span>
        </Button>
        {transaction.client.email && (
          <Button
            variant="outline"
            className="space-x-2"
            onClick={handleEmailSend}
          >
            <MailIcon className="h-4 w-4" />
            <span>Envoyer par Email</span>
          </Button>
        )}
      </div>
    </div>
  )
}