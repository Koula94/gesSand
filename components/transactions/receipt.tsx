"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Printer as PrinterIcon, Mail as MailIcon, Shield as ShieldIcon, Info as InfoIcon } from "lucide-react"
import { generateReceiptHash } from "@/lib/receipt-security"
import { calculateFinalPrice, getPricingTierInfo } from "@/lib/weight-management"

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
    <div className="bg-gradient-to-b from-white to-gray-50 p-2 rounded-lg shadow-lg max-w-md mx-auto print:shadow-none print:bg-white border border-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="transform rotate-[-30deg] text-gray-100 text-[50px] font-bold whitespace-nowrap opacity-10 print:opacity-5">
          Sofixe Global
        </div>
      </div>
      <div className="text-center mb-2">
        <h1 className="text-base font-bold text-gray-900 mb-0.5">Reçu de Transaction</h1>
        <p className="text-blue-600 font-medium text-[10px]">#{transaction.id.slice(0, 8)}</p>
        <div className="flex items-center justify-center mt-0.5 text-[9px] text-gray-500">
          <ShieldIcon className="h-2 w-2 mr-0.5" />
          <span>Hash de sécurité: {generateReceiptHash(transaction).slice(0, 16)}...</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-2 bg-white p-1.5 rounded-md shadow-sm border border-gray-100">
        <div>
          <h2 className="font-semibold mb-0.5 text-[10px] text-gray-900">Informations Client</h2>
          <p className="text-gray-700 font-medium text-[10px]">{transaction.client.name}</p>
          {transaction.client.company && (
            <p className="text-gray-600 text-[10px]">{transaction.client.company}</p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-0.5 text-[10px] text-gray-900">Date</h2>
          <p className="text-gray-700 font-medium text-[10px]">
            {format(new Date(transaction.entryTime), "dd MMMM yyyy", {
              locale: fr,
            })}
          </p>
          <p className="text-gray-600 text-[10px]">
            {format(new Date(transaction.entryTime), "HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-1.5 rounded-md mb-2 border border-blue-100">
        <h2 className="font-semibold mb-1 text-[10px] text-gray-900">Détails de la Transaction</h2>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Camion</p>
            <p className="text-gray-900 font-medium text-[10px]">{transaction.truck.licensePlate}</p>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Chauffeur</p>
            <p className="text-gray-900 font-medium text-[10px]">{transaction.truck.driver.name}</p>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Poids à Vide</p>
            <p className="text-gray-900 font-medium text-[10px]">{transaction.truck.emptyWeight.toFixed(2)} T</p>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Poids Total</p>
            <p className="text-gray-900 font-medium text-[10px]">{transaction.totalWeight.toFixed(2)} T</p>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Poids Sable</p>
            <p className="text-gray-900 font-medium text-[10px]">{transaction.sandWeight.toFixed(2)} T</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-1.5 rounded-md mb-2 border border-green-100">
        <h2 className="font-semibold mb-1 text-[10px] text-gray-900">Paiement</h2>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Montant</p>
            <p className="text-sm font-bold text-green-600">
              {transaction.payment.amount.toFixed(2)} DH
            </p>
            <div className="mt-1 text-[8px] text-gray-500">
              {(() => {
                const priceDetails = calculateFinalPrice({
                  sandWeight: transaction.sandWeight,
                  entryTime: new Date(transaction.entryTime),
                  paymentMethod: transaction.payment.method
                })
                const tierInfo = getPricingTierInfo(transaction.sandWeight)
                return (
                  <div className="space-y-0.5">
                    <p>Prix de base: {priceDetails.basePrice.toFixed(2)} DH</p>
                    {priceDetails.peakHourSurcharge > 0 && (
                      <p>Majoration heure de pointe: +{priceDetails.peakHourSurcharge.toFixed(2)} DH</p>
                    )}
                    {priceDetails.weekendDiscount > 0 && (
                      <p>Remise weekend: -{priceDetails.weekendDiscount.toFixed(2)} DH</p>
                    )}
                    {tierInfo.nextTier && (
                      <p className="flex items-center text-blue-600">
                        <InfoIcon className="h-2 w-2 mr-0.5" />
                        {tierInfo.tonsTillNextTier?.toFixed(2)} T jusqu'au prochain palier
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm">
            <p className="text-gray-600 text-[9px] mb-0.5">Méthode</p>
            <p className="text-gray-900 font-medium text-[10px]">
              {transaction.payment.method === "CASH" ? "Espèces" : "Virement"}
            </p>
          </div>
          {transaction.payment.method === "BANK_TRANSFER" && (
            <div className="col-span-2 bg-white p-1 rounded-md shadow-sm">
              <p className="text-gray-600 text-[9px] mb-0.5">Référence Bancaire</p>
              <p className="text-gray-900 font-medium text-[10px]">{transaction.payment.bankReference}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 print:hidden">
        <Button
          variant="outline"
          className="space-x-2 hover:bg-gray-100 transition-colors"
          onClick={handlePrint}
        >
          <PrinterIcon className="h-4 w-4 text-gray-600" />
          <span>Imprimer</span>
        </Button>
        {transaction.client.email && (
          <Button
            variant="outline"
            className="space-x-2 hover:bg-blue-50 text-blue-600 border-blue-200 transition-colors"
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