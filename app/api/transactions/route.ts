import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || undefined
    const sortBy = searchParams.get('sortBy')
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' || 'desc'
    const skip = (page - 1) * limit

    const where = {
      AND: [
        { truckId: { not: undefined } },
        { clientId: { not: undefined } },
        status ? { status } : {},
        search ? {
          OR: [
            { truck: { licensePlate: { contains: search, mode: 'insensitive' } } },
            { truck: { driver: { name: { contains: search, mode: 'insensitive' } } } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { client: { company: { contains: search, mode: 'insensitive' } } }
          ]
        } : {}
      ]
    }

    const orderBy = sortBy ? {
      [sortBy]: sortDirection
    } : {
      createdAt: 'desc' as const
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          truck: {
            select: {
              id: true,
              licensePlate: true,
              emptyWeight: true,
              driver: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              company: true
            }
          },
          payment: true
        },
        orderBy
      }),
      prisma.transaction.count({ where })
    ]);
    
    return NextResponse.json({
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    
    // Verify that truck and client exist
    const [truck, client] = await Promise.all([
      prisma.truck.findUnique({
        where: { id: json.truckId },
        include: { driver: true },
      }),
      prisma.client.findUnique({
        where: { id: json.clientId },
      }),
    ])

    if (!truck) {
      return NextResponse.json(
        { error: "Truck not found" },
        { status: 404 }
      )
    }

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        truckId: json.truckId,
        clientId: json.clientId,
        entryTime: new Date(),
        status: "PENDING",
      },
      include: {
        truck: {
          include: {
            driver: true,
          },
        },
        client: true,
        payment: true,
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Error creating transaction" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()
    
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    // Verify transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    const json = await request.json()
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        exitTime: json.exitTime,
        sandWeight: json.sandWeight,
        totalWeight: json.totalWeight,
        status: json.status,
        payment: json.payment ? {
          create: {
            amount: json.payment.amount,
            method: json.payment.method,
            status: json.payment.status,
            bankReference: json.payment.bankReference,
          },
        } : undefined,
      },
      include: {
        truck: {
          include: {
            driver: true,
          },
        },
        client: true,
        payment: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Error updating transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()
    
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { error: "Error deleting transaction" },
      { status: 500 }
    )
  }
}
