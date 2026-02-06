"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Gift, Lock, TrendingUp } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { CryptoIcon } from "@/components/CryptoIcon";
import { getTokenById } from "@/lib/tokens";

interface Pool {
  id: string;
  token: string;
  name: string;
  apy: number;
  tvl: number;
  staked: number;
  rewards: number;
  lockDays: number;
  minStake: number;
}

const pools: Pool[] = [
  { id: "eth", token: "eth", name: "Ethereum", apy: 4.2, tvl: 240_000_000, staked: 2.5, rewards: 0.0234, lockDays: 7, minStake: 0.01 },
  { id: "bnb", token: "bnb", name: "BNB", apy: 3.8, tvl: 180_000_000, staked: 0, rewards: 0, lockDays: 3, minStake: 0.1 },
  { id: "sol", token: "sol", name: "Solana", apy: 6.5, tvl: 95_000_000, staked: 15.2, rewards: 0.456, lockDays: 14, minStake: 0.5 },
  { id: "avax", token: "avax", name: "Avalanche", apy: 5.1, tvl: 42_000_000, staked: 0, rewards: 0, lockDays: 7, minStake: 1 },
  { id: "pol", token: "pol", name: "Polygon", apy: 7.8, tvl: 28_000_000, staked: 500, rewards: 12.5, lockDays: 5, minStake: 10 },
  { id: "usdt", token: "usdt", name: "Tether", apy: 8.4, tvl: 320_000_000, staked: 1000, rewards: 3.45, lockDays: 0, minStake: 10 },
  { id: "usdc", token: "usdc", name: "USD Coin", apy: 8.1, tvl: 290_000_000, staked: 0, rewards: 0, lockDays: 0, minStake: 10 },
];

function fmtTvl(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtUsd(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n > 0) return `$${n.toFixed(4)}`;
  return "$0.00";
}

