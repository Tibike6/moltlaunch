import { useNetworkStore } from '../stores/networkStore';
import AgentDetailPanel from './AgentDetailPanel';
import AgentMemoFeed from './AgentMemoFeed';
import SwapFeed from './SwapFeed';

/** Right sidebar — 420px feed by default, expands to two panels when agent selected */
export default function SidePanel() {
  const selectedAgent = useNetworkStore((s) => s.selectedAgent);

  if (selectedAgent) {
    return (
      <div className="flex shrink-0 border-l border-[#1e0606]">
        {/* Agent stats + portfolio */}
        <div className="w-[390px] shrink-0 hud-panel flex flex-col">
          <AgentDetailPanel />
        </div>
        {/* Agent memo feed */}
        <div className="w-[340px] shrink-0 border-l border-[#1e0606] hud-panel flex flex-col">
          <AgentMemoFeed />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] shrink-0 border-l border-[#1e0606] hud-panel flex flex-col">
      <SwapFeed />
    </div>
  );
}
