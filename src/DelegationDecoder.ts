import { ResultAsync } from "neverthrow"
import { getAddress, TransactionNotFoundError, type Address, type PublicClient } from "viem"

import { interpretDelegations } from "./caveats/interpretDelegations.js"
import type { EnforcerAddressMap, EnforcerType, InterpretedDelegation } from "./caveats/types.js"
import { decodeRedeemDelegationsCalldata } from "./decodeRedeemDelegations.js"
import {
  DEFAULT_CAVEAT_ENFORCER_ADDRESSES,
  mergeEnforcerAddresses,
} from "./deployments/caveatEnforcerAddresses.js"
import { DEFAULT_DELEGATION_MANAGER_ADDRESSES } from "./deployments/delegationManagerAddresses.js"
import { InvalidTransactionError, UnsupportedChainError } from "./errors.js"
import type { TransactionHash } from "./types.js"

export type DelegationDecoderParams = {
  publicClient: PublicClient
  /**
   * Override the default chainId → DelegationManager address map (e.g. forks / custom deploys).
   */
  delegationManagerAddresses?: ReadonlyMap<number, Address>
  /**
   * Extra / override caveat enforcer address → type mappings (e.g. 1Shot customs).
   */
  extraEnforcerAddresses?:
    ReadonlyMap<Address, EnforcerType> | Iterable<readonly [Address, EnforcerType]>
}

/**
 * Decodes MetaMask Delegation Framework delegations from on-chain transactions.
 */
export class DelegationDecoder {
  readonly publicClient: PublicClient
  readonly delegationManagerAddresses: ReadonlyMap<number, Address>
  readonly enforcerAddresses: EnforcerAddressMap

  constructor({
    publicClient,
    delegationManagerAddresses,
    extraEnforcerAddresses,
  }: DelegationDecoderParams) {
    this.publicClient = publicClient
    this.delegationManagerAddresses =
      delegationManagerAddresses ?? DEFAULT_DELEGATION_MANAGER_ADDRESSES
    this.enforcerAddresses = mergeEnforcerAddresses(
      extraEnforcerAddresses,
      DEFAULT_CAVEAT_ENFORCER_ADDRESSES,
    )
  }

  /**
   * Fetch a transaction and decode each `redeemDelegations` permission context into
   * interpreted delegation chains (caveat terms/args decoded where known).
   */
  getDelegationsForTransaction(
    transactionHash: TransactionHash,
  ): ResultAsync<InterpretedDelegation[][], Error> {
    return ResultAsync.fromPromise(
      this.#getDelegationsForTransaction(transactionHash),
      (error): Error => (error instanceof Error ? error : new Error(String(error))),
    )
  }

  async #getDelegationsForTransaction(
    transactionHash: TransactionHash,
  ): Promise<InterpretedDelegation[][]> {
    const chainId = this.publicClient.chain?.id
    if (chainId === undefined) {
      throw new UnsupportedChainError(
        -1,
        "PublicClient must be configured with a chain (chain.id is required)",
      )
    }

    const delegationManager = this.delegationManagerAddresses.get(chainId)
    if (delegationManager === undefined) {
      throw new UnsupportedChainError(chainId)
    }

    let transaction
    try {
      transaction = await this.publicClient.getTransaction({ hash: transactionHash })
    } catch (error) {
      if (error instanceof TransactionNotFoundError) {
        throw new InvalidTransactionError(`Transaction not found: ${transactionHash}`)
      }
      throw error
    }

    if (!transaction) {
      throw new InvalidTransactionError(`Transaction not found: ${transactionHash}`)
    }

    if (!transaction.to) {
      throw new InvalidTransactionError(
        `Transaction is not to the DelegationManager: missing to address (expected ${delegationManager})`,
      )
    }

    if (getAddress(transaction.to) !== getAddress(delegationManager)) {
      throw new InvalidTransactionError(
        `Transaction is not to the DelegationManager: to=${transaction.to}, expected=${delegationManager}`,
      )
    }

    const raw = decodeRedeemDelegationsCalldata(transaction.input)
    return interpretDelegations(raw, { enforcerAddresses: this.enforcerAddresses })
  }
}
