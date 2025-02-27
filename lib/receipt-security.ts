import { createHash } from 'crypto';

interface Transaction {
  id: string;
  entryTime: string;
  exitTime: string;
  sandWeight: number;
  totalWeight: number;
  truck: {
    licensePlate: string;
    emptyWeight: number;
    driver: {
      name: string;
    };
  };
  client: {
    name: string;
    company: string | null;
    email: string | null;
  };
  payment: {
    amount: number;
    method: 'CASH' | 'BANK_TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    bankReference?: string;
  };
}

export function generateReceiptHash(transaction: Transaction): string {
  const dataToHash = JSON.stringify({
    id: transaction.id,
    entryTime: transaction.entryTime,
    exitTime: transaction.exitTime,
    sandWeight: transaction.sandWeight,
    totalWeight: transaction.totalWeight,
    truck: {
      licensePlate: transaction.truck.licensePlate,
      emptyWeight: transaction.truck.emptyWeight,
      driverName: transaction.truck.driver.name,
    },
    client: {
      name: transaction.client.name,
      company: transaction.client.company,
    },
    payment: {
      amount: transaction.payment.amount,
      method: transaction.payment.method,
      status: transaction.payment.status,
      bankReference: transaction.payment.bankReference,
    },
  });

  return createHash('sha256').update(dataToHash).digest('hex');
}

export function verifyReceiptIntegrity(
  transaction: Transaction,
  storedHash: string
): boolean {
  const currentHash = generateReceiptHash(transaction);
  return currentHash === storedHash;
}