"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Receipt } from "@/components/transactions/receipt"

export default function ReceiptPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${params.id}/receipt`)
        if (!response.ok) throw new Error("Failed to fetch transaction")
        const data = await response.json()
        setTransaction(data)
      } catch (error) {
        console.error("Error fetching transaction:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTransaction()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Transaction non trouvée</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Receipt transaction={transaction} />
    </div>
  )
}