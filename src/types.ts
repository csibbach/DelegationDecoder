import type { Brand } from "ts-brand"
import type { Address, Hash } from "viem"

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

/**
 * An EVM contract address, branded for use in deployment maps.
 */
export type EvmContractAddress = Brand<Address, "EvmContractAddress">

/**
 * Narrow a Viem `Address` to a branded `EvmContractAddress`.
 */
export function asEvmContractAddress(address: Address): EvmContractAddress {
  return address as EvmContractAddress
}
