import type { Brand } from "ts-brand"
import type { Hash } from "viem"

/**
 * A 32-byte transaction hash, branded so callers cannot pass arbitrary hex by accident.
 */
export type TransactionHash = Brand<Hash, "TransactionHash">

/**
 * Narrow a Viem `Hash` (or compatible hex string) to a branded `TransactionHash`.
 */
export function asTransactionHash(hash: Hash): TransactionHash {
  return hash as TransactionHash
}

export class NotImplementedError extends Error {
  override readonly name = "NotImplementedError"

  constructor(message = "Not implemented") {
    super(message)
  }
}
