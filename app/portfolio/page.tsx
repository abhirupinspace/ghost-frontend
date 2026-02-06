"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Repeat, Lock, Gift, Zap } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { CryptoIcon } from "@/components/CryptoIcon";
import { getTokenById } from "@/lib/tokens";
import { usePythPrices } from "@/contexts/PythPriceContext";

// ── Mock holdings ──
interface Holding {
  tokenId: string;
  balance: number;
  change24h: number;
}

const holdings: Holding[] = [
  { tokenId: "btc", balance: 0.15, change24h: 4.21 },
  { tokenId: "eth", balance: 2.5, change24h: 9.62 },
  { tokenId: "sol", balance: 15.2, change24h: 10.79 },
  { tokenId: "bnb", balance: 3.5, change24h: 6.37 },
  { tokenId: "usdt", balance: 1_000, change24h: 0.0 },
  { tokenId: "link", balance: 50, change24h: 5.44 },
  { tokenId: "avax", balance: 25, change24h: 3.18 },
];

// ── Mock transactions ──
interface Transaction {
  id: string;
  type: "swap" | "send" | "receive" | "stake" | "claim";
  title: string;
  detail: string;
  time: string;
  ghostPoints: number;
  value: string;
}

const transactions: Transaction[] = [
  { id: "1", type: "swap", title: "Swapped ETH → USDT", detail: "1.2 ETH → 4,140 USDT", time: "2 hours ago", ghostPoints: 165, value: "$4,140" },
  { id: "2", type: "stake", title: "Staked SOL", detail: "15.2 SOL in Solana pool", time: "5 hours ago", ghostPoints: 450, value: "$2,964" },
  { id: "3", type: "swap", title: "Swapped BTC → ETH", detail: "0.05 BTC → 1.42 ETH", time: "8 hours ago", ghostPoints: 240, value: "$4,875" },
  { id: "4", type: "receive", title: "Received USDT", detail: "500 USDT from 0x7a3...f2b1", time: "1 day ago", ghostPoints: 0, value: "$500" },
  { id: "5", type: "claim", title: "Claimed Rewards", detail: "0.0234 ETH from staking", time: "1 day ago", ghostPoints: 30, value: "$80.73" },
  { id: "6", type: "swap", title: "Swapped USDT → AVAX", detail: "500 USDT → 13.15 AVAX", time: "2 days ago", ghostPoints: 95, value: "$500" },
  { id: "7", type: "send", title: "Sent BNB", detail: "1.0 BNB to 0x3c9...a8d4", time: "3 days ago", ghostPoints: 0, value: "$680" },
  { id: "8", type: "stake", title: "Staked USDT", detail: "1,000 USDT in Tether pool", time: "3 days ago", ghostPoints: 320, value: "$1,000" },
  { id: "9", type: "swap", title: "Swapped ETH → SOL", detail: "0.5 ETH → 8.84 SOL", time: "5 days ago", ghostPoints: 110, value: "$1,725" },
  { id: "10", type: "receive", title: "Received ETH", detail: "1.0 ETH from 0xbe2...c914", time: "6 days ago", ghostPoints: 0, value: "$3,450" },
];

const ghostPoints = 12_450;

