import { ethers } from "ethers";
import { loadWallet, getSigner, getWalletBalance } from "../lib/wallet.js";
import { POSITION_MANAGER_ADDRESS } from "../lib/config.js";
import { printSuccess, printError } from "../lib/output.js";
import { EXIT_CODES, NoWalletError, NoGasError, MoltlaunchError } from "../lib/errors.js";
import type { Network } from "../types.js";

// Fees accumulate in escrow on the PositionManager, not on the Revenue Manager
const POSITION_MANAGER_ABI = [
  "function balances(address) external view returns (uint256)",
  "function withdrawFees(address _recipient, bool _unwrap) external",
];

interface ClaimOpts {
  testnet: boolean;
  json: boolean;
}

export async function claim(opts: ClaimOpts): Promise<void> {
  const { testnet, json } = opts;
  const network: Network = testnet ? "testnet" : "mainnet";

  try {
    const walletData = await loadWallet();
    if (!walletData) {
      throw new NoWalletError();
    }

    // Check gas balance
    const balance = await getWalletBalance(walletData.address, network);
    if (parseFloat(balance) === 0) {
      throw new NoGasError(walletData.address);
    }

    const signer = await getSigner(walletData.privateKey, network);
    const pm = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI, signer);

    // Check claimable balance
    const claimable = await pm.balances(walletData.address);
    const claimableEth = ethers.formatEther(claimable);

    if (claimable === 0n) {
      printSuccess("No fees to claim", {
        claimable: "0 ETH",
        wallet: walletData.address,
        network,
      }, json);
      return;
    }

    if (!json) console.log(`\nClaimable: ${claimableEth} ETH`);
    if (!json) process.stdout.write("Submitting withdraw transaction...");

    // withdrawFees sends to _recipient, _unwrap=true converts flETH→ETH
    const tx = await pm.withdrawFees(walletData.address, true);
    if (!json) console.log(` tx ${tx.hash}`);

    if (!json) process.stdout.write("Waiting for confirmation...");
    const receipt = await tx.wait();
    if (!receipt) {
      throw new MoltlaunchError("Transaction was dropped or replaced", EXIT_CODES.GENERAL);
    }
    if (!json) console.log(" confirmed");

    printSuccess("Fees claimed successfully!", {
      transactionHash: receipt.hash,
      claimed: `${claimableEth} ETH`,
      wallet: walletData.address,
      network,
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
