import { getAddress, type Address } from "viem"

import {
  DEFAULT_CAVEAT_ENFORCER_ADDRESSES,
  mergeEnforcerAddresses,
} from "../deployments/caveatEnforcerAddresses.js"
import { customDecoders } from "./interpreters/custom.js"
import { multiOperationDecoders } from "./interpreters/multiOperation.js"
import { stockDecoders } from "./interpreters/stock.js"
import type { Caveat, EnforcerAddressMap, EnforcerType, InterpretedCaveat } from "./types.js"

const allDecoders = {
  ...stockDecoders,
  ...multiOperationDecoders,
  ...customDecoders,
}

export type InterpretCaveatOptions = {
  enforcerAddresses?: EnforcerAddressMap
}

/**
 * Interpret a raw caveat: resolve enforcer type by address and decode terms/args.
 * Unknown enforcers return `type: 'unknown'` without throwing.
 */
export function interpretCaveat(
  caveat: Caveat,
  options: InterpretCaveatOptions = {},
): InterpretedCaveat {
  const addresses = options.enforcerAddresses ?? DEFAULT_CAVEAT_ENFORCER_ADDRESSES
  const enforcer = getAddress(caveat.enforcer)
  const type: EnforcerType = addresses.get(enforcer) ?? "unknown"

  if (type === "unknown") {
    return {
      ...caveat,
      enforcer,
      type: "unknown",
      decodedTerms: null,
      decodedArgs: null,
    }
  }

  const decoder = allDecoders[type]
  if (!decoder) {
    return {
      ...caveat,
      enforcer,
      type,
      decodedTerms: null,
      decodedArgs: null,
    }
  }

  const { decodedTerms, decodedArgs } = decoder(caveat.terms, caveat.args)
  return {
    ...caveat,
    enforcer,
    type,
    decodedTerms,
    decodedArgs,
  }
}

/**
 * Build an enforcer address map from defaults plus optional custom entries.
 */
export function createEnforcerAddressMap(
  extras?: ReadonlyMap<Address, EnforcerType> | Iterable<readonly [Address, EnforcerType]>,
): Map<Address, EnforcerType> {
  return mergeEnforcerAddresses(extras)
}
