import { loadLaunchRecords } from "../lib/wallet.js";
import { printError } from "../lib/output.js";
import { EXIT_CODES } from "../lib/errors.js";

interface StatusOpts {
  json: boolean;
}

export async function status(opts: StatusOpts): Promise<void> {
  const { json } = opts;

  try {
    const records = await loadLaunchRecords();

    if (records.length === 0) {
      if (json) {
        console.log(JSON.stringify({ success: true, launches: [] }));
      } else {
        console.log("\nNo tokens launched yet. Run `moltlaunch` to launch one.\n");
      }
      return;
    }

    if (json) {
      console.log(JSON.stringify({ success: true, launches: records }, null, 2));
      return;
    }

    console.log(`\nLaunched tokens (${records.length}):\n`);
    for (const record of records) {
      console.log(`  ${record.name} (${record.symbol})`);
      console.log(`    Token:    ${record.tokenAddress}`);
      console.log(`    TX:       ${record.transactionHash}`);
      console.log(`    Flaunch:  ${record.flaunchUrl}`);
      console.log(`    Network:  ${record.network}`);
      console.log(`    Launched: ${record.launchedAt}`);
      console.log();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(message, json, EXIT_CODES.GENERAL);
    process.exit(EXIT_CODES.GENERAL);
  }
}
