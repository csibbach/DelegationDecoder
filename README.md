# DelegationDecoder

Decode [MetaMask Delegation Framework](https://github.com/MetaMask/delegation-framework) delegations from on-chain transaction data.

Built on [Viem](https://viem.sh) and [`@metamask/smart-accounts-kit`](https://docs.metamask.io/smart-accounts-kit).

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
  (delegationChains) => {
    // Delegation[][] — one chain (leaf → root) per redeemDelegations batch entry
  },
  (error) => {
    // InvalidTransactionError | UnsupportedChainError | RPC errors
  },
)
```

`getDelegationsForTransaction` returns `ResultAsync<Delegation[][], Error>`:

1. Loads the transaction via the bound `PublicClient`
2. Checks `to` is the v1.3.0 [DelegationManager](https://github.com/MetaMask/delegation-framework/blob/main/documents/Deployments.md) for `publicClient.chain.id`
3. Decodes `redeemDelegations` calldata and each permission context

Custom caveat enforcers (for example a Chainlink price rule) appear as normal caveats: `{ enforcer, terms, args }` with `terms`/`args` left as raw hex. Interpreting packed terms by enforcer address is a separate concern.

### Errors

| Error                     | When                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidTransactionError` | Tx missing, not sent to the DelegationManager, not `redeemDelegations`, or malformed permission context (message distinguishes the case) |
| `UnsupportedChainError`   | `chain.id` is not in the known DelegationManager deployment map                                                                          |

Override addresses via `new DelegationDecoder({ publicClient, delegationManagerAddresses })` when using a fork or custom deploy.

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
