import { DelegationManager } from "@metamask/delegation-abis"
import type { Delegation } from "@metamask/smart-accounts-kit"
import { decodePermissionContexts } from "@metamask/smart-accounts-kit/utils"
import { decodeFunctionData, type Hex } from "viem"

import { InvalidTransactionError } from "./errors.js"

const REDEEM_DELEGATIONS = "redeemDelegations"

/**
 * Decode `redeemDelegations` calldata into per-batch-entry delegation chains.
 */
export function decodeRedeemDelegationsCalldata(data: Hex): Delegation[][] {
  let decoded: ReturnType<typeof decodeFunctionData>
  try {
    decoded = decodeFunctionData({
      abi: DelegationManager.abi,
      data,
    })
  } catch (cause) {
    throw new InvalidTransactionError(
      `Transaction is not a redeemDelegations call: failed to decode function data${
        cause instanceof Error ? ` (${cause.message})` : ""
      }`,
    )
  }

  if (decoded.functionName !== REDEEM_DELEGATIONS) {
    throw new InvalidTransactionError(
      `Transaction is not a redeemDelegations call: got ${decoded.functionName}`,
    )
  }

  const permissionContexts = decoded.args[0] as Hex[]

  try {
    return decodePermissionContexts(permissionContexts)
  } catch (cause) {
    throw new InvalidTransactionError(
      `Transaction has a malformed permission context${
        cause instanceof Error ? `: ${cause.message}` : ""
      }`,
    )
  }
}
