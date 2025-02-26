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
import { EditIcon, TrashIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Truck {
  id: string
  licensePlate: string
  emptyWeight: number
  driver: {
    id: string
    name: string
  }
  createdAt: string
}

export function TruckList() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTrucks()
  }, [])

  const fetchTrucks = async () => {
    try {
      const response = await fetch("/api/trucks")
      if (!response.ok) throw new Error("Erreur lors du chargement des camions")
      const data = await response.json()
      setTrucks(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des camions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce camion ?")) return

    try {
      const response = await fetch(`/api/trucks/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      setTrucks(trucks.filter(truck => truck.id !== id))
      toast({
        title: "Succès",
        description: "Le camion a été supprimé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le camion",
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
            <TableHead>Immatriculation</TableHead>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Poids à Vide (T)</TableHead>
            <TableHead>Date d&apos;Ajout</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trucks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun camion enregistré
              </TableCell>
            </TableRow>
          ) : (
            trucks.map((truck) => (
              <TableRow key={truck.id}>
                <TableCell className="font-medium">{truck.licensePlate}</TableCell>
                <TableCell>{truck.driver.name}</TableCell>
                <TableCell>{truck.emptyWeight}</TableCell>
                <TableCell>
                  {format(new Date(truck.createdAt), "dd/MM/yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(truck.id)}
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