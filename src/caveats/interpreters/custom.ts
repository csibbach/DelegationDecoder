import { decodeAbiParameters, type Address, type Hex } from 'viem'

import { CaveatTermsDecodeError } from '../../errors.js'
import { HexUtils } from '../HexUtils.js'
import type { EnforcerType } from '../types.js'
import type { DecodeResult } from './stock.js'

/** Mirrors ChainlinkPriceRuleLib.Terms (68 bytes packed). */
export type ChainlinkPriceRuleTerms = {
  priceFeed: Address
  ruleKind: number
  expectedDecimals: number
  windowSeconds: number
  thresholdBps: number
  maxStaleSeconds: number
  minGapSeconds: number
  triggerPrice: bigint
}

export type ChainlinkPriceRuleArgs = {
  referenceRoundId: number
}

/** Mirrors LiFiSwapQuoteLib.Terms (284 bytes packed). */
export type LiFiSwapTerms = {
  lifiDiamond: Address
  inputToken: Address
  outputAssetId: Hex
  outputRecipient: Hex
  destinationChainId: bigint
  quoteSigner: Address
  periodAmount: bigint
  periodDuration: bigint
  startDate: bigint
  slippageBps: bigint
}

export type LiFiSignedQuote = {
  delegator: Address
  lifiDiamond: Address
  inputToken: Address
  outputAssetId: Hex
  outputRecipient: Hex
  destinationChainId: bigint
  inputAmount: bigint
  expectedAmountOut: bigint
  minAmountOut: bigint
  calldataHash: Hex
  expiration: bigint
}

export type LiFiSwapArgs = {
  routeKind: number
  quote: LiFiSignedQuote
  signature: Hex
}

export type Erc20BalanceChangeSafeTerms = {
  enforceDecrease: boolean
  token: Address
  recipient: Address
  amount: bigint
}

export type Erc20BalanceLimitTerms = {
  enforceLowerLimit: boolean
  token: Address
  amount: bigint
}

function decodeChainlinkTerms(terms: Hex): ChainlinkPriceRuleTerms {
  HexUtils.requireLength(terms, 68, 'chainlinkPriceRule')
  return {
    priceFeed: HexUtils.readAddress(terms, 0),
    ruleKind: HexUtils.readUint8(terms, 20),
    expectedDecimals: HexUtils.readUint8(terms, 21),
    windowSeconds: HexUtils.readUint32(terms, 22),
    thresholdBps: HexUtils.readUint16(terms, 26),
    maxStaleSeconds: HexUtils.readUint32(terms, 28),
    minGapSeconds: HexUtils.readUint32(terms, 32),
    triggerPrice: HexUtils.readInt256(terms, 36),
  }
}

function decodeChainlinkArgs(args: Hex): ChainlinkPriceRuleArgs | null {
  if (args === '0x' || args === '0x00' || HexUtils.byteLength(args) === 0) {
    return null
  }
  try {
    const [referenceRoundId] = decodeAbiParameters([{ type: 'uint80' }], args)
    return { referenceRoundId: Number(referenceRoundId) }
  } catch (cause) {
    throw new CaveatTermsDecodeError(
      'chainlinkPriceRule',
      cause instanceof Error ? cause.message : String(cause),
    )
  }
}

function decodeLiFiTerms(terms: Hex): LiFiSwapTerms {
  HexUtils.requireLength(terms, 284, 'lifiSwap')
  return {
    lifiDiamond: HexUtils.readAddress(terms, 0),
    inputToken: HexUtils.readAddress(terms, 20),
    outputAssetId: HexUtils.readBytes32(terms, 40),
    outputRecipient: HexUtils.readBytes32(terms, 72),
    destinationChainId: HexUtils.readUint256(terms, 104),
    quoteSigner: HexUtils.readAddress(terms, 136),
    periodAmount: HexUtils.readUint256(terms, 156),
    periodDuration: HexUtils.readUint256(terms, 188),
    startDate: HexUtils.readUint256(terms, 220),
    slippageBps: HexUtils.readUint256(terms, 252),
  }
}

function decodeLiFiArgs(args: Hex): LiFiSwapArgs | null {
  if (args === '0x' || args === '0x00' || HexUtils.byteLength(args) === 0) {
    return null
  }
  try {
    const [routeKind, quote, signature] = decodeAbiParameters(
      [
        { type: 'uint8' },
        {
          type: 'tuple',
          components: [
            { name: 'delegator', type: 'address' },
            { name: 'lifiDiamond', type: 'address' },
            { name: 'inputToken', type: 'address' },
            { name: 'outputAssetId', type: 'bytes32' },
            { name: 'outputRecipient', type: 'bytes32' },
            { name: 'destinationChainId', type: 'uint256' },
            { name: 'inputAmount', type: 'uint256' },
            { name: 'expectedAmountOut', type: 'uint256' },
            { name: 'minAmountOut', type: 'uint256' },
            { name: 'calldataHash', type: 'bytes32' },
            { name: 'expiration', type: 'uint256' },
          ],
        },
        { type: 'bytes' },
      ],
      args,
    )
    return {
      routeKind: Number(routeKind),
      quote: quote as LiFiSignedQuote,
      signature: signature as Hex,
    }
  } catch (cause) {
    throw new CaveatTermsDecodeError(
      'lifiSwap',
      cause instanceof Error ? cause.message : String(cause),
    )
  }
}

function decodeErc20BalanceChangeSafe(terms: Hex): Erc20BalanceChangeSafeTerms {
  HexUtils.requireLength(terms, 73, 'erc20BalanceChangeSafe')
  return {
    enforceDecrease: HexUtils.readUint8(terms, 0) !== 0,
    token: HexUtils.readAddress(terms, 1),
    recipient: HexUtils.readAddress(terms, 21),
    amount: HexUtils.readUint256(terms, 41),
  }
}

function decodeErc20BalanceLimit(terms: Hex): Erc20BalanceLimitTerms {
  HexUtils.requireLength(terms, 53, 'erc20BalanceLimit')
  return {
    enforceLowerLimit: HexUtils.readUint8(terms, 0) !== 0,
    token: HexUtils.readAddress(terms, 1),
    amount: HexUtils.readUint256(terms, 21),
  }
}

export const customDecoders: Partial<
  Record<EnforcerType, (terms: Hex, args: Hex) => DecodeResult>
> = {
  chainlinkPriceRule: (terms, args) => ({
    decodedTerms: decodeChainlinkTerms(terms),
    decodedArgs: decodeChainlinkArgs(args),
  }),
  lifiSwap: (terms, args) => ({
    decodedTerms: decodeLiFiTerms(terms),
    decodedArgs: decodeLiFiArgs(args),
  }),
  erc20BalanceChangeSafe: (terms) => ({
    decodedTerms: decodeErc20BalanceChangeSafe(terms),
    decodedArgs: null,
  }),
  erc20BalanceLimit: (terms) => ({
    decodedTerms: decodeErc20BalanceLimit(terms),
    decodedArgs: null,
  }),
}
