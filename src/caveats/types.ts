import type { Address, Hex } from "viem"

/**
 * Raw caveat shape from the Delegation Framework / smart-accounts-kit.
 */
export type Caveat = {
  enforcer: Hex
  terms: Hex
  args: Hex
}

/**
 * Raw delegation shape (permission-context entry).
 */
export type Delegation = {
  delegate: Hex
  delegator: Hex
  authority: Hex
  caveats: Caveat[]
  salt: Hex
  signature: Hex
}

/**
 * Known caveat enforcer identifiers (MetaMask v1.3.0 + 1Shot customs).
 */
export type EnforcerType =
  | "allowedCalldata"
  | "allowedMethods"
  | "allowedTargets"
  | "approvalRevocation"
  | "argsEqualityCheck"
  | "blockNumber"
  | "deployed"
  | "erc1155BalanceChange"
  | "erc1155MultiOperationIncreaseBalance"
  | "erc20BalanceChange"
  | "erc20BalanceChangeSafe"
  | "erc20BalanceLimit"
  | "erc20MultiOperationIncreaseBalance"
  | "erc20PeriodTransfer"
  | "erc20Streaming"
  | "erc20TransferAmount"
  | "erc721BalanceChange"
  | "erc721MultiOperationIncreaseBalance"
  | "erc721Transfer"
  | "exactCalldata"
  | "exactCalldataBatch"
  | "exactExecution"
  | "exactExecutionBatch"
  | "id"
  | "limitedCalls"
  | "logicalOrWrapper"
  | "multiTokenPeriod"
  | "nativeBalanceChange"
  | "nativeTokenMultiOperationIncreaseBalance"
  | "nativeTokenPayment"
  | "nativeTokenPeriodTransfer"
  | "nativeTokenStreaming"
  | "nativeTokenTransferAmount"
  | "nonce"
  | "ownershipTransfer"
  | "redeemer"
  | "specificActionErc20TransferBatch"
  | "timestamp"
  | "valueLte"
  | "chainlinkPriceRule"
  | "lifiSwap"
  | "unknown"

export type InterpretedCaveat = Caveat & {
  type: EnforcerType
  decodedTerms: unknown
  decodedArgs: unknown | null
}

export type InterpretedDelegation = Omit<Delegation, "caveats"> & {
  caveats: InterpretedCaveat[]
}

export type EnforcerAddressMap = ReadonlyMap<Address, EnforcerType>