// ── Helpers ──
function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function formatBalance(n: number): string {
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

function formatPrice(n: number): string {
  if (n >= 1_000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

const txIcons: Record<string, { icon: typeof Repeat; color: string }> = {
  swap: { icon: Repeat, color: "#627eea" },
  send: { icon: ArrowUpRight, color: "#f87171" },
  receive: { icon: ArrowDownLeft, color: "#4ade80" },
  stake: { icon: Lock, color: "#e5e044" },
  claim: { icon: Gift, color: "#4ade80" },
};

type Tab = "portfolio" | "transactions" | "rewards";

export default function PortfolioPage() {
  const { prices } = usePythPrices();
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");

  const getLivePrice = (tokenId: string) => prices[tokenId] ?? getTokenById(tokenId)?.price ?? 0;

  // Compute totals
  const holdingsWithValue = holdings
    .map((h) => {
      const token = getTokenById(h.tokenId);
      const price = getLivePrice(h.tokenId);
      const value = h.balance * price;
      return { ...h, token, price, value };
    })
    .sort((a, b) => b.value - a.value);

  const totalValue = holdingsWithValue.reduce((s, h) => s + h.value, 0);
  const totalChange = holdingsWithValue.reduce((s, h) => s + h.value * (h.change24h / 100), 0);
  const totalChangePct = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
  const isPositive = totalChangePct >= 0;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans relative overflow-hidden">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      <div className="mt-10 mb-8" />

      {/* ── Main card ── */}
      <div className="relative z-10 max-w-[820px] mx-auto bg-[#161619] rounded-[20px] p-7 border border-[#1e1e24]">
        {/* Tab bar */}
        <div className="flex items-center mb-6">
          <span
            onClick={() => setActiveTab("portfolio")}
            className={`text-[28px] font-semibold mr-5 cursor-pointer transition-colors ${
              activeTab === "portfolio" ? "text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Portfolio
          </span>
          <span
            onClick={() => setActiveTab("transactions")}
            className={`text-[28px] font-semibold mr-5 cursor-pointer transition-colors ${
              activeTab === "transactions" ? "text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Transactions
          </span>
          <span
            onClick={() => setActiveTab("rewards")}
            className={`text-[28px] font-semibold cursor-pointer transition-colors ${
              activeTab === "rewards" ? "text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Rewards
          </span>
        </div>

        {/* ════ PORTFOLIO TAB ════ */}
        {activeTab === "portfolio" ? (
          <>
            {/* Total value */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5 mb-3">
              <div className="text-[13px] text-[#666] mb-1">Total Portfolio Value</div>
              <div className="text-[42px] font-light leading-none tracking-tight text-white">
                {formatUsd(totalValue)}
              </div>
              <div className={`text-[14px] mt-2 ${isPositive ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {isPositive ? "▲" : "▼"} {formatUsd(Math.abs(totalChange))} ({isPositive ? "+" : ""}{totalChangePct.toFixed(2)}%)
                <span className="text-[#555] ml-1.5">24h</span>
              </div>
            </div>

            {/* Holdings list */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e24]">
                <span className="text-[12px] text-[#555] uppercase tracking-wider">Asset</span>
                <div className="flex items-center gap-12">
                  <span className="text-[12px] text-[#555] uppercase tracking-wider w-[90px] text-right">Price</span>
                  <span className="text-[12px] text-[#555] uppercase tracking-wider w-[100px] text-right">Balance</span>
                  <span className="text-[12px] text-[#555] uppercase tracking-wider w-[100px] text-right">Value</span>
                </div>
              </div>

              {/* Rows */}
              {holdingsWithValue.map((h) => {
                const pos = h.change24h >= 0;
                return (
                  <div
                    key={h.tokenId}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e24] last:border-b-0 hover:bg-[#0d0d10] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CryptoIcon id={h.tokenId} size={34} />
                      <div>
                        <div className="text-[14px] font-medium text-white">{h.token?.symbol}</div>
                        <div className="text-[12px] text-[#555]">{h.token?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="w-[90px] text-right">
                        <div className="text-[13px] text-white">{formatPrice(h.price)}</div>
                        <div className={`text-[11px] ${pos ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                          {pos ? "+" : ""}{h.change24h.toFixed(2)}%
                        </div>
                      </div>
                      <div className="w-[100px] text-right text-[13px] text-[#ccc]">
                        {formatBalance(h.balance)} <span className="text-[#555]">{h.token?.symbol}</span>
                      </div>
                      <div className="w-[100px] text-right text-[14px] font-medium text-white">
                        {formatUsd(h.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeTab === "transactions" ? (
          /* ════ TRANSACTIONS TAB ════ */
          <>
            {/* Transaction list */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] overflow-hidden">
              {transactions.map((tx) => {
                const { icon: Icon, color } = txIcons[tx.type] || txIcons.swap;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-5 py-4 border-b border-[#1e1e24] last:border-b-0 hover:bg-[#0d0d10] transition-colors"
                  >
                    <div
                      className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${color}15` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-white">{tx.title}</div>
                      <div className="text-[12px] text-[#555]">{tx.detail}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[14px] font-medium text-white">{tx.value}</div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {tx.ghostPoints > 0 ? (
                          <span className="text-[11px] font-semibold text-[#e5e044]">+{tx.ghostPoints} GP</span>
                        ) : (
                          <span className="text-[11px] text-[#333]">--</span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#333] w-[80px] text-right shrink-0">
                      {tx.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ════ REWARDS TAB ════ */
          <>
            {/* Ghost Points overview */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-[#666] mb-1">Total Ghost Points</div>
                  <div className="text-[42px] font-light leading-none tracking-tight text-[#e5e044]">
                    {ghostPoints.toLocaleString()} <span className="text-[16px] text-[#555]">GP</span>
                  </div>
                </div>
                <div className="text-[12px] text-[#555] bg-[#1a1a1e] px-3 py-1.5 rounded-full border border-[#2a2a2e]">
                  2x multiplier
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-4">
                <div className="text-[12px] text-[#555] mb-1">From Swaps</div>
                <div className="text-[18px] font-semibold text-white">
                  {transactions.filter((t) => t.type === "swap").reduce((s, t) => s + t.ghostPoints, 0).toLocaleString()}
                  <span className="text-[12px] text-[#666] ml-1">GP</span>
                </div>
              </div>
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-4">
                <div className="text-[12px] text-[#555] mb-1">From Staking</div>
                <div className="text-[18px] font-semibold text-white">
                  {transactions.filter((t) => t.type === "stake").reduce((s, t) => s + t.ghostPoints, 0).toLocaleString()}
                  <span className="text-[12px] text-[#666] ml-1">GP</span>
                </div>
              </div>
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-4">
                <div className="text-[12px] text-[#555] mb-1">From Claims</div>
                <div className="text-[18px] font-semibold text-white">
                  {transactions.filter((t) => t.type === "claim").reduce((s, t) => s + t.ghostPoints, 0).toLocaleString()}
                  <span className="text-[12px] text-[#666] ml-1">GP</span>
                </div>
              </div>
            </div>

            {/* How to earn */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5 mb-3">
              <div className="text-[14px] font-medium text-white mb-3">How to Earn</div>
              {[
                { action: "Swap tokens", points: "50–250 GP per swap", icon: Repeat, color: "#627eea" },
                { action: "Stake assets", points: "100–500 GP per stake", icon: Lock, color: "#e5e044" },
                { action: "Claim rewards", points: "10–50 GP per claim", icon: Gift, color: "#4ade80" },
                { action: "Refer friends", points: "500 GP per referral", icon: Zap, color: "#e5e044" },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center gap-3 py-3 border-b border-[#1e1e24] last:border-b-0"
                >
                  <div
                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon size={14} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-white">{item.action}</div>
                  </div>
                  <div className="text-[12px] text-[#888]">{item.points}</div>
                </div>
              ))}
            </div>

            {/* Recent GP earning activity */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1e1e24]">
                <span className="text-[12px] text-[#555] uppercase tracking-wider">Recent Earnings</span>
              </div>
              {transactions
                .filter((tx) => tx.ghostPoints > 0)
                .map((tx) => {
                  const { icon: Icon, color } = txIcons[tx.type] || txIcons.swap;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1e1e24] last:border-b-0 hover:bg-[#0d0d10] transition-colors"
                    >
                      <div
                        className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-white">{tx.title}</div>
                        <div className="text-[11px] text-[#555]">{tx.time}</div>
                      </div>
                      <div className="text-[13px] font-semibold text-[#e5e044]">
                        +{tx.ghostPoints} GP
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
