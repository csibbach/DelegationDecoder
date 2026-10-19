import type { Address, Hex } from 'viem'

import { HexUtils } from '../HexUtils.js'
import type { EnforcerType } from '../types.js'
import type { DecodeResult } from './stock.js'

export type MultiOperationIncreaseBalanceTerms = {
  token: Address
  recipient: Address
  amount: bigint
}

export type NativeTokenMultiOperationIncreaseBalanceTerms = {
  recipient: Address
  amount: bigint
}

export type Erc1155MultiOperationIncreaseBalanceTerms = {
  token: Address
  recipient: Address
  tokenId: bigint
  amount: bigint
}

function decodeErc20Or721MultiOp(terms: Hex, enforcerType: EnforcerType): DecodeResult {
  HexUtils.requireLength(terms, 72, enforcerType)
  const decodedTerms: MultiOperationIncreaseBalanceTerms = {
    token: HexUtils.readAddress(terms, 0),
    recipient: HexUtils.readAddress(terms, 20),
    amount: HexUtils.readUint256(terms, 40),
  }
  return { decodedTerms, decodedArgs: null }
}

function decodeNativeMultiOp(terms: Hex): DecodeResult {
  HexUtils.requireLength(terms, 52, 'nativeTokenMultiOperationIncreaseBalance')
  const decodedTerms: NativeTokenMultiOperationIncreaseBalanceTerms = {
    recipient: HexUtils.readAddress(terms, 0),
    amount: HexUtils.readUint256(terms, 20),
  }
  return { decodedTerms, decodedArgs: null }
}

function decodeErc1155MultiOp(terms: Hex): DecodeResult {
  HexUtils.requireLength(terms, 104, 'erc1155MultiOperationIncreaseBalance')
  const decodedTerms: Erc1155MultiOperationIncreaseBalanceTerms = {
    token: HexUtils.readAddress(terms, 0),
    recipient: HexUtils.readAddress(terms, 20),
    tokenId: HexUtils.readUint256(terms, 40),
    amount: HexUtils.readUint256(terms, 72),
  }
  return { decodedTerms, decodedArgs: null }
}

export const multiOperationDecoders: Partial<
  Record<EnforcerType, (terms: Hex, args: Hex) => DecodeResult>
> = {
  erc20MultiOperationIncreaseBalance: (terms) =>
    decodeErc20Or721MultiOp(terms, 'erc20MultiOperationIncreaseBalance'),
  erc721MultiOperationIncreaseBalance: (terms) =>
    decodeErc20Or721MultiOp(terms, 'erc721MultiOperationIncreaseBalance'),
  erc1155MultiOperationIncreaseBalance: (terms) => decodeErc1155MultiOp(terms),
  nativeTokenMultiOperationIncreaseBalance: (terms) => decodeNativeMultiOp(terms),
}
