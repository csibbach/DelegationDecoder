# DelegationDecoder

Decode [MetaMask Delegation Framework](https://github.com/MetaMask/delegation-framework) delegations from on-chain transaction data.

Built on [Viem](https://viem.sh) and [`@metamask/smart-accounts-kit`](https://docs.metamask.io/smart-accounts-kit).

## Status

Early scaffold. `getDelegationsForTransaction` is stubbed and returns `NotImplementedError` until on-chain decoding is implemented.

## Install

```bash
npm install delegation-decoder viem
```

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { asTransactionHash, createDelegationDecoder } from 'delegation-decoder'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const decoder = createDelegationDecoder({ publicClient })

const result = await decoder.getDelegationsForTransaction(asTransactionHash('0x…'))

result.match(
  (delegations) => {
    // Delegation[] from the redeemDelegations call
  },
  (error) => {
    // NotImplementedError for now; later: fetch/decode failures
  },
)
```

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
