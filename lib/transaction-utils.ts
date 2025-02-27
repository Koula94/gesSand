import { Transaction, PaymentStatus, PaymentMethod } from '@prisma/client'

// Constants for business rules
const MINIMUM_SAND_WEIGHT = 0.5 // Tons
const MAXIMUM_SAND_WEIGHT = 30 // Tons
const PRICE_PER_TON = 150 // DH per ton
const MINIMUM_EMPTY_WEIGHT = 2 // Tons
const MAXIMUM_TOTAL_WEIGHT = 40 // Tons

// Validate truck empty weight
export function validateEmptyWeight(emptyWeight: number): string | null {
  if (emptyWeight < MINIMUM_EMPTY_WEIGHT) {
    return `Le poids à vide du camion doit être supérieur à ${MINIMUM_EMPTY_WEIGHT} tonnes`
  }
  return null
}

// Validate total weight
export function validateTotalWeight(totalWeight: number, emptyWeight: number): string | null {
  if (totalWeight <= emptyWeight) {
    return 'Le poids total doit être supérieur au poids à vide'
  }
  if (totalWeight > MAXIMUM_TOTAL_WEIGHT) {
    return `Le poids total ne peut pas dépasser ${MAXIMUM_TOTAL_WEIGHT} tonnes`
  }
  return null
}

// Calculate sand weight
export function calculateSandWeight(totalWeight: number, emptyWeight: number): number {
  return totalWeight - emptyWeight
}

// Validate sand weight
export function validateSandWeight(sandWeight: number): string | null {
  if (sandWeight < MINIMUM_SAND_WEIGHT) {
    return `Le poids du sable doit être supérieur à ${MINIMUM_SAND_WEIGHT} tonnes`
  }
  if (sandWeight > MAXIMUM_SAND_WEIGHT) {
    return `Le poids du sable ne peut pas dépasser ${MAXIMUM_SAND_WEIGHT} tonnes`
  }
  return null
}

// Calculate payment amount
export function calculatePaymentAmount(sandWeight: number): number {
  return sandWeight * PRICE_PER_TON
}

// Validate payment method and bank reference
export function validatePayment(
  method: PaymentMethod,
  bankReference?: string
): string | null {
  if (method === 'BANK_TRANSFER' && !bankReference) {
    return 'La référence bancaire est requise pour les paiements par virement'
  }
  return null
}

// Calculate duration of transaction
export function calculateDuration(entryTime: Date, exitTime: Date): number {
  return Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60)) // Duration in minutes
}

// Validate transaction duration
export function validateDuration(duration: number): string | null {
  if (duration < 0) {
    return 'L\'heure de sortie doit être postérieure à l\'heure d\'entrée'
  }
  if (duration > 24 * 60) { // More than 24 hours
    return 'La durée de la transaction ne peut pas dépasser 24 heures'
  }
  return null
}

// Complete transaction validation
export function validateTransaction(transaction: {
  entryTime: Date
  exitTime: Date
  totalWeight: number
  truck: { emptyWeight: number }
  payment: { method: PaymentMethod; bankReference?: string }
}): string | null {
  // Validate weights
  const emptyWeightError = validateEmptyWeight(transaction.truck.emptyWeight)
  if (emptyWeightError) return emptyWeightError

  const totalWeightError = validateTotalWeight(
    transaction.totalWeight,
    transaction.truck.emptyWeight
  )
  if (totalWeightError) return totalWeightError

  const sandWeight = calculateSandWeight(
    transaction.totalWeight,
    transaction.truck.emptyWeight
  )
  const sandWeightError = validateSandWeight(sandWeight)
  if (sandWeightError) return sandWeightError

  // Validate duration
  const duration = calculateDuration(transaction.entryTime, transaction.exitTime)
  const durationError = validateDuration(duration)
  if (durationError) return durationError

  // Validate payment
  const paymentError = validatePayment(
    transaction.payment.method,
    transaction.payment.bankReference
  )
  if (paymentError) return paymentError

  return null
}