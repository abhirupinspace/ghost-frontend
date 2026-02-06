"use client";

import { RefreshCw, SlidersHorizontal, ChevronDown, ArrowLeftRight } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { usePrivy, useWallets } from "@privy-io/react-auth";

function formatAddress(addr: string) {
  return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
}

export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans relative overflow-hidden">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-8">
          <div className="text-[20px] tracking-tight">
            <span className="font-black">GHOST  </span>
            <span className="font-normal">FINANCE</span>
          </div>
          <nav className="flex items-center gap-5">
            <a href="#" className="text-[14px] text-white font-medium">Swap</a>
            <a href="#" className="text-[14px] text-[#555]">Trade</a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#999]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="4" y1="8.5" x2="12" y2="8.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="4" y1="11.5" x2="9" y2="11.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            History
          </button>
          {ready && authenticated ? (
            <>
              {wallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="flex items-center gap-2 px-3.5 py-2 bg-[#1a1a1e] rounded-full text-[13px] text-[#ccc] border border-[#2a2a2e]"
                >
                  <div className="w-[18px] h-[18px] bg-[#222] rounded-[4px] flex items-center justify-center text-[9px] font-bold text-white border border-[#444]">
                    {wallet.connectorType === "embedded" ? "E" : "W"}
                  </div>
                  {formatAddress(wallet.address)}
                </div>
              ))}
              <button
                onClick={logout}
                className="px-3.5 py-2 text-[13px] text-[#666] hover:text-[#999] transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </>
          ) : ready ? (
            <button
              onClick={login}
              className="bg-[#e5e044] text-[#111] font-semibold px-5 py-2 rounded-full text-[13px] cursor-pointer hover:brightness-110 transition-all"
            >
              Connect Wallet
            </button>
          ) : null}
        </div>
      </header>

      {/* Step indicator */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-10 mb-8">
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#333] text-[14px]">
          <span className="text-white font-medium">1</span>
          <span className="text-white">Select tokens</span>
        </div>
        {[2, 3, 4].map((n) => (
          <div key={n} className="w-[42px] h-[42px] rounded-full border border-[#333] flex items-center justify-center text-[14px] text-[#555]">
            {n}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="relative z-10 max-w-[820px] mx-auto bg-[#161619] rounded-[20px] p-7 border border-[#1e1e24]">
        {/* Tabs row */}
        <div className="flex items-center mb-6">
          <span className="text-[28px] font-semibold text-white mr-5 cursor-pointer">Swap</span>
          <span className="text-[28px] font-semibold text-[#555] cursor-pointer">Pool</span>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-[#777]">
              <RefreshCw size={20} strokeWidth={1.5} />
            </button>
            <button className="text-[#777]">
              <SlidersHorizontal size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Panels container */}
        <div className="relative">
          {/* Top row - Token/Network selection */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* From panel */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] text-white font-medium">From:</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#aaa] border border-[#2a2a2e]">
                  2er6d...8dfg2
                  <div className="w-[16px] h-[16px] bg-[#222] rounded-[3px] flex items-center justify-center text-[8px] font-bold text-white border border-[#444]">N</div>
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex-1">
                  <div className="text-[12px] text-[#666] mb-2.5">Token</div>
                  <button className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#f0b90b] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L10 4L8 6L6 4L8 2Z" fill="#1a1a1e"/>
                        <path d="M12 6L14 8L12 10L10 8L12 6Z" fill="#1a1a1e"/>
                        <path d="M4 6L6 8L4 10L2 8L4 6Z" fill="#1a1a1e"/>
                        <path d="M8 10L10 12L8 14L6 12L8 10Z" fill="#1a1a1e"/>
                      </svg>
                    </div>
                    <span className="text-[15px] font-medium text-white">BNB</span>
                    <ChevronDown size={14} className="text-[#666]" />
                  </button>
                </div>
                <span className="text-[#333] text-[18px] mx-3 mb-1">/</span>
                <div className="flex-1">
                  <div className="text-[12px] text-[#666] mb-2.5">Network</div>
                  <button className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#f0b90b] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2L9 4L7 6L5 4L7 2Z" fill="#1a1a1e"/>
                        <path d="M7 8L9 10L7 12L5 10L7 8Z" fill="#1a1a1e"/>
                        <path d="M4 5L6 7L4 9L2 7L4 5Z" fill="#1a1a1e"/>
                        <path d="M10 5L12 7L10 9L8 7L10 5Z" fill="#1a1a1e"/>
                      </svg>
                    </div>
                    <span className="text-[15px] font-medium text-white">Binance</span>
                    <ChevronDown size={14} className="text-[#666]" />
                  </button>
                </div>
              </div>
            </div>

            {/* To panel */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] text-white font-medium">To:</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#aaa] border border-[#2a2a2e]">
                  0xe5d...85bde
                  <div className="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center overflow-hidden">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="5" cy="5" r="4" fill="#4ade80"/>
                      <circle cx="11" cy="5" r="4" fill="#f59e0b"/>
                      <circle cx="8" cy="11" r="4" fill="#e84142"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex-1">
                  <div className="text-[12px] text-[#666] mb-2.5">Token</div>
                  <button className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#26a17b] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 4V10M4.5 5.5H9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-[15px] font-medium text-white">USDT</span>
                    <ChevronDown size={14} className="text-[#666]" />
                  </button>
                </div>
                <span className="text-[#333] text-[18px] mx-3 mb-1">/</span>
                <div className="flex-1">
                  <div className="text-[12px] text-[#666] mb-2.5">Network</div>
                  <button className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#e84142] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1.5L11 10.5H1L6 1.5Z" fill="white"/>
                      </svg>
                    </div>
                    <span className="text-[15px] font-medium text-white">Avalanche</span>
                    <ChevronDown size={14} className="text-[#666]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Swap direction button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button className="w-[38px] h-[38px] rounded-full bg-[#1a1a1e] border border-[#2a2a2e] flex items-center justify-center text-[#888]">
              <ArrowLeftRight size={15} strokeWidth={1.5} />
            </button>
          </div>

          {/* Bottom row - Amount display */}
          <div className="grid grid-cols-2 gap-3">
            {/* You send */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] text-white font-medium">You send:</span>
                <div className="text-[12px] text-[#888]">
                  Available: 23,489.89{" "}
                  <span className="text-[#e5e044] font-semibold cursor-pointer">MAX</span>
                </div>
              </div>
              <div className="text-right mt-6">
                <div className="text-[52px] font-light leading-none tracking-tight">
                  <span className="text-white">7,695</span>
                  <span className="text-[#555]">.89</span>
                </div>
                <div className="text-[13px] text-[#666] mt-2">≈$24,345</div>
              </div>
            </div>

            {/* You receive */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] text-white font-medium">You receive:</span>
                <div className="text-[12px] text-[#888]">Balance: 7,575.93</div>
              </div>
              <div className="text-right mt-6">
                <div className="text-[52px] font-light leading-none tracking-tight">
                  <span className="text-white">83,924</span>
                  <span className="text-[#555]">.43</span>
                </div>
                <div className="text-[13px] text-[#666] mt-2">≈$23,827</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate info + CTA */}
        <div className="flex items-end justify-between mt-6">
          <div>
            <div className="text-[13px] text-[#999]">
              1 BNB = 35.573989  USDT{" "}
              <span className="text-[#4ade80]">▲ 5.62% (24H)</span>
            </div>
            <div className="text-[12px] text-[#555] mt-1">
              Rate is for reference only. Updated just now
            </div>
          </div>
          <button className="bg-[#e5e044] text-[#111] font-semibold px-8 py-3.5 rounded-full text-[15px] cursor-pointer">
            Select Route{" "}
            <span className="ml-1 tracking-[-1px]">&gt;&gt;&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
