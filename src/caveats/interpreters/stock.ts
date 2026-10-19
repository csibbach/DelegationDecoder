import {
  decodeAllowedCalldataTerms,
  decodeAllowedMethodsTerms,
  decodeAllowedTargetsTerms,
  decodeApprovalRevocationTerms,
  decodeArgsEqualityCheckTerms,
  decodeBlockNumberTerms,
  decodeDeployedTerms,
  decodeERC1155BalanceChangeTerms,
  decodeERC20BalanceChangeTerms,
  decodeERC20StreamingTerms,
  decodeERC20TokenPeriodTransferTerms,
  decodeERC20TransferAmountTerms,
  decodeERC721BalanceChangeTerms,
  decodeERC721TransferTerms,
  decodeExactCalldataBatchTerms,
  decodeExactCalldataTerms,
  decodeExactExecutionBatchTerms,
  decodeExactExecutionTerms,
  decodeIdTerms,
  decodeLimitedCallsTerms,
  decodeLogicalOrWrapperArgs,
  decodeLogicalOrWrapperTerms,
  decodeMultiTokenPeriodTerms,
  decodeNativeBalanceChangeTerms,
  decodeNativeTokenPaymentTerms,
  decodeNativeTokenPeriodTransferTerms,
  decodeNativeTokenStreamingTerms,
  decodeNativeTokenTransferAmountTerms,
  decodeNonceTerms,
  decodeOwnershipTransferTerms,
  decodeRedeemerTerms,
  decodeSpecificActionERC20TransferBatchTerms,
  decodeTimestampTerms,
  decodeValueLteTerms,
} from "@metamask/delegation-core"
import type { Hex } from "viem"

import { CaveatTermsDecodeError } from "../../errors.js"
import type { EnforcerType } from "../types.js"

export type DecodeResult = {
  decodedTerms: unknown
  decodedArgs: unknown | null
}

function wrap(
  enforcerType: EnforcerType,
  decodeTerms: (terms: Hex) => unknown,
  decodeArgs?: (args: Hex) => unknown,
): (terms: Hex, args: Hex) => DecodeResult {
  return (terms, args) => {
    try {
      const decodedTerms = decodeTerms(terms)
      const decodedArgs = decodeArgs && args !== "0x" && args !== "0x00" ? decodeArgs(args) : null
      return { decodedTerms, decodedArgs }
    } catch (cause) {
      throw new CaveatTermsDecodeError(
        enforcerType,
        cause instanceof Error ? cause.message : String(cause),
      )
    }
  }
}

export const stockDecoders: Partial<Record<EnforcerType, (terms: Hex, args: Hex) => DecodeResult>> =
  {
    allowedCalldata: wrap("allowedCalldata", decodeAllowedCalldataTerms),
    allowedMethods: wrap("allowedMethods", decodeAllowedMethodsTerms),
    allowedTargets: wrap("allowedTargets", decodeAllowedTargetsTerms),
    approvalRevocation: wrap("approvalRevocation", decodeApprovalRevocationTerms),
    argsEqualityCheck: wrap("argsEqualityCheck", decodeArgsEqualityCheckTerms),
    blockNumber: wrap("blockNumber", decodeBlockNumberTerms),
    deployed: wrap("deployed", decodeDeployedTerms),
    erc1155BalanceChange: wrap("erc1155BalanceChange", decodeERC1155BalanceChangeTerms),
    erc20BalanceChange: wrap("erc20BalanceChange", decodeERC20BalanceChangeTerms),
    erc20PeriodTransfer: wrap("erc20PeriodTransfer", decodeERC20TokenPeriodTransferTerms),
    erc20Streaming: wrap("erc20Streaming", decodeERC20StreamingTerms),
    erc20TransferAmount: wrap("erc20TransferAmount", decodeERC20TransferAmountTerms),
    erc721BalanceChange: wrap("erc721BalanceChange", decodeERC721BalanceChangeTerms),
    erc721Transfer: wrap("erc721Transfer", decodeERC721TransferTerms),
    exactCalldata: wrap("exactCalldata", decodeExactCalldataTerms),
    exactCalldataBatch: wrap("exactCalldataBatch", decodeExactCalldataBatchTerms),
    exactExecution: wrap("exactExecution", decodeExactExecutionTerms),
    exactExecutionBatch: wrap("exactExecutionBatch", decodeExactExecutionBatchTerms),
    id: wrap("id", decodeIdTerms),
    limitedCalls: wrap("limitedCalls", decodeLimitedCallsTerms),
    logicalOrWrapper: wrap(
      "logicalOrWrapper",
      decodeLogicalOrWrapperTerms,
      decodeLogicalOrWrapperArgs,
    ),
    multiTokenPeriod: wrap("multiTokenPeriod", decodeMultiTokenPeriodTerms),
    nativeBalanceChange: wrap("nativeBalanceChange", decodeNativeBalanceChangeTerms),
    nativeTokenPayment: wrap("nativeTokenPayment", decodeNativeTokenPaymentTerms),
    nativeTokenPeriodTransfer: wrap(
      "nativeTokenPeriodTransfer",
      decodeNativeTokenPeriodTransferTerms,
    ),
    nativeTokenStreaming: wrap("nativeTokenStreaming", decodeNativeTokenStreamingTerms),
    nativeTokenTransferAmount: wrap(
      "nativeTokenTransferAmount",
      decodeNativeTokenTransferAmountTerms,
    ),
    nonce: wrap("nonce", decodeNonceTerms),
    ownershipTransfer: wrap("ownershipTransfer", decodeOwnershipTransferTerms),
    redeemer: wrap("redeemer", decodeRedeemerTerms),
    specificActionErc20TransferBatch: wrap(
      "specificActionErc20TransferBatch",
      decodeSpecificActionERC20TransferBatchTerms,
    ),
    timestamp: wrap("timestamp", decodeTimestampTerms),
    valueLte: wrap("valueLte", decodeValueLteTerms),
  }