export default function StakePage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [stakeTab, setStakeTab] = useState<"stake" | "unstake">("stake");
  const [stakeAmount, setStakeAmount] = useState("");

  // Overview
  const totalStakedUsd = pools.reduce((s, p) => s + p.staked * (getTokenById(p.token)?.price || 0), 0);
  const totalRewardsUsd = pools.reduce((s, p) => s + p.rewards * (getTokenById(p.token)?.price || 0), 0);
  const activePools = pools.filter((p) => p.staked > 0).length;
  const avgApy =
    activePools > 0
      ? pools
          .filter((p) => p.staked > 0)
          .reduce((s, p) => {
            const val = p.staked * (getTokenById(p.token)?.price || 0);
            return s + p.apy * (val / totalStakedUsd);
          }, 0)
      : 0;

  const handleToggle = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      setStakeTab("stake");
      setStakeAmount("");
    }
  };

  const handleInput = (v: string) => {
    if (v === "" || /^\d*\.?\d*$/.test(v)) setStakeAmount(v);
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      <div className="relative z-10 max-w-[920px] mx-auto px-6 pt-6 pb-10">
        <h1 className="text-[28px] font-semibold text-white mb-6">Staking</h1>

        {/* ── Overview stats ── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Staked", value: fmtUsd(totalStakedUsd), icon: <Lock size={14} className="text-[#e5e044]" />, color: "text-white" },
            { label: "Total Rewards", value: fmtUsd(totalRewardsUsd), icon: <Gift size={14} className="text-[#e5e044]" />, color: "text-[#e5e044]" },
            { label: "Avg APY", value: avgApy > 0 ? `${avgApy.toFixed(1)}%` : "—", icon: <TrendingUp size={14} className="text-[#4ade80]" />, color: "text-[#4ade80]" },
            { label: "Active Pools", value: `${activePools} / ${pools.length}`, icon: null, color: "text-white" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#161619] rounded-2xl border border-[#1e1e24] p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                {stat.icon}
                <span className="text-[12px] text-[#555]">{stat.label}</span>
              </div>
              <div className={`text-[20px] font-semibold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Pool list ── */}
        <div className="flex flex-col gap-3">
          {pools.map((pool) => {
            const token = getTokenById(pool.token);
            const price = token?.price || 0;
            const stakedUsd = pool.staked * price;
            const rewardsUsd = pool.rewards * price;
            const isOpen = expanded === pool.id;
            const mockBalance = 23.45;

            return (
              <div
                key={pool.id}
                className={`bg-[#161619] rounded-2xl border transition-colors ${
                  isOpen ? "border-[#2a2a2e]" : "border-[#1e1e24]"
                }`}
              >
                {/* ── Pool summary row ── */}
                <button
                  onClick={() => handleToggle(pool.id)}
                  className="w-full flex items-center gap-4 p-5 cursor-pointer"
                >
                  <CryptoIcon id={pool.token} size={40} />

                  <div className="flex-1 text-left">
                    <div className="text-[15px] font-medium text-white">{pool.name}</div>
                    <div className="text-[12px] text-[#666]">
                      {pool.staked > 0
                        ? `Staked: ${pool.staked} ${token?.symbol} (${fmtUsd(stakedUsd)})`
                        : "No active stake"}
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="text-[18px] font-semibold text-[#4ade80]">{pool.apy}%</div>
                    <div className="text-[11px] text-[#555]">APY</div>
                  </div>

                  <div className="text-right mr-4 hidden sm:block">
                    <div className="text-[14px] font-medium text-white">{fmtTvl(pool.tvl)}</div>
                    <div className="text-[11px] text-[#555]">TVL</div>
                  </div>

                  {isOpen ? (
                    <ChevronUp size={18} className="text-[#555]" />
                  ) : (
                    <ChevronDown size={18} className="text-[#555]" />
                  )}
                </button>

                {/* ── Expanded panel ── */}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="border-t border-[#1e1e24] pt-5">
                      {/* Stake / Unstake toggle */}
                      <div className="grid grid-cols-2 gap-2 mb-5 max-w-[300px]">
                        <button
                          onClick={() => {
                            setStakeTab("stake");
                            setStakeAmount("");
                          }}
                          className={`py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                            stakeTab === "stake"
                              ? "bg-[#e5e044] text-[#111]"
                              : "bg-[#111114] text-[#555] border border-[#1e1e24]"
                          }`}
                        >
                          Stake
                        </button>
                        <button
                          onClick={() => {
                            setStakeTab("unstake");
                            setStakeAmount("");
                          }}
                          className={`py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                            stakeTab === "unstake"
                              ? "bg-[#1a1a1e] text-white border border-[#2a2a2e]"
                              : "bg-[#111114] text-[#555] border border-[#1e1e24]"
                          }`}
                        >
                          Unstake
                        </button>
                      </div>

                      <div className="grid grid-cols-[1fr_260px] gap-5">
                        {/* Left — input */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[12px] text-[#666]">
                              Amount ({token?.symbol})
                            </label>
                            <span className="text-[12px] text-[#888]">
                              {stakeTab === "stake"
                                ? `Available: ${mockBalance} ${token?.symbol}`
                                : `Staked: ${pool.staked} ${token?.symbol}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={stakeAmount}
                              onChange={(e) => handleInput(e.target.value)}
                              className="flex-1 px-3.5 py-2.5 bg-[#111114] rounded-xl border border-[#1e1e24] text-[14px] text-white placeholder:text-[#444] outline-none focus:border-[#2a2a2e]"
                            />
                            <button
                              onClick={() => {
                                const max = stakeTab === "stake" ? mockBalance : pool.staked;
                                setStakeAmount(max.toString());
                              }}
                              className="px-3 py-2.5 bg-[#111114] rounded-xl border border-[#1e1e24] text-[12px] text-[#e5e044] font-semibold cursor-pointer hover:border-[#2a2a2e] transition-colors"
                            >
                              MAX
                            </button>
                          </div>

                          {/* Percentage shortcuts */}
                          <div className="flex items-center gap-2 mt-2">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                onClick={() => {
                                  const max = stakeTab === "stake" ? mockBalance : pool.staked;
                                  setStakeAmount(((max * pct) / 100).toFixed(4));
                                }}
                                className="flex-1 py-1 text-[11px] text-[#666] bg-[#111114] rounded-lg border border-[#1e1e24] hover:text-[#999] hover:border-[#2a2a2e] transition-colors cursor-pointer"
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          {/* USD estimate */}
                          {parseFloat(stakeAmount) > 0 && (
                            <div className="text-[12px] text-[#666] mt-2">
                              ≈{fmtUsd(parseFloat(stakeAmount) * price)}
                            </div>
                          )}

                          {/* CTA */}
                          <button className="w-full mt-4 py-3 rounded-xl text-[14px] font-semibold cursor-pointer bg-[#e5e044] text-[#111] hover:brightness-110 transition-all">
                            {stakeTab === "stake" ? "Confirm Stake" : "Confirm Unstake"}
                          </button>
                        </div>

                        {/* Right — info cards */}
                        <div className="flex flex-col gap-3">
                          {/* Rewards */}
                          {pool.staked > 0 && (
                            <div className="bg-[#111114] rounded-xl border border-[#1e1e24] p-3.5">
                              <div className="flex items-center gap-2 mb-2">
                                <Gift size={14} className="text-[#e5e044]" />
                                <span className="text-[12px] text-[#999]">Rewards Earned</span>
                              </div>
                              <div className="text-[16px] font-semibold text-white">
                                {pool.rewards} {token?.symbol}
                              </div>
                              <div className="text-[12px] text-[#666] mb-3">
                                ≈{fmtUsd(rewardsUsd)}
                              </div>
                              <button className="w-full py-2 rounded-lg text-[12px] font-semibold bg-[#1a1a1e] text-[#e5e044] border border-[#2a2a2e] cursor-pointer hover:bg-[#222] transition-colors">
                                Claim Rewards
                              </button>
                            </div>
                          )}

                          {/* Pool info */}
                          <div className="bg-[#111114] rounded-xl border border-[#1e1e24] p-3.5">
                            <div className="text-[12px] text-[#999] mb-2">Pool Info</div>
                            {[
                              { label: "APY", value: `${pool.apy}%`, cls: "text-[#4ade80]" },
                              { label: "TVL", value: fmtTvl(pool.tvl), cls: "text-white" },
                              {
                                label: "Lock Period",
                                value: pool.lockDays > 0 ? `${pool.lockDays} days` : "None",
                                cls: "text-white",
                              },
                              {
                                label: "Min Stake",
                                value: `${pool.minStake} ${token?.symbol}`,
                                cls: "text-white",
                              },
                            ].map((row) => (
                              <div
                                key={row.label}
                                className="flex items-center justify-between py-1"
                              >
                                <span className="text-[12px] text-[#666]">{row.label}</span>
                                <span className={`text-[12px] font-medium ${row.cls}`}>
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
