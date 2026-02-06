"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown, ArrowDown, Globe, Share2, MoreHorizontal, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";
import { DotPattern } from "@/components/ui/dot-pattern";
import { SelectModal } from "@/components/SelectModal";
import { tokens, getTokenById, getNetworkById } from "@/lib/tokens";
import { exploreTokens, getExploreToken, formatCompact, formatPrice } from "@/lib/explore-tokens";
import { usePythPrices } from "@/contexts/PythPriceContext";

// ── Helpers ──
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Chart data ──
type Timeframe = "1H" | "1D" | "1W" | "1M" | "1Y" | "ALL";

function generateChartData(tokenId: string, tf: Timeframe, basePrice: number) {
  const rand = seededRandom(hashStr(tokenId + tf));
  const count: Record<Timeframe, number> = { "1H": 60, "1D": 96, "1W": 84, "1M": 60, "1Y": 104, ALL: 200 };
  const n = count[tf];
  const vol: Record<Timeframe, number> = { "1H": 0.0008, "1D": 0.003, "1W": 0.008, "1M": 0.015, "1Y": 0.03, ALL: 0.04 };
  const v = vol[tf];
  const prices: number[] = [];
  let val = basePrice * (0.88 + rand() * 0.08);
  // smooth random walk
  let momentum = 0;
  for (let i = 0; i < n; i++) {
    momentum = momentum * 0.92 + (rand() - 0.48) * v;
    val *= 1 + momentum;
    val = Math.max(basePrice * 0.5, val);
    prices.push(val);
  }
  // ease into actual price over last 10%
  const easeLen = Math.floor(n * 0.1);
  for (let i = 0; i < easeLen; i++) {
    const t = (i + 1) / easeLen;
    const idx = n - easeLen + i;
    prices[idx] = prices[idx] * (1 - t) + basePrice * t;
  }
  prices[n - 1] = basePrice;

  const labels: string[] = [];
  if (tf === "1H") { for (let i = 0; i <= 50; i += 10) labels.push(`${i}m`); }
  else if (tf === "1D") labels.push("2 AM", "6 AM", "10 AM", "2 PM", "6 PM", "10 PM");
  else if (tf === "1W") labels.push("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
  else if (tf === "1M") labels.push("W1", "W2", "W3", "W4");
  else if (tf === "1Y") labels.push("Jan", "Mar", "May", "Jul", "Sep", "Nov");
  else labels.push("2021", "2022", "2023", "2024", "2025");
  return { prices, labels };
}

// ── SVG Chart ──
function PriceChart({ data, labels, positive }: { data: number[]; labels: string[]; positive: boolean }) {
  if (!data.length) return null;
  const W = 720;
  const H = 320;
  const PR = 70; // right padding for y labels
  const PB = 24; // bottom padding for x labels
  const PT = 8;
  const cW = W - PR;
  const cH = H - PB - PT;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = range * 0.05;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin;

  const toX = (i: number) => (i / (data.length - 1)) * cW;
  const toY = (v: number) => PT + cH - ((v - yMin) / yRange) * cH;

  // Build smooth path using cardinal spline-like approach (catmull-rom)
  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(i - 2, 0)];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[Math.min(i + 1, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  const areaD = `${d} L${cW},${PT + cH} L0,${PT + cH} Z`;

  const color = positive ? "#4ade80" : "#f87171";
  const last = pts[pts.length - 1];

  // Y ticks (5)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = yMin + (yRange * (4 - i)) / 4;
    return { val, y: toY(val) };
  });

  // X label positions
  const xPos = labels.map((_, i) => (i / Math.max(labels.length - 1, 1)) * cW);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid */}
      {yTicks.map((t, i) => (
        <line key={i} x1="0" y1={t.y} x2={cW} y2={t.y} stroke="#161619" strokeWidth="1" />
      ))}

      {/* Area + line */}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />

      {/* Dot at current price */}
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
      <circle cx={last.x} cy={last.y} r="6" fill={color} fillOpacity="0.2" />

      {/* Horizontal dashed line at current price */}
      <line x1={last.x} y1={last.y} x2={cW} y2={last.y} stroke={color} strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.4" />

      {/* Y labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={cW + 8} y={t.y + 4} fill="#444" fontSize="10" fontFamily="system-ui, sans-serif">{formatPrice(t.val)}</text>
      ))}

      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={xPos[i]} y={H - 4} fill="#333" fontSize="10" fontFamily="system-ui, sans-serif" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ── Compact Order Book ──
function OrderBook({ tokenId, price }: { tokenId: string; price: number }) {
  const { asks, bids, spreadPct, maxTotal } = useMemo(() => {
    const rand = seededRandom(hashStr(tokenId + "ob"));
    const askOrders: { price: number; size: number; total: number }[] = [];
    const bidOrders: { price: number; size: number; total: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const ao = (i + 1) * price * 0.0005 * (0.5 + rand());
      const as = 0.02 + rand() * 3;
      askOrders.push({ price: price + ao, size: as, total: (price + ao) * as });
      const bo = (i + 1) * price * 0.0005 * (0.5 + rand());
      const bs = 0.02 + rand() * 3;
      bidOrders.push({ price: price - bo, size: bs, total: (price - bo) * bs });
    }
    askOrders.sort((a, b) => a.price - b.price);
    bidOrders.sort((a, b) => b.price - a.price);
    const mt = Math.max(...[...askOrders, ...bidOrders].map(o => o.total));
    const sp = askOrders[0].price - bidOrders[0].price;
    return { asks: askOrders, bids: bidOrders, spreadPct: (sp / price) * 100, maxTotal: mt };
  }, [tokenId, price]);

  const prec = price >= 100 ? 2 : price >= 1 ? 4 : 6;

  return (
    <div>
      <div className="grid grid-cols-3 text-[10px] text-[#333] uppercase tracking-wider px-2 pb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      {[...asks].reverse().map((o, i) => (
        <div key={`a${i}`} className="relative grid grid-cols-3 text-[12px] px-2 py-[3px]">
          <div className="absolute right-0 top-0 bottom-0 bg-[#f8717108]" style={{ width: `${(o.total / maxTotal) * 100}%` }} />
          <span className="relative text-[#f87171]">{o.price.toFixed(prec)}</span>
          <span className="relative text-right text-[#555]">{o.size.toFixed(4)}</span>
          <span className="relative text-right text-[#333]">{o.total.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-2 py-2 my-0.5 border-y border-[#161619]">
        <span className="text-[13px] font-semibold text-white">{price.toFixed(prec)}</span>
        <span className="text-[10px] text-[#333]">Spread {spreadPct.toFixed(3)}%</span>
      </div>
      {bids.map((o, i) => (
        <div key={`b${i}`} className="relative grid grid-cols-3 text-[12px] px-2 py-[3px]">
          <div className="absolute right-0 top-0 bottom-0 bg-[#4ade8008]" style={{ width: `${(o.total / maxTotal) * 100}%` }} />
          <span className="relative text-[#4ade80]">{o.price.toFixed(prec)}</span>
          <span className="relative text-right text-[#555]">{o.size.toFixed(4)}</span>
          <span className="relative text-right text-[#333]">{o.total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Swap Widget ──
function SwapWidget({ tokenId, tokenSymbol }: { tokenId: string; tokenSymbol: string }) {
  const [tab, setTab] = useState<"swap" | "limit">("swap");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellToken, setSellToken] = useState<string | null>(null);
  const [modal, setModal] = useState<"sell" | "buy" | null>(null);

  const handleDecimalInput = (value: string, setter: (v: string) => void) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) setter(value);
  };

  const sellTokenData = sellToken ? tokens.find(t => t.id === sellToken) : null;

  return (
    <>
      <div className="bg-[#0d0d10] rounded-2xl border border-[#18181c] p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-[#09090c] rounded-full p-0.5">
            {(["swap", "limit"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer capitalize ${tab === t ? "bg-[#1a1a1f] text-white" : "text-[#444] hover:text-[#888]"}`}>
                {t}
              </button>
            ))}
          </div>
          <button className="text-[#333] hover:text-white transition-colors cursor-pointer"><Settings size={15} /></button>
        </div>

        <div className="bg-[#09090c] rounded-xl p-3.5 mb-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#444]">Sell</span>
            <button onClick={() => setModal("sell")} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium cursor-pointer transition-colors shrink-0 ${sellToken ? "bg-[#131316] border border-[#1e1e22] text-white" : "bg-[#e5e044] text-[#111] hover:brightness-110"}`}>
              {sellToken ? (<><CryptoIcon id={sellToken} size={15} />{sellTokenData?.symbol}</>) : "Select token"}
              <ChevronDown size={10} />
            </button>
          </div>
          <input type="text" inputMode="decimal" placeholder="0" value={sellAmount} onChange={(e) => handleDecimalInput(e.target.value, setSellAmount)} className="w-full text-[22px] font-light bg-transparent outline-none text-white placeholder:text-[#222]" />
        </div>

        <div className="flex justify-center -my-0.5 relative z-10">
          <div className="w-[28px] h-[28px] rounded-full bg-[#0d0d10] border border-[#18181c] flex items-center justify-center">
            <ArrowDown size={13} className="text-[#444]" />
          </div>
        </div>

        <div className="bg-[#09090c] rounded-xl p-3.5 mt-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#444]">Buy</span>
            <button onClick={() => setModal("buy")} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131316] border border-[#1e1e22] text-white text-[12px] font-medium hover:border-[#333] transition-colors cursor-pointer shrink-0">
              <CryptoIcon id={tokenId} size={15} />{tokenSymbol}<ChevronDown size={10} />
            </button>
          </div>
          <input type="text" inputMode="decimal" placeholder="0" value={buyAmount} onChange={(e) => handleDecimalInput(e.target.value, setBuyAmount)} className="w-full text-[22px] font-light bg-transparent outline-none text-white placeholder:text-[#222]" />
          <div className="text-[10px] text-[#333] mt-1">$0</div>
        </div>

        <button className="w-full mt-3 py-3 rounded-full bg-[#131316] text-[13px] font-medium text-[#444] cursor-not-allowed">
          {sellToken ? "Enter an amount" : "Select a token"}
        </button>
      </div>

      {modal && (
        <SelectModal
          title="Select Token"
          items={tokens.map((t) => ({ id: t.id, name: t.name, symbol: t.symbol }))}
          selectedId={modal === "sell" ? (sellToken || "") : tokenId}
          onSelect={(id) => { if (modal === "sell") setSellToken(id); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ── Page ──
export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const token = getExploreToken(tokenId);
  const tokenInfo = getTokenById(tokenId);
  const { prices: livePrices } = usePythPrices();
  const livePrice = livePrices[tokenId] ?? token?.price ?? 0;

  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [showFullDesc, setShowFullDesc] = useState(false);

  const chartData = useMemo(() => {
    if (!token) return { prices: [], labels: [] };
    return generateChartData(tokenId, timeframe, livePrice);
  }, [tokenId, timeframe, token, livePrice]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] text-[#444] mb-3">Token not found</p>
          <Link href="/explore" className="text-[#e5e044] text-[14px] hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const priceChange = livePrice * (token.change1d / 100);
  const positive = token.change1d >= 0;
  const tokenNetworks = tokenInfo?.networks || [];
  const descTruncated = token.description.length > 180;
  const displayDesc = showFullDesc ? token.description : token.description.slice(0, 180) + (descTruncated ? "..." : "");

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans relative overflow-hidden">
      <DotPattern cr={0.6} width={32} height={32} className="z-0 text-[#1a1a1a] opacity-40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_60%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-5 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] mb-5">
          <Link href="/explore" className="text-[#444] hover:text-white transition-colors">Tokens</Link>
          <span className="text-[#222]">/</span>
          <span className="text-[#999]">{token.symbol}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <CryptoIcon id={token.id} size={34} />
              <h1 className="text-[24px] font-semibold">{token.name}</h1>
              <span className="text-[16px] text-[#444]">{token.symbol}</span>
              <div className="flex items-center gap-0.5 ml-1">
                {tokenNetworks.slice(0, 5).map(nid => (
                  <div key={nid} className="w-[18px] h-[18px] rounded-full bg-[#111] flex items-center justify-center" title={getNetworkById(nid)?.name}>
                    <CryptoIcon id={nid} size={12} />
                  </div>
                ))}
                {tokenNetworks.length > 5 && <span className="text-[9px] text-[#444] ml-0.5">+{tokenNetworks.length - 5}</span>}
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-[32px] font-semibold tracking-tight">{formatPrice(livePrice)}</span>
              <span className={`text-[14px] font-medium flex items-center gap-1 ${positive ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPrice(Math.abs(priceChange))} ({Math.abs(token.change1d).toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {[
              <svg key="w" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
              <svg key="x" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              <Share2 key="s" size={13} />,
              <MoreHorizontal key="m" size={13} />,
            ].map((icon, i) => (
              <button key={i} className="w-[30px] h-[30px] rounded-full bg-[#0d0d10] border border-[#18181c] flex items-center justify-center text-[#444] hover:text-white transition-colors cursor-pointer">{icon}</button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">

            {/* Chart */}
            <div className="mb-2">
              <PriceChart data={chartData.prices} labels={chartData.labels} positive={positive} />
            </div>

            {/* Timeframe controls */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-0.5">
                {(["1H", "1D", "1W", "1M", "1Y", "ALL"] as Timeframe[]).map((tf) => (
                  <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${timeframe === tf ? "bg-[#18181c] text-white" : "text-[#333] hover:text-[#888]"}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row — no cards, just clean text */}
            <div className="flex items-start gap-10 mb-10 pb-8 border-b border-[#141417]">
              {[
                { label: "Market Cap", value: formatCompact(token.marketCap) },
                { label: "FDV", value: formatCompact(token.fdv) },
                { label: "24h Volume", value: formatCompact(token.volume) },
                { label: "TVL", value: token.tvl > 0 ? formatCompact(token.tvl) : "-" },
                { label: "1h", value: `${token.change1h >= 0 ? "+" : ""}${token.change1h.toFixed(2)}%`, color: token.change1h >= 0 ? "text-[#4ade80]" : "text-[#f87171]" },
                { label: "24h", value: `${token.change1d >= 0 ? "+" : ""}${token.change1d.toFixed(2)}%`, color: token.change1d >= 0 ? "text-[#4ade80]" : "text-[#f87171]" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[10px] text-[#333] uppercase tracking-wider mb-1">{s.label}</div>
                  <div className={`text-[15px] font-semibold ${"color" in s ? s.color : "text-white"}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Order Book */}
            <div className="mb-8">
              <div className="text-[14px] font-semibold text-[#999] mb-4">Order Book</div>
              <OrderBook tokenId={tokenId} price={livePrice} />
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-[340px] shrink-0 space-y-6">

            <SwapWidget tokenId={token.id} tokenSymbol={token.symbol} />

            {/* About — no card, just content */}
            <div className="px-1">
              <div className="text-[13px] font-semibold text-[#999] mb-3">About {token.name}</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { icon: <Globe size={11} />, label: "Website" },
                  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, label: "Twitter" },
                  { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, label: "Explorer" },
                ].map((l) => (
                  <button key={l.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0d0d10] border border-[#18181c] text-[10px] text-[#555] hover:text-white transition-colors cursor-pointer">
                    {l.icon} {l.label}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-[#555] leading-relaxed">{displayDesc}</p>
              {descTruncated && (
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-[11px] text-[#333] hover:text-white mt-1 cursor-pointer transition-colors">
                  {showFullDesc ? "Show less" : "Show more..."}
                </button>
              )}
            </div>

            {/* Networks — minimal inline list */}
            <div className="px-1">
              <div className="text-[13px] font-semibold text-[#999] mb-3">Networks</div>
              <div className="flex flex-wrap gap-1.5">
                {tokenNetworks.map(nid => {
                  const net = getNetworkById(nid);
                  return net ? (
                    <div key={nid} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0d0d10] border border-[#18181c] text-[11px] text-[#555]">
                      <CryptoIcon id={nid} size={14} />
                      {net.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
