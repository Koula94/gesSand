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
import { EditIcon, TrashIcon, TruckIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Driver {
  id: string
  name: string
  phone: string | null
  trucks: {
    id: string
    licensePlate: string
  }[]
  createdAt: string
}

export function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/drivers")
      if (!response.ok) throw new Error("Erreur lors du chargement des chauffeurs")
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des chauffeurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce chauffeur ?")) return

    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      setDrivers(drivers.filter(driver => driver.id !== id))
      toast({
        title: "Succès",
        description: "Le chauffeur a été supprimé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chauffeur",
        variant: "destructive",
      })
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
            <TableHead>Nom</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Camions Assignés</TableHead>
            <TableHead>Date d&apos;Ajout</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun chauffeur enregistré
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.phone || "-"}</TableCell>
                <TableCell className="space-x-1">
                  {driver.trucks.map((truck) => (
                    <Button key={truck.id} variant="outline" size="sm">
                      <TruckIcon className="h-4 w-4 mr-2" />
                      {truck.licensePlate}
                    </Button>
                  ))}
                  {driver.trucks.length === 0 && (
                    <span className="text-muted-foreground">Aucun camion</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(driver.createdAt), "dd/MM/yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(driver.id)}
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