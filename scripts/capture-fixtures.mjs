import { writeFileSync, mkdirSync } from "node:fs"
import { createPublicClient, http, defineChain, decodeFunctionData } from "viem"
import { mainnet } from "viem/chains"
import { decodePermissionContexts } from "@metamask/smart-accounts-kit/utils"
import { DelegationManager } from "@metamask/delegation-abis"

const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
})

function jsonReplacer(_key, value) {
  return typeof value === "bigint" ? value.toString() : value
}

async function capture(client, chainId, hash) {
  const tx = await client.getTransaction({ hash })
  const decoded = decodeFunctionData({ abi: DelegationManager.abi, data: tx.input })
  const permissionContexts = decoded.args[0]
  const expectedDelegations = decodePermissionContexts(permissionContexts)
  return {
    hash,
    chainId,
    transaction: {
      to: tx.to,
      input: tx.input,
      hash: tx.hash,
      from: tx.from,
      value: tx.value.toString(),
      nonce: tx.nonce,
      type: tx.type,
    },
    expectedDelegations,
  }
}

mkdirSync("test/fixtures", { recursive: true })

const eth = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum.publicnode.com"),
})
const arcClient = createPublicClient({ chain: arc, transport: http() })

const fixtures = [
  await capture(eth, 1, "0xea2a0a46ba16a371211ed80f7a7f0189958a3ed6b7398b681be05752aa5bb059"),
  await capture(eth, 1, "0x918114707833ae0d709f8d7c30324163feb55bcddf80dbd9a79d435a50fee4bf"),
  await capture(
    arcClient,
    5042,
    "0x6188c10081005a99512554231a28a315117093fd9c025a67cdf19c59325c1055",
  ),
  await capture(
    arcClient,
    5042,
    "0x396aa601356e4a822dca463de893a52be9eba7575c138396a95053001631bb5d",
  ),
]

for (const fixture of fixtures) {
  const name = `${fixture.chainId}-${fixture.hash.slice(2, 10)}.json`
  writeFileSync(`test/fixtures/${name}`, `${JSON.stringify(fixture, jsonReplacer, 2)}\n`)
  console.log(
    "wrote",
    name,
    "batches",
    fixture.expectedDelegations.length,
    "sizes",
    fixture.expectedDelegations.map((c) => c.length),
  )
}
