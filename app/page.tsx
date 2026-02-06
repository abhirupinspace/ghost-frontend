"use client";

import { useState } from "react";
import { RefreshCw, SlidersHorizontal, ChevronDown, ArrowLeftRight, Clock } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { useWallets } from "@privy-io/react-auth";
import { CryptoIcon } from "@/components/CryptoIcon";
import { SelectModal } from "@/components/SelectModal";
import { formatAddress } from "@/lib/utils";
import {
  tokens,
  networks,
  getTokenById,
  getNetworkById,
  getTokensForNetwork,
  getRate,
} from "@/lib/tokens";

function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function splitNumber(n: number): [string, string] {
  if (n === 0) return ["0", "00"];
  const decimals = n >= 1000 ? 2 : n >= 1 ? 4 : 6;
  const formatted = n.toFixed(decimals);
  const parts = formatted.split(".");
  const wholeFormatted = parseInt(parts[0]).toLocaleString("en-US");
  return [wholeFormatted, parts[1] || "00"];
}

type ModalType = "fromToken" | "toToken" | "fromNetwork" | "toNetwork" | null;

export default function Home() {
  const { wallets } = useWallets();

  const [activeTab, setActiveTab] = useState<"swap" | "limit">("swap");
  const [fromToken, setFromToken] = useState("bnb");
  const [toToken, setToToken] = useState("usdt");
  const [fromNetwork, setFromNetwork] = useState("bnb");
  const [toNetwork, setToNetwork] = useState("avalanche");
  const [sendAmount, setSendAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [limitExpiry, setLimitExpiry] = useState("24h");
  const [modal, setModal] = useState<ModalType>(null);

  // Derived
  const fromTokenData = getTokenById(fromToken);
  const toTokenData = getTokenById(toToken);
  const fromNetworkData = getNetworkById(fromNetwork);
  const toNetworkData = getNetworkById(toNetwork);
  const rate = getRate(fromToken, toToken);
  const sendValue = parseFloat(sendAmount) || 0;
  const receiveValue = sendValue * rate;
  const sendUsd = sendValue * (fromTokenData?.price || 0);
  const receiveUsd = receiveValue * (toTokenData?.price || 0);

  const limitPriceValue = parseFloat(limitPrice) || 0;
  const limitAmountValue = parseFloat(limitAmount) || 0;
  const limitTotal = limitPriceValue * limitAmountValue;

  const fromBalance = 23489.89;
  const toBalance = 7575.93;

  const walletAddress = wallets.length > 0 ? wallets[0].address : null;

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSendAmount(value);
    }
  };

  const handleDecimalInput = (value: string, setter: (v: string) => void) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleSwapDirection = () => {
    const prevFrom = fromToken;
    const prevTo = toToken;
    const prevFromNet = fromNetwork;
    const prevToNet = toNetwork;
    setFromToken(prevTo);
    setToToken(prevFrom);
    setFromNetwork(prevToNet);
    setToNetwork(prevFromNet);
    setSendAmount("");
  };

  const handleTokenSelect = (side: "from" | "to", tokenId: string) => {
    if (side === "from") {
      if (tokenId === toToken) setToToken(fromToken);
      setFromToken(tokenId);
      const token = getTokenById(tokenId);
      if (token && !token.networks.includes(fromNetwork)) {
        setFromNetwork(token.networks[0]);
      }
    } else {
      if (tokenId === fromToken) setFromToken(toToken);
      setToToken(tokenId);
      const token = getTokenById(tokenId);
      if (token && !token.networks.includes(toNetwork)) {
        setToNetwork(token.networks[0]);
      }
    }
  };

  const handleNetworkSelect = (side: "from" | "to", networkId: string) => {
    if (side === "from") {
      setFromNetwork(networkId);
      const available = getTokensForNetwork(networkId);
      if (!available.find((t) => t.id === fromToken) && available.length > 0) {
        setFromToken(available[0].id);
      }
    } else {
      setToNetwork(networkId);
      const available = getTokensForNetwork(networkId);
      if (!available.find((t) => t.id === toToken) && available.length > 0) {
        setToToken(available[0].id);
      }
    }
  };

  const getModalConfig = () => {
    switch (modal) {
      case "fromToken":
        return {
          title: "Select Token",
          items: tokens.map((t) => ({ id: t.id, name: t.name, symbol: t.symbol })),
          selectedId: fromToken,
          onSelect: (id: string) => handleTokenSelect("from", id),
        };
      case "toToken":
        return {
          title: "Select Token",
          items: tokens.map((t) => ({ id: t.id, name: t.name, symbol: t.symbol })),
          selectedId: toToken,
          onSelect: (id: string) => handleTokenSelect("to", id),
        };
      case "fromNetwork":
        return {
          title: "Select Network",
          items: networks.map((n) => ({ id: n.id, name: n.name })),
          selectedId: fromNetwork,
          onSelect: (id: string) => handleNetworkSelect("from", id),
        };
      case "toNetwork":
        return {
          title: "Select Network",
          items: networks.map((n) => ({ id: n.id, name: n.name })),
          selectedId: toNetwork,
          onSelect: (id: string) => handleNetworkSelect("to", id),
        };
      default:
        return null;
    }
  };

  const modalConfig = getModalConfig();
  const [receiveWhole, receiveDec] = splitNumber(receiveValue);
  const ratePrecision = rate >= 100 ? 2 : rate >= 1 ? 4 : 6;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans relative overflow-hidden">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      {/* ── Step indicator (swap only) ── */}
      {activeTab === "swap" ? (
        <div className="relative z-10 flex items-center justify-center gap-3 mt-10 mb-8">
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#333] text-[14px]">
            <span className="text-white font-medium">1</span>
            <span className="text-white">Select tokens</span>
          </div>
          {[2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-[42px] h-[42px] rounded-full border border-[#333] flex items-center justify-center text-[14px] text-[#555]"
            >
              {n}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 mb-8" />
      )}

      {/* ── Main card ── */}
      <div className="relative z-10 max-w-[820px] mx-auto bg-[#161619] rounded-[20px] p-7 border border-[#1e1e24]">
        {/* Tab bar */}
        <div className="flex items-center mb-6">
          <span
            onClick={() => setActiveTab("swap")}
            className={`text-[28px] font-semibold mr-5 cursor-pointer transition-colors ${
              activeTab === "swap" ? "text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Swap
          </span>
          <span
            onClick={() => setActiveTab("limit")}
            className={`text-[28px] font-semibold cursor-pointer transition-colors ${
              activeTab === "limit" ? "text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Limit
          </span>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-[#777] hover:text-white transition-colors cursor-pointer">
              <RefreshCw size={20} strokeWidth={1.5} />
            </button>
            <button className="text-[#777] hover:text-white transition-colors cursor-pointer">
              <SlidersHorizontal size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ════ SWAP VIEW ════ */}
        {activeTab === "swap" ? (
          <>
            <div className="relative">
              {/* Token / Network selectors */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* From panel */}
                <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[14px] text-white font-medium">From:</span>
                    {walletAddress ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#aaa] border border-[#2a2a2e]">
                        {formatAddress(walletAddress)}
                        <CryptoIcon id={fromNetwork} size={16} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#666] border border-[#2a2a2e]">
                        Not connected
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <div className="flex-1">
                      <div className="text-[12px] text-[#666] mb-2.5">Token</div>
                      <button
                        onClick={() => setModal("fromToken")}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <CryptoIcon id={fromToken} size={30} />
                        <span className="text-[15px] font-medium text-white">
                          {fromTokenData?.symbol}
                        </span>
                        <ChevronDown size={14} className="text-[#666]" />
                      </button>
                    </div>
                    <span className="text-[#333] text-[18px] mx-3 mb-1">/</span>
                    <div className="flex-1">
                      <div className="text-[12px] text-[#666] mb-2.5">Network</div>
                      <button
                        onClick={() => setModal("fromNetwork")}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <CryptoIcon id={fromNetwork} size={30} />
                        <span className="text-[15px] font-medium text-white">
                          {fromNetworkData?.name}
                        </span>
                        <ChevronDown size={14} className="text-[#666]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* To panel */}
                <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[14px] text-white font-medium">To:</span>
                    {walletAddress ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#aaa] border border-[#2a2a2e]">
                        {formatAddress(walletAddress)}
                        <CryptoIcon id={toNetwork} size={16} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1e] rounded-lg text-[12px] text-[#666] border border-[#2a2a2e]">
                        Not connected
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <div className="flex-1">
                      <div className="text-[12px] text-[#666] mb-2.5">Token</div>
                      <button
                        onClick={() => setModal("toToken")}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <CryptoIcon id={toToken} size={30} />
                        <span className="text-[15px] font-medium text-white">
                          {toTokenData?.symbol}
                        </span>
                        <ChevronDown size={14} className="text-[#666]" />
                      </button>
                    </div>
                    <span className="text-[#333] text-[18px] mx-3 mb-1">/</span>
                    <div className="flex-1">
                      <div className="text-[12px] text-[#666] mb-2.5">Network</div>
                      <button
                        onClick={() => setModal("toNetwork")}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <CryptoIcon id={toNetwork} size={30} />
                        <span className="text-[15px] font-medium text-white">
                          {toNetworkData?.name}
                        </span>
                        <ChevronDown size={14} className="text-[#666]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap direction */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={handleSwapDirection}
                  className="w-[38px] h-[38px] rounded-full bg-[#1a1a1e] border border-[#2a2a2e] flex items-center justify-center text-[#888] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeftRight size={15} strokeWidth={1.5} />
                </button>
              </div>

              {/* Amount panels */}
              <div className="grid grid-cols-2 gap-3">
                {/* You send */}
                <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-white font-medium">You send:</span>
                    <div className="text-[12px] text-[#888]">
                      Available: {fromBalance.toLocaleString()}{" "}
                      <span
                        className="text-[#e5e044] font-semibold cursor-pointer"
                        onClick={() => setSendAmount(fromBalance.toString())}
                      >
                        MAX
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={sendAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full text-right text-[48px] font-light leading-none tracking-tight bg-transparent outline-none text-white placeholder:text-[#333]"
                    />
                    <div className="text-[13px] text-[#666] mt-2 text-right">
                      {sendValue > 0 ? `≈${formatUsd(sendUsd)}` : "\u00A0"}
                    </div>
                  </div>
                </div>

                {/* You receive */}
                <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-white font-medium">You receive:</span>
                    <div className="text-[12px] text-[#888]">
                      Balance: {toBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right mt-6">
                    <div className="text-[48px] font-light leading-none tracking-tight">
                      {receiveValue > 0 ? (
                        <>
                          <span className="text-white">{receiveWhole}</span>
                          <span className="text-[#555]">.{receiveDec}</span>
                        </>
                      ) : (
                        <span className="text-[#333]">0</span>
                      )}
                    </div>
                    <div className="text-[13px] text-[#666] mt-2">
                      {receiveValue > 0 ? `≈${formatUsd(receiveUsd)}` : "\u00A0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate info + CTA */}
            <div className="flex items-end justify-between mt-6">
              <div>
                <div className="text-[13px] text-[#999]">
                  1 {fromTokenData?.symbol} = {rate.toFixed(ratePrecision)} {toTokenData?.symbol}{" "}
                  <span className="text-[#4ade80]">▲ 5.62% (24H)</span>
                </div>
                <div className="text-[12px] text-[#555] mt-1">
                  Rate is for reference only. Updated just now
                </div>
              </div>
              <button className="bg-[#e5e044] text-[#111] font-semibold px-8 py-3.5 rounded-full text-[15px] cursor-pointer hover:brightness-110 transition-all">
                Select Route{" "}
                <span className="ml-1 tracking-[-1px]">&gt;&gt;&gt;</span>
              </button>
            </div>
          </>
        ) : (
          /* ════ LIMIT VIEW ════ */
          <>
            {/* Pair selector */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setModal("fromToken")}
                className="flex items-center gap-2 px-3 py-2 bg-[#111114] rounded-xl border border-[#1e1e24] hover:border-[#2a2a2e] transition-colors cursor-pointer"
              >
                <CryptoIcon id={fromToken} size={22} />
                <span className="text-[14px] font-medium text-white">
                  {fromTokenData?.symbol}
                </span>
                <ChevronDown size={12} className="text-[#666]" />
              </button>
              <span className="text-[#555] text-[16px]">/</span>
              <button
                onClick={() => setModal("toToken")}
                className="flex items-center gap-2 px-3 py-2 bg-[#111114] rounded-xl border border-[#1e1e24] hover:border-[#2a2a2e] transition-colors cursor-pointer"
              >
                <CryptoIcon id={toToken} size={22} />
                <span className="text-[14px] font-medium text-white">
                  {toTokenData?.symbol}
                </span>
                <ChevronDown size={12} className="text-[#666]" />
              </button>
              <div className="ml-auto text-[13px] text-[#999]">
                Market: 1 {fromTokenData?.symbol} = {rate.toFixed(ratePrecision)} {toTokenData?.symbol}
              </div>
            </div>

            {/* Network selectors */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#666]">From Network</span>
                  <button
                    onClick={() => setModal("fromNetwork")}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <CryptoIcon id={fromNetwork} size={20} />
                    <span className="text-[13px] font-medium text-white">
                      {fromNetworkData?.name}
                    </span>
                    <ChevronDown size={12} className="text-[#666]" />
                  </button>
                </div>
              </div>
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#666]">To Network</span>
                  <button
                    onClick={() => setModal("toNetwork")}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <CryptoIcon id={toNetwork} size={20} />
                    <span className="text-[13px] font-medium text-white">
                      {toNetworkData?.name}
                    </span>
                    <ChevronDown size={12} className="text-[#666]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Limit price */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-white font-medium">Limit Price</span>
                <button
                  onClick={() => setLimitPrice(rate.toFixed(ratePrecision))}
                  className="text-[12px] text-[#e5e044] font-semibold cursor-pointer hover:brightness-110"
                >
                  Use Market
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={limitPrice}
                  onChange={(e) => handleDecimalInput(e.target.value, setLimitPrice)}
                  className="flex-1 text-[32px] font-light leading-none tracking-tight bg-transparent outline-none text-white placeholder:text-[#333]"
                />
                <span className="text-[14px] text-[#666]">{toTokenData?.symbol} per {fromTokenData?.symbol}</span>
              </div>
              {limitPriceValue > 0 && (
                <div className="text-[12px] mt-2 text-[#555]">
                  {limitPriceValue > rate
                    ? <span className="text-[#4ade80]">{((limitPriceValue / rate - 1) * 100).toFixed(2)}% above market</span>
                    : limitPriceValue < rate
                    ? <span className="text-[#f87171]">{((1 - limitPriceValue / rate) * 100).toFixed(2)}% below market</span>
                    : <span>At market price</span>
                  }
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-white font-medium">Amount</span>
                <div className="text-[12px] text-[#888]">
                  Available: {fromBalance.toLocaleString()}{" "}
                  <span
                    className="text-[#e5e044] font-semibold cursor-pointer"
                    onClick={() => setLimitAmount(fromBalance.toString())}
                  >
                    MAX
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={limitAmount}
                  onChange={(e) => handleDecimalInput(e.target.value, setLimitAmount)}
                  className="flex-1 text-[32px] font-light leading-none tracking-tight bg-transparent outline-none text-white placeholder:text-[#333]"
                />
                <span className="text-[14px] text-[#666]">{fromTokenData?.symbol}</span>
              </div>
              {/* Percentage shortcuts */}
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setLimitAmount(((fromBalance * pct) / 100).toString())}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1e] border border-[#2a2a2e] text-[12px] text-[#888] hover:text-white hover:border-[#444] transition-colors cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Total + Expiry */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                <span className="text-[13px] text-[#666] block mb-2">You Receive</span>
                <div className="text-[24px] font-light text-white leading-none">
                  {limitTotal > 0
                    ? limitTotal.toLocaleString("en-US", { maximumFractionDigits: 6 })
                    : <span className="text-[#333]">0</span>
                  }
                </div>
                <span className="text-[12px] text-[#555] mt-1 block">
                  {limitTotal > 0 ? `≈${formatUsd(limitTotal * (toTokenData?.price || 0))}` : "\u00A0"}
                </span>
              </div>
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e24] p-5">
                <span className="text-[13px] text-[#666] block mb-2">Expiry</span>
                <div className="flex gap-2">
                  {["1h", "24h", "7d", "30d"].map((exp) => (
                    <button
                      key={exp}
                      onClick={() => setLimitExpiry(exp)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                        limitExpiry === exp
                          ? "bg-[#e5e044] text-[#111]"
                          : "bg-[#1a1a1e] border border-[#2a2a2e] text-[#888] hover:text-white hover:border-[#444]"
                      }`}
                    >
                      {exp === limitExpiry && <Clock size={12} />}
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              className={`w-full py-4 rounded-full text-[15px] font-semibold transition-all cursor-pointer ${
                limitPriceValue > 0 && limitAmountValue > 0
                  ? "bg-[#e5e044] text-[#111] hover:brightness-110"
                  : "bg-[#1a1a1e] text-[#555] cursor-not-allowed"
              }`}
              disabled={limitPriceValue === 0 || limitAmountValue === 0}
            >
              {limitPriceValue === 0
                ? "Enter Limit Price"
                : limitAmountValue === 0
                ? "Enter Amount"
                : "Place Limit Order"}
            </button>
          </>
        )}
      </div>

      {/* ── Selection Modal ── */}
      {modalConfig && (
        <SelectModal
          title={modalConfig.title}
          items={modalConfig.items}
          selectedId={modalConfig.selectedId}
          onSelect={modalConfig.onSelect}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
