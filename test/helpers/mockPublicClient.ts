import type { Address, Hash, Hex, PublicClient, Transaction } from "viem"

export type MockTransaction = {
  to: Address | null
  input: Hex
  hash?: Hash
  from?: Address
}

/**
 * Minimal PublicClient stand-in for unit tests (no network).
 */
export function createMockPublicClient(options: {
  chainId: number
  transactions?: ReadonlyMap<Hash, MockTransaction | null>
}): PublicClient {
  const transactions = options.transactions ?? new Map()

  return {
    chain: { id: options.chainId },
    getTransaction: async ({ hash }: { hash: Hash }) => {
      if (!transactions.has(hash)) {
        const { TransactionNotFoundError } = await import("viem")
        throw new TransactionNotFoundError({ hash })
      }
      const tx = transactions.get(hash)
      if (tx === null || tx === undefined) {
        const { TransactionNotFoundError } = await import("viem")
        throw new TransactionNotFoundError({ hash })
      }
      return {
        to: tx.to,
        input: tx.input,
        hash: tx.hash ?? hash,
        from: tx.from ?? "0x0000000000000000000000000000000000000001",
      } as Transaction
    },
  } as unknown as PublicClient
}
