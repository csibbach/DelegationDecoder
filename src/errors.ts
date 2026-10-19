/**
 * The transaction was missing, not sent to the Delegation Manager, or was not
 * a valid `redeemDelegations` call.
 */
export class InvalidTransactionError extends Error {
  override readonly name = "InvalidTransactionError"

  constructor(message: string) {
    super(message)
  }
}

/**
 * The PublicClient's chain is not in the known Delegation Manager deployment map.
 */
export class UnsupportedChainError extends Error {
  override readonly name = "UnsupportedChainError"

  readonly chainId: number

  constructor(chainId: number, message?: string) {
    super(message ?? `No DelegationManager deployment is registered for chainId ${chainId}`)
    this.chainId = chainId
  }
}
