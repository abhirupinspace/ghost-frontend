"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, LayoutGrid } from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";
import { DotPattern } from "@/components/ui/dot-pattern";
import { exploreTokens, formatCompact, formatPrice } from "@/lib/explore-tokens";

type SortKey = "volume" | "price" | "change1h" | "change1d" | "fdv";
type TabKey = "tokens" | "auctions" | "pools" | "transactions";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((val - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={points}
        stroke={positive ? "#4ade80" : "#f87171"}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function ChangeCell({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-[#666]">▲ 0.00%</span>;
  }
  const positive = value >= 0;
  return (
    <span className={positive ? "text-[#4ade80]" : "text-[#f87171]"}>
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("tokens");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [volumeTimeframe, setVolumeTimeframe] = useState("1H");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tokens", label: "Tokens" },
    { key: "auctions", label: "Auctions" },
    { key: "pools", label: "Pools" },
    { key: "transactions", label: "Transactions" },
  ];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...exploreTokens];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [searchQuery, sortKey, sortAsc]);

  const SortArrow = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return <span className="ml-0.5 text-[10px]">{sortAsc ? "↑" : "↓"}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans relative overflow-hidden">
      <DotPattern
        cr={1.2}
        width={24}
        height={24}
        className="z-0 text-[#333] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[20px] font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-[#161619] border border-[#1e1e24] text-[#888] hover:text-white transition-colors cursor-pointer">
              <LayoutGrid size={16} />
            </button>

            {/* Volume timeframe dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161619] border border-[#1e1e24] text-[13px] text-[#ccc] hover:text-white transition-colors cursor-pointer"
              >
                {volumeTimeframe} volume
                <ChevronDown size={12} className="text-[#666]" />
              </button>
              {showTimeDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowTimeDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg py-1 z-30 min-w-[120px]">
                    {["1H", "24H", "7D", "30D"].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => { setVolumeTimeframe(tf); setShowTimeDropdown(false); }}
                        className={`block w-full text-left px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                          volumeTimeframe === tf ? "text-white bg-[#222]" : "text-[#888] hover:text-white hover:bg-[#222]"
                        }`}
                      >
                        {tf} volume
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg bg-[#161619] border border-[#1e1e24] text-[#888] hover:text-white transition-colors cursor-pointer"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mb-4">
            <input
              type="text"
              autoFocus
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[#161619] border border-[#1e1e24] rounded-xl text-[14px] text-white placeholder:text-[#555] outline-none focus:border-[#333]"
            />
          </div>
        )}

        {/* Tokens table */}
        {activeTab === "tokens" && (
          <div className="bg-[#161619] rounded-[16px] border border-[#1e1e24] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[50px_1fr_120px_100px_100px_120px_120px_110px] items-center px-5 py-4 border-b border-[#1e1e24] text-[12px] text-[#555]">
              <span>#</span>
              <span>Token name</span>
              <span className="text-right cursor-pointer hover:text-[#888]" onClick={() => handleSort("price")}>
                Price <SortArrow col="price" />
              </span>
              <span className="text-right cursor-pointer hover:text-[#888]" onClick={() => handleSort("change1h")}>
                1H <SortArrow col="change1h" />
              </span>
              <span className="text-right cursor-pointer hover:text-[#888]" onClick={() => handleSort("change1d")}>
                1D <SortArrow col="change1d" />
              </span>
              <span className="text-right cursor-pointer hover:text-[#888]" onClick={() => handleSort("fdv")}>
                FDV <SortArrow col="fdv" />
              </span>
              <span className="text-right cursor-pointer hover:text-[#888]" onClick={() => handleSort("volume")}>
                <span className="inline-flex items-center gap-0.5">
                  {sortKey === "volume" && <span className="text-[10px]">{sortAsc ? "↑" : "↓"}</span>}
                  Volume
                </span>
              </span>
              <span className="text-right">1D chart</span>
            </div>

            {/* Table rows */}
            {filtered.map((token, index) => (
              <Link
                key={token.id + index}
                href={`/explore/${token.id}`}
                className="grid grid-cols-[50px_1fr_120px_100px_100px_120px_120px_110px] items-center px-5 py-4 border-b border-[#1e1e24] last:border-b-0 hover:bg-[#1a1a1e] transition-colors cursor-pointer"
              >
                <span className="text-[13px] text-[#555]">{index + 1}</span>
                <div className="flex items-center gap-3">
                  <CryptoIcon id={token.id} size={28} />
                  <span className="text-[14px] text-white font-medium">{token.name}</span>
                  <span className="text-[13px] text-[#555]">{token.symbol}</span>
                </div>
                <span className="text-[14px] text-white text-right">{formatPrice(token.price)}</span>
                <span className="text-[13px] text-right">
                  <ChangeCell value={token.change1h} />
                </span>
                <span className="text-[13px] text-right">
                  <ChangeCell value={token.change1d} />
                </span>
                <span className="text-[14px] text-white text-right">{formatCompact(token.fdv)}</span>
                <span className="text-[14px] text-white text-right">{formatCompact(token.volume)}</span>
                <div className="flex justify-end">
                  <Sparkline data={token.sparkline} positive={token.change1d >= 0} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "tokens" && (
          <div className="bg-[#161619] rounded-[16px] border border-[#1e1e24] p-16 text-center">
            <p className="text-[#555] text-[16px]">{tabs.find(t => t.key === activeTab)?.label} coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
