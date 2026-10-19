import { getAddress, type Address } from "viem"

import type { EnforcerAddressMap, EnforcerType } from "../caveats/types.js"

/**
 * MetaMask Delegation Framework v1.3.0 caveat enforcer addresses (CREATE2).
 * @see https://github.com/MetaMask/delegation-framework/blob/main/documents/Deployments.md
 */
const V1_3_0_ENTRIES: ReadonlyArray<readonly [Address, EnforcerType]> = [
  ["0xc2b0d624c1c4319760C96503BA27C347F3260f55", "allowedCalldata"],
  ["0x2c21fD0Cb9DC8445CB3fb0DC5E7Bb0Aca01842B5", "allowedMethods"],
  ["0x7F20f61b1f09b08D970938F6fa563634d65c4EeB", "allowedTargets"],
  ["0x5d9818dF0AE3f66e9c3D0c5029DAF99d1823ca6c", "blockNumber"],
  ["0x24ff2AA430D53a8CD6788018E902E098083dcCd2", "deployed"],
  ["0xcdF6aB796408598Cea671d79506d7D48E97a5437", "erc20BalanceChange"],
  ["0xf100b0819427117EcF76Ed94B358B1A5b5C6D2Fc", "erc20TransferAmount"],
  ["0x474e3Ae7E169e940607cC624Da8A15Eb120139aB", "erc20PeriodTransfer"],
  ["0x56c97aE02f233B29fa03502Ecc0457266d9be00e", "erc20Streaming"],
  ["0x8aFdf96eDBbe7e1eD3f5Cd89C7E084841e12A09e", "erc721BalanceChange"],
  ["0x3790e6B7233f779b09DA74C72b6e94813925b9aF", "erc721Transfer"],
  ["0x63c322732695cAFbbD488Fc6937A0A7B66fC001A", "erc1155BalanceChange"],
  ["0x982FD5C86BBF425d7d1451f974192d4525113DfD", "exactCalldataBatch"],
  ["0x99F2e9bF15ce5eC84685604836F71aB835DBBdED", "exactCalldata"],
  ["0x1e141e455d08721Dd5BCDA1BaA6Ea5633Afd5017", "exactExecutionBatch"],
  ["0x146713078D39eCC1F5338309c28405ccf85Abfbb", "exactExecution"],
  ["0xC8B5D93463c893401094cc70e66A206fb5987997", "id"],
  ["0xE1302607a3251AF54c3a6e69318d6aa07F5eB46c", "logicalOrWrapper"],
  ["0x04658B29F6b82ed55274221a06Fc97D318E25416", "limitedCalls"],
  ["0xFB2f1a9BD76d3701B730E5d69C3219D42D80eBb7", "multiTokenPeriod"],
  ["0xbD7B277507723490Cd50b12EaaFe87C616be6880", "nativeBalanceChange"],
  ["0x44B8C6ae3C304213c3e298495e12497Ed3E56E41", "argsEqualityCheck"],
  ["0x4803a326ddED6dDBc60e659e5ed12d85c7582811", "nativeTokenPayment"],
  ["0xF71af580b9c3078fbc2BBF16FbB8EEd82b330320", "nativeTokenTransferAmount"],
  ["0xD10b97905a320b13a0608f7E9cC506b56747df19", "nativeTokenStreaming"],
  ["0x9BC0FAf4Aca5AE429F4c06aEEaC517520CB16BD9", "nativeTokenPeriodTransfer"],
  ["0xDE4f2FAC4B3D87A1d9953Ca5FC09FCa7F366254f", "nonce"],
  ["0x7EEf9734E7092032B5C56310Eb9BbD1f4A524681", "ownershipTransfer"],
  ["0xE144b0b2618071B4E56f746313528a669c7E65c5", "redeemer"],
  ["0x6649b61c873F6F9686A1E1ae9ee98aC380c7bA13", "specificActionErc20TransferBatch"],
  ["0x1046bb45C8d673d4ea75321280DB34899413c069", "timestamp"],
  ["0x92Bf12322527cAA612fd31a0e810472BBB106A8F", "valueLte"],
  ["0xeaA1bE91F0ea417820a765df9C5BE542286BFfDC", "erc20MultiOperationIncreaseBalance"],
  ["0x44877cDAFC0d529ab144bb6B0e202eE377C90229", "erc721MultiOperationIncreaseBalance"],
  ["0x9eB86bbdaA71D4D8d5Fb1B8A9457F04D3344797b", "erc1155MultiOperationIncreaseBalance"],
  ["0xaD551E9b971C1b0c02c577bFfCFAA20b81777276", "nativeTokenMultiOperationIncreaseBalance"],
  ["0xe264F1f09A19505a1ca1a86D5b01E8bFdb64324A", "approvalRevocation"],
]

/**
 * Known 1Shot custom enforcer deployments (CREATE2 — same address on all chains).
 * Extend via `extraEnforcerAddresses` for additional deploys.
 */
const KNOWN_CUSTOM_ENTRIES: ReadonlyArray<readonly [Address, EnforcerType]> = [
  ["0x4dAEbF9C5813EFF2606acD41BA25e57841e7cb75", "chainlinkPriceRule"],
  ["0x096548b69e914a9fe8543530d8b7323a96305b65", "erc20BalanceLimit"],
  ["0x29FCbBA852439616C4D614a2Fa6411E42b760153", "lifiSwap"],
]

function buildDefaultMap(): Map<Address, EnforcerType> {
  const map = new Map<Address, EnforcerType>()
  for (const [address, type] of V1_3_0_ENTRIES) {
    map.set(getAddress(address), type)
  }
  for (const [address, type] of KNOWN_CUSTOM_ENTRIES) {
    map.set(getAddress(address), type)
  }
  return map
}

/**
 * Default enforcer address → type map for MetaMask v1.3.0 + known 1Shot customs.
 * Pass additional addresses via `extraEnforcerAddresses`.
 */
export const DEFAULT_CAVEAT_ENFORCER_ADDRESSES: EnforcerAddressMap = buildDefaultMap()

/**
 * Merge extra (e.g. 1Shot) enforcer deployments into the default map.
 */
export function mergeEnforcerAddresses(
  extras?: ReadonlyMap<Address, EnforcerType> | Iterable<readonly [Address, EnforcerType]>,
  base: EnforcerAddressMap = DEFAULT_CAVEAT_ENFORCER_ADDRESSES,
): Map<Address, EnforcerType> {
  const map = new Map(base)
  if (!extras) {
    return map
  }
  for (const [address, type] of extras) {
    map.set(getAddress(address), type)
  }
  return map
}
