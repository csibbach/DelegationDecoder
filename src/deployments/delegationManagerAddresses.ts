import type { Address } from "viem"

import { asEvmContractAddress, type EvmContractAddress } from "../types.js"

/**
 * MetaMask Delegation Framework v1.3.0 DelegationManager (CREATE2, same on all listed chains).
 * @see https://github.com/MetaMask/delegation-framework/blob/main/documents/Deployments.md
 */
export const DELEGATION_MANAGER_V1_3_0 = asEvmContractAddress(
  "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3",
)

/**
 * Chain IDs where the v1.3.0 Delegation Framework is deployed (or expected via CREATE2).
 * Includes MetaMask kit-known chains plus Arc mainnet/testnet (not yet in the kit environment).
 */
const DELEGATION_MANAGER_CHAIN_IDS: readonly number[] = [
  // Mainnets
  1, // Ethereum
  10, // Optimism
  56, // BNB Smart Chain
  100, // Gnosis
  130, // Unichain
  137, // Polygon
  146, // Sonic
  1329, // Sei
  2020, // Ronin
  5000, // Mantle
  8453, // Base
  42161, // Arbitrum One
  42170, // Arbitrum Nova
  42220, // Celo
  57073, // Ink
  59144, // Linea
  80094, // Berachain
  10143, // Monad
  5042, // Arc
  // Testnets
  1301, // Unichain Sepolia
  59141, // Linea Sepolia
  80002, // Polygon Amoy
  84532, // Base Sepolia
  421614, // Arbitrum Sepolia
  11155111, // Ethereum Sepolia
  11155420, // Optimism Sepolia
  5042002, // Arc Testnet
]

function buildDelegationManagerAddresses(): ReadonlyMap<number, EvmContractAddress> {
  const map = new Map<number, EvmContractAddress>()
  for (const chainId of DELEGATION_MANAGER_CHAIN_IDS) {
    map.set(chainId, DELEGATION_MANAGER_V1_3_0)
  }
  return map
}

/**
 * Default map of chainId → DelegationManager address (v1.3.0).
 */
export const DEFAULT_DELEGATION_MANAGER_ADDRESSES: ReadonlyMap<number, EvmContractAddress> =
  buildDelegationManagerAddresses()

export function getDelegationManagerAddress(
  chainId: number,
  addresses: ReadonlyMap<number, Address> = DEFAULT_DELEGATION_MANAGER_ADDRESSES,
): Address | undefined {
  return addresses.get(chainId)
}
