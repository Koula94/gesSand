"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BuildingIcon, PlusIcon } from "lucide-react"
import { ClientList } from "@/components/clients/client-list"
import { AddClientDialog } from "@/components/clients/add-client-dialog"

export default function ClientsPage() {
  const [addClientOpen, setAddClientOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold">Gestion des Clients</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setAddClientOpen(true)}
            className="space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Client</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientList />
          </CardContent>
        </Card>

        <AddClientDialog open={addClientOpen} onOpenChange={setAddClientOpen} />
      </main>
    </div>
  )
}