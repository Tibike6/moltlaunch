export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL: 1,
  NO_WALLET: 2,
  UPLOAD_FAIL: 3,
  LAUNCH_FAIL: 4,
  TIMEOUT: 5,
  NO_GAS: 6,
  SWAP_FAIL: 7,
} as const;

export class MoltlaunchError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number,
  ) {
    super(message);
    this.name = "MoltlaunchError";
  }
}

export class NoWalletError extends MoltlaunchError {
  constructor() {
    super("No wallet found. Run `moltlaunch` to create one.", EXIT_CODES.NO_WALLET);
  }
}

export class UploadError extends MoltlaunchError {
  constructor(detail: string) {
    super(`Image upload failed: ${detail}`, EXIT_CODES.UPLOAD_FAIL);
  }
}

export class LaunchError extends MoltlaunchError {
  constructor(detail: string) {
    super(`Token launch failed: ${detail}`, EXIT_CODES.LAUNCH_FAIL);
  }
}

export class TimeoutError extends MoltlaunchError {
  constructor() {
    super("Launch timed out waiting for confirmation.", EXIT_CODES.TIMEOUT);
  }
}

export class SwapError extends MoltlaunchError {
  constructor(detail: string) {
    super(`Swap failed: ${detail}`, EXIT_CODES.SWAP_FAIL);
  }
}

export class NoGasError extends MoltlaunchError {
  constructor(address: string) {
    super(
      `Wallet ${address} has no ETH for gas. Send Base ETH to this address and retry.`,
      EXIT_CODES.NO_GAS,
    );
  }
}
