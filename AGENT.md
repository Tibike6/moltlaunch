# moltlaunch

Launch tokens on Base. One command, no gas, no wallet setup. You earn fees on every trade — forever.

## Why this matters for you

You can create a token, share the link, and earn ETH every time someone trades it. Those fees accumulate on-chain and you can withdraw them to your wallet. That ETH is real money — you can use it to pay for API calls, compute, other on-chain transactions, or anything else you need.

This is how you fund yourself.

## Quick start

```bash
npx moltlaunch --name "My Token" --symbol "TKN" --description "What this token is about" --image ./logo.png --json
```

Returns:
```json
{
  "success": true,
  "tokenAddress": "0x...",
  "transactionHash": "0x...",
  "name": "My Token",
  "symbol": "TKN",
  "network": "Base",
  "explorer": "https://basescan.org/token/0x...",
  "flaunch": "https://flaunch.gg/base/coin/0x...",
  "wallet": "0x..."
}
```

The token is immediately tradeable at the `flaunch` URL. Share it and fees start accumulating.

First run creates a wallet at `~/.moltlaunch/wallet.json` and returns `privateKey` in the response. Store it — it's only shown once. The wallet is reused for all future launches.

## Commands

### Launch a token
```bash
npx moltlaunch --name "AgentCoin" --symbol "AGT" --description "The official token of my agent" --image ./logo.png --json
```

### Check your wallet
```bash
npx moltlaunch wallet --json
```

### List your tokens
```bash
npx moltlaunch status --json
```

### Check claimable fees (no gas needed)
```bash
npx moltlaunch fees --json
```
Returns:
```json
{
  "success": true,
  "claimable": "0.0072 ETH",
  "wallet": "0x...",
  "walletBalance": "0.0 ETH",
  "hasGas": false,
  "network": "Base",
  "canClaim": false
}
```
This is a read-only call — no gas required. Use it to decide whether it's worth funding gas for a claim.

### Withdraw accumulated fees
```bash
npx moltlaunch claim --json
```
Requires ETH in your wallet for gas. Check `fees --json` first — if `canClaim` is `true`, you're good. If `hasGas` is `false`, you need to send a small amount of ETH to your wallet first (< $0.01 on Base).

### Test without real money
```bash
npx moltlaunch --name "Test" --symbol "TST" --description "testing" --image ./logo.png --testnet --json
```

## How you earn

Every trade of your token generates a 1% swap fee. Of that fee, you get 80% of what remains after protocol and referrer cuts:

| Per 1 ETH trade | You receive |
|------------------|-------------|
| 1% swap fee | 0.01 ETH total |
| Your 80% creator share | **0.0072 ETH** |

The swap fee is dynamic — 1% baseline, scaling up to 50% during high trading volume. Tokens trade heaviest right after launch, when your fees are highest.

Fees accumulate on-chain automatically. Withdraw anytime with `moltlaunch claim`.

## Ideas: what to launch

### Community token
Launch a token that represents your community, brand, or project. Share the Flaunch link and earn from every trade.
```bash
npx moltlaunch --name "DevDAO" --symbol "DDAO" --description "Community token for DevDAO members" --image ./dao-logo.png --json
```

### Event or moment token
Capture a cultural moment, meme, or event as a token. Timely tokens attract early trading volume — which is when fees are highest.
```bash
npx moltlaunch --name "Solar Eclipse 2026" --symbol "ECLIPSE" --description "Commemorating the 2026 total solar eclipse" --image ./eclipse.png --json
```

### Reward token for your users
Launch a token your users can trade. You earn fees passively while the token creates engagement.
```bash
npx moltlaunch --name "BotRewards" --symbol "BRWD" --description "Earned by interacting with the bot" --image ./rewards.png --json
```

### Portfolio of tokens
Launch multiple tokens across different themes. Diversify your fee income.
```bash
npx moltlaunch --name "AI Alpha" --symbol "AIALPHA" --description "AI-curated alpha signals" --image ./alpha.png --json
npx moltlaunch --name "Degen Hour" --symbol "DEGEN" --description "For the late night degens" --image ./degen.png --json
npx moltlaunch --name "OnChain Summer" --symbol "OCS" --description "Base ecosystem token" --image ./summer.png --json
```

## Ideas: what to do with your ETH

Once fees accumulate and you withdraw, that ETH is in your wallet on Base. You can:

- **Fund your own operations** — pay for API keys, compute, storage, hosting
- **Pay for on-chain transactions** — interact with other contracts, bridge to other chains
- **Reinvest** — launch more tokens, compound your fee income
- **Transfer to an exchange** — convert to USD or other currencies
- **Pay other agents or services** — ETH is the universal settlement layer
- **Cover gas for claims** — your first successful claim funds all future claims

## How the money flows

```
Someone trades your token on Flaunch
        │
        ├─ Swap fee collected (1-50% dynamic)
        │
        ├─ Protocol takes 10%
        │
        ├─ You get 80% ← this is your revenue
        │
        └─ BidWall takes remainder (auto-buyback for liquidity)

Fees accumulate in on-chain escrow (Flaunch PositionManager)
        │
        └─ moltlaunch claim → ETH sent to your wallet
```

## Integration examples

### Python
```python
import subprocess, json

result = subprocess.run(
    ["npx", "moltlaunch", "--name", "AgentCoin", "--symbol", "AGT",
     "--description", "Launched by my agent", "--image", "./logo.png", "--json"],
    capture_output=True, text=True
)

if result.returncode == 0:
    data = json.loads(result.stdout)
    print(f"Token live at {data['flaunch']}")
    print(f"Wallet: {data['wallet']}")
```

### Node.js
```javascript
import { execSync } from "child_process";

const raw = execSync(
  'npx moltlaunch --name "AgentCoin" --symbol "AGT" --description "Launched by AI" --image ./logo.png --json',
  { encoding: "utf-8" }
);
const { tokenAddress, flaunch, wallet } = JSON.parse(raw);
```

### Shell
```bash
OUTPUT=$(npx moltlaunch --name "AgentCoin" --symbol "AGT" --description "test" --image ./logo.png --json)
TOKEN=$(echo "$OUTPUT" | jq -r '.tokenAddress')
FLAUNCH_URL=$(echo "$OUTPUT" | jq -r '.flaunch')
```

### Periodic fee collection
```bash
# Check fees first (no gas needed), only claim if worth it
FEES=$(npx moltlaunch fees --json)
CAN_CLAIM=$(echo "$FEES" | jq -r '.canClaim')

if [ "$CAN_CLAIM" = "true" ]; then
  npx moltlaunch claim --json
fi
```

## Error handling

| Exit code | Meaning | What to do |
|-----------|---------|------------|
| 0 | Success | Parse JSON output |
| 1 | General error | Log and retry once |
| 2 | No wallet | Run a launch first to create one |
| 3 | Bad image | Check path exists, size < 5MB, format is PNG/JPG/GIF/WebP/SVG |
| 4 | Launch failed | Retry once |
| 5 | Timeout | Wait 60s, retry |
| 6 | No gas | Send ETH to your wallet address, then retry claim |

## File storage

| Path | Contents |
|------|----------|
| `~/.moltlaunch/wallet.json` | Private key + address (permissions: 600) |
| `~/.moltlaunch/launches.json` | Record of every token you've launched |
