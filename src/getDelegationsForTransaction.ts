import type { Delegation } from '@metamask/smart-accounts-kit'
import { errAsync, type ResultAsync } from 'neverthrow'
import type { PublicClient } from 'viem'

import { NotImplementedError, type TransactionHash } from './types.js'

/**
 * Fetch and decode the MetaMask Delegation Framework delegations used in a transaction.
 *
 * Stub: RPC fetch and calldata decoding are not implemented yet.
 */
export function getDelegationsForTransaction(
  _publicClient: PublicClient,
  _transactionHash: TransactionHash,
): ResultAsync<Delegation[], Error> {
  return errAsync(
    new NotImplementedError(
      'getDelegationsForTransaction is not implemented yet; decoding from on-chain data is forthcoming',
    ),
  )
}
