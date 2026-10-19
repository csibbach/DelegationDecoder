import {
  createExactExecutionTerms,
  createLimitedCallsTerms,
  createTimestampTerms,
  createValueLteTerms,
} from "@metamask/delegation-core"
import { getAddress, type Address, type Hex } from "viem"

import { CaveatTermsDecodeError, createEnforcerAddressMap, interpretCaveat } from "../src/index.js"

const EXACT_EXECUTION = getAddress("0x146713078D39eCC1F5338309c28405ccf85Abfbb")
const LIMITED_CALLS = getAddress("0x04658B29F6b82ed55274221a06Fc97D318E25416")
const TIMESTAMP = getAddress("0x1046bb45C8d673d4ea75321280DB34899413c069")
const VALUE_LTE = getAddress("0x92Bf12322527cAA612fd31a0e810472BBB106A8F")

describe("interpretCaveat", () => {
  it("decodes limitedCalls terms", () => {
    const terms = createLimitedCallsTerms({ limit: 3 })
    const result = interpretCaveat({
      enforcer: LIMITED_CALLS,
      terms,
      args: "0x00",
    })

    expect(result.type).toBe("limitedCalls")
    expect(result.decodedTerms).toEqual({ limit: 3 })
    expect(result.decodedArgs).toBeNull()
  })

  it("decodes timestamp terms", () => {
    const terms = createTimestampTerms({ afterThreshold: 10, beforeThreshold: 99 })
    const result = interpretCaveat({
      enforcer: TIMESTAMP,
      terms,
      args: "0x",
    })

    expect(result.type).toBe("timestamp")
    expect(result.decodedTerms).toEqual({ afterThreshold: 10, beforeThreshold: 99 })
  })

  it("decodes valueLte terms", () => {
    const terms = createValueLteTerms({ maxValue: 42n })
    const result = interpretCaveat({
      enforcer: VALUE_LTE,
      terms,
      args: "0x00",
    })

    expect(result.type).toBe("valueLte")
    expect(result.decodedTerms).toEqual({ maxValue: 42n })
  })

  it("decodes exactExecution terms", () => {
    const terms = createExactExecutionTerms({
      execution: {
        target: "0x1111111111111111111111111111111111111111",
        value: 0n,
        callData: "0xabcdef",
      },
    })
    const result = interpretCaveat({
      enforcer: EXACT_EXECUTION,
      terms,
      args: "0x00",
    })

    expect(result.type).toBe("exactExecution")
    expect(result.decodedTerms).toMatchObject({
      execution: {
        target: getAddress("0x1111111111111111111111111111111111111111"),
        value: 0n,
        callData: "0xabcdef",
      },
    })
  })

  it("decodes chainlinkPriceRule packed terms via custom address map", () => {
    const custom = "0x2222222222222222222222222222222222222222" as Address
    // 68-byte packed terms: feed + ruleKind + decimals + window + threshold + stale + gap + trigger
    const terms = ("0x" +
      "3333333333333333333333333333333333333333" + // priceFeed
      "00" + // ruleKind dip
      "08" + // decimals
      "00015180" + // windowSeconds 86400
      "0064" + // thresholdBps 100
      "00000e10" + // maxStaleSeconds 3600
      "0000003c" + // minGapSeconds 60
      "0000000000000000000000000000000000000000000000000000000000000064") as Hex // trigger 100

    const result = interpretCaveat(
      { enforcer: custom, terms, args: "0x00" },
      { enforcerAddresses: createEnforcerAddressMap([[custom, "chainlinkPriceRule"]]) },
    )

    expect(result.type).toBe("chainlinkPriceRule")
    expect(result.decodedTerms).toMatchObject({
      priceFeed: getAddress("0x3333333333333333333333333333333333333333"),
      ruleKind: 0,
      expectedDecimals: 8,
      windowSeconds: 86400,
      thresholdBps: 100,
      maxStaleSeconds: 3600,
      minGapSeconds: 60,
      triggerPrice: 100n,
    })
  })

  it("decodes erc20BalanceLimit packed terms via custom address map", () => {
    const custom = "0x4444444444444444444444444444444444444444" as Address
    const terms = ("0x" +
      "01" +
      "5555555555555555555555555555555555555555" +
      "00000000000000000000000000000000000000000000000000000000000000ff") as Hex

    const result = interpretCaveat(
      { enforcer: custom, terms, args: "0x00" },
      { enforcerAddresses: createEnforcerAddressMap([[custom, "erc20BalanceLimit"]]) },
    )

    expect(result.type).toBe("erc20BalanceLimit")
    expect(result.decodedTerms).toEqual({
      enforceLowerLimit: true,
      token: getAddress("0x5555555555555555555555555555555555555555"),
      amount: 255n,
    })
  })

  it("returns unknown for unmapped enforcer addresses", () => {
    const result = interpretCaveat({
      enforcer: "0x9999999999999999999999999999999999999999",
      terms: "0x1234",
      args: "0x00",
    })

    expect(result.type).toBe("unknown")
    expect(result.decodedTerms).toBeNull()
    expect(result.decodedArgs).toBeNull()
  })

  it("throws CaveatTermsDecodeError for malformed known terms", () => {
    expect(() =>
      interpretCaveat({
        enforcer: LIMITED_CALLS,
        terms: "0x01",
        args: "0x00",
      }),
    ).toThrow(CaveatTermsDecodeError)
  })
})
