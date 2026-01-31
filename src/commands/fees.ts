import { ethers } from "ethers";
import { loadWallet, getWalletBalance } from "../lib/wallet.js";
import { POSITION_MANAGER_ADDRESS, CHAIN } from "../lib/config.js";
import { printSuccess, printError } from "../lib/output.js";
import { EXIT_CODES, NoWalletError, MoltlaunchError } from "../lib/errors.js";
import type { Network } from "../types.js";

const POSITION_MANAGER_ABI = [
  "function balances(address) external view returns (uint256)",
];

interface FeesOpts {
  testnet: boolean;
  json: boolean;
}

export async function fees(opts: FeesOpts): Promise<void> {
  const { testnet, json } = opts;
  const network: Network = testnet ? "testnet" : "mainnet";

  try {
    const walletData = await loadWallet();
    if (!walletData) {
      throw new NoWalletError();
    }

    const chain = testnet ? CHAIN.testnet : CHAIN.mainnet;
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const pm = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI, provider);

    const claimable = await pm.balances(walletData.address);
    const claimableEth = ethers.formatEther(claimable);

    const walletBalance = await getWalletBalance(walletData.address, network);
    const hasGas = parseFloat(walletBalance) > 0;

    printSuccess("Fee balance", {
      claimable: `${claimableEth} ETH`,
      wallet: walletData.address,
      walletBalance: `${walletBalance} ETH`,
      hasGas,
      network: chain.name,
      canClaim: hasGas && claimable > 0n,
    }, json);
  } catch (error) {
    if (error instanceof MoltlaunchError) {
      printError(error.message, json, error.exitCode);
      process.exit(error.exitCode);
    }
    const message = error instanceof Error ? error.message : String(error);
    printError(message, json, EXIT_CODES.GENERAL);
    process.exit(EXIT_CODES.GENERAL);
  }
}
