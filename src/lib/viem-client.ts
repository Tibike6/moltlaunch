import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient, type Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { createDrift, type Drift, type ReadWriteAdapter } from "@delvtech/drift";
import { viemAdapter } from "@delvtech/drift-viem";
import { ReadWriteFlaunchSDK } from "@flaunch/sdk";
import { CHAIN } from "./config.js";
import type { Network } from "../types.js";

const VIEM_CHAINS = {
  mainnet: base,
  testnet: baseSepolia,
} as const;

interface FlaunchClients {
  flaunch: ReadWriteFlaunchSDK;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Account;
}

export function createFlaunchSdk(privateKey: string, network: Network): FlaunchClients {
  const chainConfig = CHAIN[network];
  const chain = VIEM_CHAINS[network];
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(chainConfig.rpcUrl),
  });

  const walletClient = createWalletClient({
    chain,
    account,
    transport: http(chainConfig.rpcUrl),
  });

  // Cast needed: Base chain's deposit tx type causes generic mismatch with drift-viem
  const drift = createDrift({
    adapter: viemAdapter({
      publicClient: publicClient as unknown as PublicClient,
      walletClient: walletClient as unknown as WalletClient,
    }),
  }) as unknown as Drift<ReadWriteAdapter>;

  const flaunch = new ReadWriteFlaunchSDK(chain.id, drift);

  return {
    flaunch,
    publicClient: publicClient as unknown as PublicClient,
    walletClient: walletClient as unknown as WalletClient,
    account,
  };
}
