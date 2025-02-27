"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  company: string | null
}

interface Truck {
  id: string
  licensePlate: string
  emptyWeight: number
  driver: {
    name: string
  }
}

const transactionFormSchema = z.object({
  truckId: z.string({
    required_error: "Veuillez sélectionner un camion",
  }),
  clientId: z.string({
    required_error: "Veuillez sélectionner un client",
  })
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransactionDialog({
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const { toast } = useToast()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      totalWeight: null,
      sandWeight: null,
    },
  })

  useEffect(() => {
    if (open) {
      fetchClients()
      fetchTrucks()
    }
  }, [open])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (!response.ok) throw new Error("Erreur lors du chargement des clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive",
      })
    }
  }

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
    }
  }

  const calculateSandWeight = (totalWeight: number, truckId: string) => {
    const truck = trucks.find(t => t.id === truckId)
    if (!truck || totalWeight === null || totalWeight === undefined) return null

    const sandWeight = totalWeight - truck.emptyWeight
    return sandWeight > 0 ? Number(sandWeight.toFixed(2)) : null
  }

  const handleTotalWeightChange = (value: number | null) => {
    const truckId = form.getValues('truckId')
    if (!truckId) {
      form.setError('truckId', {
        type: 'manual',
        message: 'Veuillez d\'abord sélectionner un camion'
      })
      return
    }

    if (value !== null) {
      const truck = trucks.find(t => t.id === truckId)
      if (truck) {
        if (value < truck.emptyWeight) {
          form.setError('totalWeight', {
            type: 'manual',
            message: `Le poids total doit être supérieur au poids à vide du camion (${truck.emptyWeight} T)`
          })
          form.setValue('sandWeight', null)
        } else {
          form.clearErrors('totalWeight')
          const sandWeight = calculateSandWeight(value, truckId)
          form.setValue('sandWeight', sandWeight)
        }
      }
    } else {
      form.setValue('sandWeight', null)
    }
  }

  const handleTruckChange = (truckId: string) => {
    const totalWeight = form.getValues('totalWeight')
    if (totalWeight !== null) {
      handleTotalWeightChange(totalWeight)
    }
  }

  async function onSubmit(data: TransactionFormValues) {
    if (!data.truckId) {
      form.setError('truckId', {
        type: 'manual',
        message: 'Veuillez sélectionner un camion'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la transaction")
      }

      toast({
        title: "Succès",
        description: "La transaction a été créée avec succès",
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Transaction</DialogTitle>
          <DialogDescription>
            Créez une nouvelle transaction de transport de sable.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                          {client.company && ` (${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="truckId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camion</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un camion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.driver.name} ({truck.emptyWeight} T)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Créer la transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}