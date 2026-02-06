"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { CryptoIcon } from "@/components/CryptoIcon";
import { SelectModal } from "@/components/SelectModal";
import { OrderBook } from "@/components/OrderBook";
import { tokens, getTokenById, getRate } from "@/lib/tokens";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function TradePage() {
  const [baseToken, setBaseToken] = useState("bnb");
  const [quoteToken, setQuoteToken] = useState("usdt");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [modal, setModal] = useState<"base" | "quote" | null>(null);

  const baseData = getTokenById(baseToken);
  const quoteData = getTokenById(quoteToken);
  const rate = getRate(baseToken, quoteToken);
  const precision = rate >= 100 ? 2 : rate >= 1 ? 4 : 6;

  const priceValue = orderType === "market" ? rate : (parseFloat(limitPrice) || 0);
  const amountValue = parseFloat(amount) || 0;
  const total = priceValue * amountValue;

  // ── Mock chart data ──
  const chartData = useMemo(() => {
    const rand = seededRandom(hashStr(baseToken + quoteToken + "c"));
    const data: number[] = [];
    let p = rate * 0.97;
    for (let i = 0; i < 96; i++) {
      p += (rand() - 0.48) * rate * 0.004;
      p = Math.max(rate * 0.92, Math.min(rate * 1.05, p));
      data.push(p);
    }
    data.push(rate);
    return data;
  }, [baseToken, quoteToken, rate]);

  const chart = useMemo(() => {
    const W = 800, H = 300, pad = 20;
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;
    const pts = chartData.map((v, i) => ({
      x: (i / (chartData.length - 1)) * W,
      y: pad + (1 - (v - min) / range) * (H - 2 * pad),
    }));
    const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `0,${H} ${line} ${W},${H}`;
    const last = pts[pts.length - 1];
    const up = chartData[chartData.length - 1] >= chartData[0];
    return { W, H, pad, line, area, last, color: up ? "#4ade80" : "#e84142" };
  }, [chartData]);

  // ── Mock recent trades ──
  const trades = useMemo(() => {
    const rand = seededRandom(hashStr(baseToken + quoteToken + "t"));
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => {
      const side = rand() > 0.5 ? "buy" : "sell";
      const p = rate * (0.998 + rand() * 0.004);
      const a = 0.01 + rand() * 3;
      const t = new Date(now - i * 30000 - rand() * 30000);
      return {
        side,
        price: p,
        amount: a,
        time: t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      };
    });
  }, [baseToken, quoteToken, rate]);

  // ── Token selection ──
  const handleTokenSelect = (side: "base" | "quote", id: string) => {
    if (side === "base") {
      if (id === quoteToken) setQuoteToken(baseToken);
      setBaseToken(id);
    } else {
      if (id === baseToken) setBaseToken(quoteToken);
      setQuoteToken(id);
    }
    setLimitPrice("");
    setAmount("");
  };

  const handleNum = (setter: (v: string) => void) => (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) setter(value);
  };

  const modalConfig =
    modal === "base"
      ? {
          title: "Select Base Token",
          items: tokens.map((t) => ({ id: t.id, name: t.name, symbol: t.symbol })),
          selectedId: baseToken,
          onSelect: (id: string) => handleTokenSelect("base", id),
        }
      : modal === "quote"
        ? {
            title: "Select Quote Token",
            items: tokens.map((t) => ({ id: t.id, name: t.name, symbol: t.symbol })),
            selectedId: quoteToken,
            onSelect: (id: string) => handleTokenSelect("quote", id),
          }
        : null;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-4 pb-10">
        {/* ── Pair header bar ── */}
        <div className="flex items-center gap-4 mb-4 bg-[#161619] rounded-2xl border border-[#1e1e24] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              <CryptoIcon id={baseToken} size={28} />
              <CryptoIcon id={quoteToken} size={28} />
            </div>
            <button
              onClick={() => setModal("base")}
              className="flex items-center gap-1 text-[18px] font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              {baseData?.symbol}
              <ChevronDown size={14} className="text-[#666]" />
            </button>
            <span className="text-[#555]">/</span>
            <button
              onClick={() => setModal("quote")}
              className="flex items-center gap-1 text-[18px] font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              {quoteData?.symbol}
              <ChevronDown size={14} className="text-[#666]" />
            </button>
          </div>

          <div className="h-8 w-px bg-[#1e1e24] mx-2" />

          <div className="flex items-center gap-6">
            {[
              { label: "Last Price", value: rate.toFixed(precision), cls: "text-white" },
              { label: "24h Change", value: "+2.34%", cls: "text-[#4ade80]" },
              { label: "24h High", value: (rate * 1.028).toFixed(precision), cls: "text-white" },
              { label: "24h Low", value: (rate * 0.972).toFixed(precision), cls: "text-white" },
              { label: "24h Volume", value: "$12.4M", cls: "text-white" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[11px] text-[#555]">{s.label}</div>
                <div className={`text-[15px] font-medium ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-[1fr_300px] gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {/* ── Chart ── */}
            <div className="bg-[#161619] rounded-2xl border border-[#1e1e24] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[14px] text-[#999]">
                  {baseData?.symbol}/{quoteData?.symbol}
                </div>
                <div className="flex items-center gap-1">
                  {["1H", "4H", "1D", "1W"].map((tf) => (
                    <button
                      key={tf}
                      className={`px-2.5 py-1 text-[12px] rounded-md transition-colors cursor-pointer ${
                        tf === "1D"
                          ? "bg-[#1a1a1e] text-white"
                          : "text-[#555] hover:text-[#999]"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <svg
                viewBox={`0 0 ${chart.W} ${chart.H}`}
                className="w-full h-[300px]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={chart.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    y1={chart.pad + f * (chart.H - 2 * chart.pad)}
                    x2={chart.W}
                    y2={chart.pad + f * (chart.H - 2 * chart.pad)}
                    stroke="#1e1e24"
                    strokeWidth="1"
                  />
                ))}
                <polygon points={chart.area} fill="url(#cg)" />
                <polyline
                  points={chart.line}
                  fill="none"
                  stroke={chart.color}
                  strokeWidth="2"
                />
                <circle
                  cx={chart.last.x}
                  cy={chart.last.y}
                  r="4"
                  fill={chart.color}
                />
                <line
                  x1="0"
                  y1={chart.last.y}
                  x2={chart.W}
                  y2={chart.last.y}
                  stroke={chart.color}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
              </svg>

              <div className="flex justify-between text-[11px] text-[#555] mt-2">
                {["24h ago", "18h", "12h", "6h", "Now"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            {/* ── Order form ── */}
            <div className="bg-[#161619] rounded-2xl border border-[#1e1e24] p-5">
              {/* Buy / Sell toggle */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => setOrderSide("buy")}
                  className={`py-2.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
                    orderSide === "buy"
                      ? "bg-[#4ade80] text-[#111]"
                      : "bg-[#111114] text-[#555] border border-[#1e1e24]"
                  }`}
                >
                  Buy {baseData?.symbol}
                </button>
                <button
                  onClick={() => setOrderSide("sell")}
                  className={`py-2.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
                    orderSide === "sell"
                      ? "bg-[#e84142] text-white"
                      : "bg-[#111114] text-[#555] border border-[#1e1e24]"
                  }`}
                >
                  Sell {baseData?.symbol}
                </button>
              </div>

              {/* Order type */}
              <div className="flex items-center gap-4 mb-4">
                {(["limit", "market"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`text-[13px] font-medium capitalize transition-colors cursor-pointer ${
                      orderType === t ? "text-white" : "text-[#555] hover:text-[#999]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="text-[12px] text-[#666] mb-1.5 block">
                    Price ({quoteData?.symbol})
                  </label>
                  {orderType === "limit" ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={rate.toFixed(precision)}
                      value={limitPrice}
                      onChange={(e) => handleNum(setLimitPrice)(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#111114] rounded-xl border border-[#1e1e24] text-[14px] text-white placeholder:text-[#444] outline-none focus:border-[#2a2a2e]"
                    />
                  ) : (
                    <div className="w-full px-3.5 py-2.5 bg-[#111114] rounded-xl border border-[#1e1e24] text-[14px] text-[#555]">
                      Market Price
                    </div>
                  )}
                </div>
                {/* Amount */}
                <div>
                  <label className="text-[12px] text-[#666] mb-1.5 block">
                    Amount ({baseData?.symbol})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleNum(setAmount)(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#111114] rounded-xl border border-[#1e1e24] text-[14px] text-white placeholder:text-[#444] outline-none focus:border-[#2a2a2e]"
                  />
                </div>
              </div>

              {/* Percentage buttons */}
              <div className="flex items-center gap-2 mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      const bal = 23489.89;
                      const max =
                        orderSide === "buy"
                          ? priceValue > 0
                            ? bal / priceValue
                            : 0
                          : bal;
                      setAmount(((max * pct) / 100).toFixed(4));
                    }}
                    className="flex-1 py-1.5 text-[12px] text-[#666] bg-[#111114] rounded-lg border border-[#1e1e24] hover:text-[#999] hover:border-[#2a2a2e] transition-colors cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e1e24]">
                <span className="text-[13px] text-[#666]">Total</span>
                <span className="text-[14px] text-white font-medium">
                  {total > 0 ? total.toFixed(2) : "0.00"} {quoteData?.symbol}
                </span>
              </div>

              {/* Submit */}
              <button
                className={`w-full mt-4 py-3.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-all ${
                  orderSide === "buy"
                    ? "bg-[#4ade80] text-[#111] hover:brightness-110"
                    : "bg-[#e84142] text-white hover:brightness-110"
                }`}
              >
                {orderSide === "buy" ? "Buy" : "Sell"} {baseData?.symbol}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* ── Order Book ── */}
            {baseData && quoteData && (
              <div className="bg-[#161619] rounded-2xl border border-[#1e1e24] p-4">
                <div className="text-[13px] text-[#999] font-medium mb-3">Order Book</div>
                <OrderBook baseToken={baseData} quoteToken={quoteData} />
              </div>
            )}

            {/* ── Recent Trades ── */}
            <div className="bg-[#161619] rounded-2xl border border-[#1e1e24] p-4">
              <div className="text-[13px] text-[#999] font-medium mb-3">Recent Trades</div>
              <div className="grid grid-cols-3 text-[11px] text-[#555] uppercase tracking-wider mb-2">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Time</span>
              </div>
              <div className="flex flex-col">
                {trades.map((tr, i) => (
                  <div key={i} className="grid grid-cols-3 text-[12px] py-[3px]">
                    <span className={tr.side === "buy" ? "text-[#4ade80]" : "text-[#e84142]"}>
                      {tr.price.toFixed(precision)}
                    </span>
                    <span className="text-right text-[#ccc]">{tr.amount.toFixed(4)}</span>
                    <span className="text-right text-[#555]">{tr.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
