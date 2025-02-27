"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  amount: z.string().min(1, "Le montant est requis").refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    {
      message: "Le montant doit être un nombre positif"
    }
  ),
  method: z.enum(["CASH", "BANK_TRANSFER"]),
  bankReference: z.string().optional().superRefine(
    (val, ctx) => {
      if (ctx.parent?.method === "BANK_TRANSFER") {
        if (!val || val.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La référence bancaire est requise pour les virements"
          });
        }
      }
    }
  ),
  receivedAmount: z.string().optional().superRefine(
    (val, ctx) => {
      if (ctx.parent?.method === "CASH") {
        if (!val || val.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le montant reçu est requis pour les paiements en espèces"
          });
          return;
        }

        const received = parseFloat(val);
        const amount = parseFloat(ctx.parent?.amount || "0");

        if (isNaN(received) || received < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le montant reçu doit être un nombre positif"
          });
          return;
        }

        if (received < amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le montant reçu doit être supérieur ou égal au montant à payer"
          });
        }
      }
    }
  ),
  change: z.number().optional()
})


interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  onSuccess: () => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  transactionId,
  onSuccess,
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      method: "CASH",
      bankReference: "",
      receivedAmount: "",
      change: 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: values.method === "BANK_TRANSFER" ? "IN_PROGRESS" : "COMPLETED",
          payment: {
            amount: parseFloat(values.amount),
            method: values.method,
            status: values.method === "BANK_TRANSFER" ? "PENDING" : "COMPLETED",
            bankReference: values.method === "BANK_TRANSFER" ? values.bankReference : undefined,
            receivedAmount: values.method === "CASH" ? parseFloat(values.receivedAmount || values.amount) : undefined,
            change: values.method === "CASH" ? values.change : undefined,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du paiement")
      }

      toast({
        title: "Succès",
        description: "Le paiement a été enregistré",
      })

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer le Paiement</DialogTitle>
          <DialogDescription>
            Entrez les détails du paiement pour cette transaction
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant à Payer (DH)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const amount = parseFloat(e.target.value);
                        const received = parseFloat(form.getValues("receivedAmount") || "0");
                        if (!isNaN(amount) && !isNaN(received)) {
                          form.setValue("change", received - amount);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("method") === "CASH" && (
              <>
                <FormField
                  control={form.control}
                  name="receivedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant Reçu (DH)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const amount = parseFloat(form.getValues("amount") || "0");
                            const received = parseFloat(e.target.value || "0");
                            if (!isNaN(amount) && !isNaN(received)) {
                              form.setValue("change", Math.max(0, received - amount));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-2 bg-muted rounded-md">
                  <div className="text-sm font-medium">Récapitulatif:</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Montant à payer: {parseFloat(form.watch("amount") || "0").toFixed(2)} DH
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Montant reçu: {parseFloat(form.watch("receivedAmount") || "0").toFixed(2)} DH
                  </div>
                  <div className="text-sm font-medium text-primary mt-1">
                    Monnaie à rendre: {form.watch("change")?.toFixed(2) || "0.00"} DH
                  </div>
                </div>
              </>
            )}

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de Paiement</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une méthode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Espèces</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Virement Bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("method") === "BANK_TRANSFER" && (
              <FormField
                control={form.control}
                name="bankReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence Bancaire</FormLabel>
                    <FormControl>
                      <Input placeholder="REF-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}