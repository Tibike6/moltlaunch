export const REVENUE_MANAGER_ADDRESS = "0x3Bc08524d9DaaDEC9d1Af87818d809611F0fD669";

// Flaunch PositionManager — fees accumulate here in escrow
export const POSITION_MANAGER_ADDRESS = "0x51Bba15255406Cfe7099a42183302640ba7dAFDC";

export const FLAUNCH_API_BASE = "https://web2-api.flaunch.gg";

export const CHAIN = {
  mainnet: {
    id: 8453,
    name: "Base",
    network: "base",
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    flaunchUrl: "https://flaunch.gg/base",
  },
  testnet: {
    id: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    flaunchUrl: "https://flaunch.gg/base-sepolia",
  },
} as const;

export const WALLET_DIR = ".moltlaunch";
export const WALLET_FILE = "wallet.json";
export const LAUNCHES_FILE = "launches.json";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const POLL_INTERVAL_MS = 2000;
export const POLL_TIMEOUT_MS = 120_000;
