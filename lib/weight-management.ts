import { PaymentMethod } from '@prisma/client'

// Advanced weight management constants
const WEIGHT_TIERS = [
  { min: 0.5, max: 5, pricePerTon: 150 },
  { min: 5.1, max: 15, pricePerTon: 140 },
  { min: 15.1, max: 30, pricePerTon: 130 }
] as const

const PEAK_HOURS = [
  { start: 8, end: 12 }, // Morning peak
  { start: 14, end: 17 } // Afternoon peak
] as const

const PEAK_HOUR_SURCHARGE = 10 // DH per ton during peak hours
const WEEKEND_DISCOUNT = 0.95 // 5% discount on weekends

// Calculate price based on weight tiers
export function calculateTieredPrice(sandWeight: number): number {
  for (const tier of WEIGHT_TIERS) {
    if (sandWeight >= tier.min && sandWeight <= tier.max) {
      return sandWeight * tier.pricePerTon
    }
  }
  throw new Error('Invalid sand weight')
}

// Check if current time is within peak hours
export function isInPeakHours(date: Date): boolean {
  const hours = date.getHours()
  return PEAK_HOURS.some(period => hours >= period.start && hours < period.end)
}

// Calculate final price with all adjustments
export function calculateFinalPrice({
  sandWeight,
  entryTime,
  paymentMethod
}: {
  sandWeight: number
  entryTime: Date
  paymentMethod: PaymentMethod
}): {
  basePrice: number
  peakHourSurcharge: number
  weekendDiscount: number
  finalPrice: number
} {
  const basePrice = calculateTieredPrice(sandWeight)
  const peakHourSurcharge = isInPeakHours(entryTime) ? sandWeight * PEAK_HOUR_SURCHARGE : 0
  const isWeekend = [0, 6].includes(entryTime.getDay())
  const weekendDiscount = isWeekend ? basePrice * (1 - WEEKEND_DISCOUNT) : 0
  
  let finalPrice = basePrice + peakHourSurcharge - weekendDiscount
  
  // Round to 2 decimal places
  finalPrice = Math.round(finalPrice * 100) / 100
  
  return {
    basePrice,
    peakHourSurcharge,
    weekendDiscount,
    finalPrice
  }
}

// Get current pricing tier information
export function getPricingTierInfo(sandWeight: number): {
  currentTier: typeof WEIGHT_TIERS[number]
  nextTier: typeof WEIGHT_TIERS[number] | null
  tonsTillNextTier: number | null
} {
  const currentTier = WEIGHT_TIERS.find(
    tier => sandWeight >= tier.min && sandWeight <= tier.max
  )
  
  if (!currentTier) {
    throw new Error('Invalid sand weight')
  }
  
  const currentTierIndex = WEIGHT_TIERS.indexOf(currentTier)
  const nextTier = currentTierIndex < WEIGHT_TIERS.length - 1 
    ? WEIGHT_TIERS[currentTierIndex + 1]
    : null
  
  const tonsTillNextTier = nextTier 
    ? Math.max(0, nextTier.min - sandWeight)
    : null
  
  return {
    currentTier,
    nextTier,
    tonsTillNextTier
  }
}