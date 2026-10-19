import type { Delegation } from "@metamask/smart-accounts-kit"
import { ResultAsync } from "neverthrow"
import { getAddress, TransactionNotFoundError, type Address, type PublicClient } from "viem"

import { decodeRedeemDelegationsCalldata } from "./decodeRedeemDelegations.js"
import { DEFAULT_DELEGATION_MANAGER_ADDRESSES } from "./deployments/delegationManagerAddresses.js"
import { InvalidTransactionError, UnsupportedChainError } from "./errors.js"
import type { TransactionHash } from "./types.js"

export type DelegationDecoderParams = {
  publicClient: PublicClient
  /**
   * Override the default chainId → DelegationManager address map (e.g. forks / custom deploys).
   */
  delegationManagerAddresses?: ReadonlyMap<number, Address>
}

/**
 * Decodes MetaMask Delegation Framework delegations from on-chain transactions.
 */
export class DelegationDecoder {
  readonly publicClient: PublicClient
  readonly delegationManagerAddresses: ReadonlyMap<number, Address>

  constructor({ publicClient, delegationManagerAddresses }: DelegationDecoderParams) {
    this.publicClient = publicClient
    this.delegationManagerAddresses =
      delegationManagerAddresses ?? DEFAULT_DELEGATION_MANAGER_ADDRESSES
  }

  /**
   * Fetch a transaction and decode the `Delegation[]` chains from each
   * `redeemDelegations` permission context (batch entry).
   */
  getDelegationsForTransaction(
    transactionHash: TransactionHash,
  ): ResultAsync<Delegation[][], Error> {
    return ResultAsync.fromPromise(
      this.#getDelegationsForTransaction(transactionHash),
      (error): Error => (error instanceof Error ? error : new Error(String(error))),
    )
  }

  async #getDelegationsForTransaction(transactionHash: TransactionHash): Promise<Delegation[][]> {
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

    return decodeRedeemDelegationsCalldata(transaction.input)
  }
}
