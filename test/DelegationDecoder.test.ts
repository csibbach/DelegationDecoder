import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

import { asTransactionHash, DelegationDecoder, NotImplementedError } from "../src/index.js"

describe("DelegationDecoder", () => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  it("constructs with a public client", () => {
    const decoder = new DelegationDecoder({ publicClient })

    expect(decoder).toBeInstanceOf(DelegationDecoder)
    expect(typeof decoder.getDelegationsForTransaction).toBe("function")
  })

  it("stub returns NotImplementedError", async () => {
    const decoder = new DelegationDecoder({ publicClient })
    const hash = asTransactionHash(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    )

    const result = await decoder.getDelegationsForTransaction(hash)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NotImplementedError)
      expect(result.error.message).toMatch(/not implemented/i)
    }
  })
})
