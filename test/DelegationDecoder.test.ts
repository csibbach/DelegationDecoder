import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import type { Hex } from "viem"

import {
  asTransactionHash,
  DELEGATION_MANAGER_V1_3_0,
  DelegationDecoder,
  InvalidTransactionError,
  UnsupportedChainError,
} from "../src/index.js"
import { createMockPublicClient } from "./helpers/mockPublicClient.js"

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures")

type Fixture = {
  hash: Hex
  chainId: number
  transaction: {
    to: Hex
    input: Hex
    hash: Hex
    from: Hex
  }
  expectedDelegations: unknown
}

function loadFixtures(): Fixture[] {
  return readdirSync(fixturesDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(fixturesDir, name), "utf8")) as Fixture)
}

describe("DelegationDecoder.getDelegationsForTransaction", () => {
  const fixtures = loadFixtures()

  it("loads the expected redeemDelegations fixtures", () => {
    expect(fixtures).toHaveLength(4)
  })

  it.each(fixtures)("decodes fixture $chainId-$hash", async (fixture) => {
    const client = createMockPublicClient({
      chainId: fixture.chainId,
      transactions: new Map([
        [
          fixture.hash,
          {
            to: fixture.transaction.to,
            input: fixture.transaction.input,
            hash: fixture.transaction.hash,
            from: fixture.transaction.from,
          },
        ],
      ]),
    })

    const decoder = new DelegationDecoder({ publicClient: client })
    const result = await decoder.getDelegationsForTransaction(asTransactionHash(fixture.hash))

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual(fixture.expectedDelegations)
    }
  })

  it("returns InvalidTransactionError when the transaction is missing", async () => {
    const hash = asTransactionHash(
      "0x00000000000000000000000000000000000000000000000000000000000000aa",
    )
    const client = createMockPublicClient({ chainId: 1, transactions: new Map() })
    const decoder = new DelegationDecoder({ publicClient: client })

    const result = await decoder.getDelegationsForTransaction(hash)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(InvalidTransactionError)
      expect(result.error.message).toMatch(/transaction not found/i)
    }
  })

  it("returns InvalidTransactionError when to is not the DelegationManager", async () => {
    const fixture = fixtures[0]!
    const hash = asTransactionHash(fixture.hash)
    const client = createMockPublicClient({
      chainId: fixture.chainId,
      transactions: new Map([
        [
          fixture.hash,
          {
            to: "0x0000000000000000000000000000000000000001",
            input: fixture.transaction.input,
          },
        ],
      ]),
    })
    const decoder = new DelegationDecoder({ publicClient: client })

    const result = await decoder.getDelegationsForTransaction(hash)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(InvalidTransactionError)
      expect(result.error.message).toMatch(/not to the DelegationManager/i)
    }
  })

  it("returns InvalidTransactionError when calldata is not redeemDelegations", async () => {
    const hash = asTransactionHash(
      "0x00000000000000000000000000000000000000000000000000000000000000bb",
    )
    const client = createMockPublicClient({
      chainId: 1,
      transactions: new Map([
        [
          hash,
          {
            to: DELEGATION_MANAGER_V1_3_0,
            // pause() selector on DelegationManager — not redeemDelegations
            input: "0x8456cb59",
          },
        ],
      ]),
    })
    const decoder = new DelegationDecoder({ publicClient: client })

    const result = await decoder.getDelegationsForTransaction(hash)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(InvalidTransactionError)
      expect(result.error.message).toMatch(/not a redeemDelegations call/i)
    }
  })

  it("returns UnsupportedChainError for an unknown chainId", async () => {
    const fixture = fixtures[0]!
    const client = createMockPublicClient({
      chainId: 999999,
      transactions: new Map([
        [
          fixture.hash,
          {
            to: fixture.transaction.to,
            input: fixture.transaction.input,
          },
        ],
      ]),
    })
    const decoder = new DelegationDecoder({ publicClient: client })

    const result = await decoder.getDelegationsForTransaction(asTransactionHash(fixture.hash))

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnsupportedChainError)
      expect((result.error as UnsupportedChainError).chainId).toBe(999999)
    }
  })
})
