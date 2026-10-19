import type { Delegation } from "@metamask/smart-accounts-kit"
import { errAsync, type ResultAsync } from "neverthrow"
import type { PublicClient } from "viem"

import { NotImplementedError, type TransactionHash } from "./types.js"

export type DelegationDecoderParams = {
  publicClient: PublicClient
}

/**
 * Decodes MetaMask Delegation Framework delegations from on-chain transactions.
 */
export class DelegationDecoder {
  readonly publicClient: PublicClient

  constructor({ publicClient }: DelegationDecoderParams) {
    this.publicClient = publicClient
  }

  /**
   * Fetch and decode the delegations used in a `redeemDelegations` transaction.
   *
   * Stub: RPC fetch and calldata decoding are not implemented yet.
   */
  getDelegationsForTransaction(
    _transactionHash: TransactionHash,
  ): ResultAsync<Delegation[], Error> {
    return errAsync(
      new NotImplementedError(
        "getDelegationsForTransaction is not implemented yet; decoding from on-chain data is forthcoming",
      ),
    )
  }
}
