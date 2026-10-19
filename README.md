# DelegationDecoder

Decode [MetaMask Delegation Framework](https://github.com/MetaMask/delegation-framework) delegations from on-chain transaction data, including **interpreted caveat terms and args**.

Built on [Viem](https://viem.sh), [`@metamask/smart-accounts-kit`](https://docs.metamask.io/smart-accounts-kit), and [`@metamask/delegation-core`](https://www.npmjs.com/package/@metamask/delegation-core).

## Install

```bash
npm install delegation-decoder viem
```

## Usage

```ts
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { asTransactionHash, DelegationDecoder } from "delegation-decoder"

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const decoder = new DelegationDecoder({ publicClient })

const result = await decoder.getDelegationsForTransaction(asTransactionHash("0x…"))

result.match(
  (chains) => {
    // InterpretedDelegation[][] — one chain (leaf → root) per batch entry
    for (const chain of chains) {
      for (const delegation of chain) {
        for (const caveat of delegation.caveats) {
          // caveat.type e.g. 'exactExecution' | 'limitedCalls' | 'timestamp' | 'unknown'
          // caveat.decodedTerms — structured fields
          // caveat.terms / caveat.args — original hex preserved
        }
      }
    }
  },
  (error) => {
    // InvalidTransactionError | UnsupportedChainError | CaveatTermsDecodeError | RPC errors
  },
)
```

### What gets decoded

Stock MetaMask v1.3.0 enforcers are resolved by CREATE2 address and decoded via `@metamask/delegation-core` (plus local packed decoders for MultiOperation\* enforcers).

1Shot custom enforcers (`chainlinkPriceRule`, `lifiSwap`, `erc20BalanceChangeSafe`, `erc20BalanceLimit`) are supported once you register their deployment addresses:

```ts
import { getAddress } from "viem"
import { DelegationDecoder } from "delegation-decoder"

const decoder = new DelegationDecoder({
  publicClient,
  extraEnforcerAddresses: [
    [getAddress("0xYourChainlinkEnforcer"), "chainlinkPriceRule"],
    [getAddress("0xYourLiFiSwapEnforcer"), "lifiSwap"],
  ],
})
```

Unknown enforcer addresses yield `type: 'unknown'` with `decodedTerms: null` (the transaction still succeeds). Malformed terms for a **known** enforcer throw `CaveatTermsDecodeError`.

You can also call `interpretCaveat` / `interpretDelegations` directly on already-decoded raw caveats.

### Errors

| Error                     | When                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `InvalidTransactionError` | Tx missing, not sent to the DelegationManager, not `redeemDelegations`, or malformed permission context |
| `UnsupportedChainError`   | `chain.id` is not in the known DelegationManager deployment map                                         |
| `CaveatTermsDecodeError`  | Known enforcer address but terms/args failed to decode                                                  |

## Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Bundle library to `dist/` (ESM + CJS + types) |
| `npm test`          | Run Jest tests                                |
| `npm run lint`      | ESLint                                        |
| `npm run lint:fix`  | ESLint with autofix                           |
| `npm run format`    | Prettier write                                |
| `npm run typecheck` | `tsc --noEmit`                                |

## License

MIT
