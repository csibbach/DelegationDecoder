import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { asTransactionHash, createDelegationDecoder, NotImplementedError } from '../src/index.js'

describe('createDelegationDecoder', () => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  it('returns getDelegationsForTransaction bound to the client', () => {
    const decoder = createDelegationDecoder({ publicClient })

    expect(typeof decoder.getDelegationsForTransaction).toBe('function')
  })

  it('stub returns NotImplementedError', async () => {
    const decoder = createDelegationDecoder({ publicClient })
    const hash = asTransactionHash(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    )

    const result = await decoder.getDelegationsForTransaction(hash)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NotImplementedError)
      expect(result.error.message).toMatch(/not implemented/i)
    }
  })
})
