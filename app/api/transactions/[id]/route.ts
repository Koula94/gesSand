import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
        status: body.status,
        sandWeight: body.sandWeight,
        totalWeight: body.totalWeight,
        payment: body.payment ? {
          create: {
            amount: body.payment.amount,
            method: body.payment.method,
            status: body.payment.status,
            bankReference: body.payment.bankReference
          },
        } : undefined,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[TRANSACTION_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}