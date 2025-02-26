"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TruckIcon, UserIcon, PlusIcon } from "lucide-react"
import { TruckList } from "@/components/trucks/truck-list"
import { DriverList } from "@/components/trucks/driver-list"
import { AddTruckDialog } from "@/components/trucks/add-truck-dialog"
import { AddDriverDialog } from "@/components/trucks/add-driver-dialog"

export default function TrucksPage() {
  const [addTruckOpen, setAddTruckOpen] = useState(false)
  const [addDriverOpen, setAddDriverOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold">Gestion des Camions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trucks" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="trucks" className="space-x-2">
                <TruckIcon className="h-4 w-4" />
                <span>Camions</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>Chauffeurs</span>
              </TabsTrigger>
            </TabsList>

            <div className="space-x-2">
              <Button
                onClick={() => setAddTruckOpen(true)}
                className="space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Nouveau Camion</span>
              </Button>
              <Button
                onClick={() => setAddDriverOpen(true)}
                variant="outline"
                className="space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Nouveau Chauffeur</span>
              </Button>
            </div>
          </div>

          <TabsContent value="trucks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Camions</CardTitle>
              </CardHeader>
              <CardContent>
                <TruckList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Chauffeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddTruckDialog open={addTruckOpen} onOpenChange={setAddTruckOpen} />
        <AddDriverDialog open={addDriverOpen} onOpenChange={setAddDriverOpen} />
      </main>
    </div>
  )
}