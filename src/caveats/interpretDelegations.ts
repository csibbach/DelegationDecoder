import { interpretCaveat, type InterpretCaveatOptions } from "./interpretCaveat.js"
import type { Delegation, InterpretedDelegation } from "./types.js"

/**
 * Map raw delegation chains to interpreted delegations (decoded caveats).
 */
export function interpretDelegations(
  chains: Delegation[][],
  options: InterpretCaveatOptions = {},
): InterpretedDelegation[][] {
  return chains.map((chain) =>
    chain.map((delegation) => ({
      ...delegation,
      caveats: delegation.caveats.map((caveat) => interpretCaveat(caveat, options)),
    })),
  )
}
