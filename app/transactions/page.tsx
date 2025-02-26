"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeftIcon, PlusIcon } from "lucide-react"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

export default function TransactionsPage() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRightLeftIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold">Gestion des Transactions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setAddTransactionOpen(true)}
            className="space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Transaction</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList />
          </CardContent>
        </Card>

        <AddTransactionDialog
          open={addTransactionOpen}
          onOpenChange={setAddTransactionOpen}
        />
      </main>
    </div>
  )
}