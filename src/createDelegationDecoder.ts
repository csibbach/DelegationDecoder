import type { Delegation } from '@metamask/smart-accounts-kit'
import type { ResultAsync } from 'neverthrow'
import type { PublicClient } from 'viem'

import { getDelegationsForTransaction } from './getDelegationsForTransaction.js'
import type { TransactionHash } from './types.js'

export type CreateDelegationDecoderParams = {
  publicClient: PublicClient
}

export type DelegationDecoder = {
  getDelegationsForTransaction: (
    transactionHash: TransactionHash,
  ) => ResultAsync<Delegation[], Error>
}

/**
 * Bind a Viem `PublicClient` and return the decoder API.
 */
export function createDelegationDecoder({
  publicClient,
}: CreateDelegationDecoderParams): DelegationDecoder {
  return {
    getDelegationsForTransaction: (transactionHash) =>
      getDelegationsForTransaction(publicClient, transactionHash),
  }
}
