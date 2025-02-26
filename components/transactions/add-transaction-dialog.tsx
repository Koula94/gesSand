"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const transactionFormSchema = z.object({
  truckId: z.string({
    required_error: "Veuillez sélectionner un camion",
  }),
  driverId: z.string({
    required_error: "Veuillez sélectionner un chauffeur",
  }),
  weight: z.string().min(1, "Veuillez entrer le poids"),
  price: z.string().min(1, "Veuillez entrer le prix"),
  clientId: z.string({
    required_error: "Veuillez sélectionner un client",
  }),
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

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      weight: "",
      price: "",
    },
  })

  async function onSubmit(data: TransactionFormValues) {
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
        throw new Error("Failed to create transaction")
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error creating transaction:", error)
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
                      {/* TODO: Add client options */}
                      <SelectItem value="client1">Client 1</SelectItem>
                      <SelectItem value="client2">Client 2</SelectItem>
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
                      {/* TODO: Add truck options */}
                      <SelectItem value="truck1">Camion 1</SelectItem>
                      <SelectItem value="truck2">Camion 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chauffeur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un chauffeur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* TODO: Add driver options */}
                      <SelectItem value="driver1">Chauffeur 1</SelectItem>
                      <SelectItem value="driver2">Chauffeur 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (tonnes)</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrer le poids" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (DH)</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrer le prix" type="number" {...field} />
                  </FormControl>
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
