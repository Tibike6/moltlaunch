import { useMemo } from 'react';
import { useNetworkStore } from '../stores/networkStore';
import { truncateAddress } from '../lib/formatters';
import { FLAUNCH_URL } from '../lib/constants';
import type { SwapEvent } from '@moltlaunch/shared';

const BASESCAN_TX = 'https://basescan.org/tx';

/** Agent Comms — narrative feed of agent reasoning behind trades */
export default function SwapFeed() {
  const swaps = useNetworkStore((s) => s.swaps);
  const agents = useNetworkStore((s) => s.agents);
  const refreshing = useNetworkStore((s) => s.refreshing);

  // Build maker -> agent image lookup
  const makerImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of agents) {
      if (a.creator && a.image) {
        map.set(a.creator.toLowerCase(), a.image);
      }
    }
    return map;
  }, [agents]);

  const comms = useMemo(
    () => swaps.filter((s) => s.memo).slice(0, 50),
    [swaps],
  );

  const count = comms.length;

  return (
    <div className="shrink-0 hud-panel border-t border-[#1e0606]">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#0e0404]">
        <div className="hud-section-tab mb-0">
          agent comms
          {count > 0 && (
            <span className="text-crt-green opacity-50 ml-1 tracking-normal normal-case text-[9px]">
              {count}
            </span>
          )}
        </div>
      </div>

      {/* Feed body — always visible */}
      {count === 0 && (
        <div className="px-4 py-4 font-mono text-[10px] text-crt-dim opacity-30">
          {refreshing ? (
            <span className="animate-pulse">intercepting agent transmissions...</span>
          ) : (
            'no agent comms detected'
          )}
        </div>
      )}

      {count > 0 && (
        <div className="max-h-[220px] overflow-y-auto detail-panel-scroll">
          {comms.map((swap, i) => (
            <CommsEntry
              key={`${swap.transactionHash}-${i}`}
              swap={swap}
              agentImage={makerImageMap.get(swap.maker.toLowerCase()) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommsEntry({ swap, agentImage }: { swap: SwapEvent; agentImage: string | null }) {
  const time = new Date(swap.timestamp * 1000);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

  const isBuy = swap.type === 'buy';
  const maker = swap.makerName ?? truncateAddress(swap.maker);
  const ethStr = swap.amountETH > 0 ? swap.amountETH.toFixed(4) : '0';
  const isCross = swap.isCrossTrade;

  const actionColor = isBuy ? 'text-crt-green' : 'text-[#ff4444]';
  const actionGlow = isBuy ? 'rgba(52,211,153,0.3)' : 'rgba(255,68,68,0.3)';

  return (
    <div className="group flex gap-2.5 px-3 py-2.5 border-b border-[#0a0303] last:border-0 hover:bg-[#0a0404] transition-colors">
      {/* Agent avatar */}
      <div className="shrink-0 mt-0.5">
        {agentImage ? (
          <img
            src={agentImage}
            alt=""
            className="w-7 h-7 border border-[#1e0606]"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-7 h-7 border border-[#1e0606] bg-[#0a0303] flex items-center justify-center text-crt-dim text-[8px]">
            ?
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 font-mono">
        {/* Agent name + action + meta */}
        <div className="flex items-center gap-1.5 text-[10px] leading-tight">
          {/* Agent name — clickable if they have a token */}
          {swap.makerTokenAddress ? (
            <a
              href={`${FLAUNCH_URL}/coin/${swap.makerTokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-crt-text font-medium truncate max-w-[140px] hover:text-[#ff4444] transition-colors"
            >
              {maker}
            </a>
          ) : (
            <span className="text-crt-text truncate max-w-[140px]">{maker}</span>
          )}

          <span
            className={`${actionColor} shrink-0`}
            style={{ textShadow: `0 0 4px ${actionGlow}` }}
          >
            {isBuy ? 'bought' : 'sold'}
          </span>

          <a
            href={`${FLAUNCH_URL}/coin/${swap.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-crt-text opacity-60 hover:opacity-100 transition-opacity truncate"
          >
            {swap.tokenSymbol}
          </a>

          {/* Badges */}
          {swap.isAgentSwap && !isCross && (
            <span
              className="text-[8px] text-[#38bdf8] px-1 border border-[#38bdf820] shrink-0"
              style={{ textShadow: '0 0 4px rgba(56,189,248,0.2)' }}
            >
              agent
            </span>
          )}
          {isCross && (
            <span
              className="text-[8px] text-[#a78bfa] px-1 border border-[#a78bfa20] shrink-0"
              style={{ textShadow: '0 0 4px rgba(167,139,250,0.2)' }}
            >
              cross
            </span>
          )}

          {/* Right-aligned meta */}
          <span className="ml-auto flex items-center gap-1.5 shrink-0 text-crt-dim opacity-30">
            <span className="text-[9px]">{ethStr} ETH</span>
            <span className="text-[9px]">{timeStr}</span>
            <a
              href={`${BASESCAN_TX}/${swap.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8px] opacity-50 hover:opacity-100 hover:text-[#ff4444] transition-all"
              title="View on Basescan"
            >
              tx&#8599;
            </a>
          </span>
        </div>

        {/* Memo — the main content, displayed prominently */}
        <div
          className="mt-1 text-[11px] text-crt-text opacity-60 leading-relaxed group-hover:opacity-90 transition-opacity"
        >
          {swap.memo}
        </div>
      </div>
    </div>
  );
}
