"use client";

import { useMemo } from "react";
import type { Token } from "@/lib/tokens";
import { usePythPrices } from "@/contexts/PythPriceContext";

interface Order {
  price: number;
  amount: number;
  total: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function OrderBook({ baseToken, quoteToken }: { baseToken: Token; quoteToken: Token }) {
  const { prices } = usePythPrices();
  const basePrice = prices[baseToken.id] ?? baseToken.price;
  const quotePrice = prices[quoteToken.id] ?? quoteToken.price;
  const midPrice = quotePrice > 0 ? basePrice / quotePrice : baseToken.price / quoteToken.price;
  const pricePrecision = midPrice >= 100 ? 2 : midPrice >= 1 ? 4 : 6;

  const { asks, bids, maxTotal } = useMemo(() => {
    const rand = seededRandom(hashString(baseToken.id + quoteToken.id));
    const askOrders: Order[] = [];
    const bidOrders: Order[] = [];

    for (let i = 0; i < 8; i++) {
      const askOffset = (i + 1) * midPrice * 0.0008 * (0.5 + rand());
      const askPrice = midPrice + askOffset;
      const askAmount = 0.05 + rand() * 4;
      askOrders.push({ price: askPrice, amount: askAmount, total: askPrice * askAmount });

      const bidOffset = (i + 1) * midPrice * 0.0008 * (0.5 + rand());
      const bidPrice = midPrice - bidOffset;
      const bidAmount = 0.05 + rand() * 4;
      bidOrders.push({ price: bidPrice, amount: bidAmount, total: bidPrice * bidAmount });
    }

    askOrders.sort((a, b) => a.price - b.price);
    bidOrders.sort((a, b) => b.price - a.price);

    const allTotals = [...askOrders, ...bidOrders].map((o) => o.total);
    const max = Math.max(...allTotals);

    return { asks: askOrders, bids: bidOrders, maxTotal: max };
  }, [baseToken.id, quoteToken.id, midPrice]);

  const spread = asks.length && bids.length ? asks[0].price - bids[0].price : 0;
  const spreadPct = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  return (
    <div>
      {/* Column headers */}
      <div className="grid grid-cols-3 text-[11px] text-[#555] uppercase tracking-wider px-3 pb-2.5 border-b border-[#1e1e24]">
        <span>Price ({quoteToken.symbol})</span>
        <span className="text-right">Amount ({baseToken.symbol})</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks — reversed so lowest ask is near the spread */}
      <div className="flex flex-col">
        {[...asks].reverse().map((order, i) => (
          <div key={`ask-${i}`} className="relative grid grid-cols-3 text-[13px] px-3 py-[5px]">
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#e8414215]"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-[#e84142]">{order.price.toFixed(pricePrecision)}</span>
            <span className="relative text-right text-[#ccc]">{order.amount.toFixed(4)}</span>
            <span className="relative text-right text-[#666]">{order.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center gap-2.5 py-2.5 border-y border-[#1e1e24] my-0.5">
        <span className="text-[16px] font-semibold text-white">{midPrice.toFixed(pricePrecision)}</span>
        <span className="text-[11px] text-[#555]">
          Spread: {spread.toFixed(pricePrecision)} ({spreadPct.toFixed(3)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex flex-col">
        {bids.map((order, i) => (
          <div key={`bid-${i}`} className="relative grid grid-cols-3 text-[13px] px-3 py-[5px]">
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#4ade8015]"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-[#4ade80]">{order.price.toFixed(pricePrecision)}</span>
            <span className="relative text-right text-[#ccc]">{order.amount.toFixed(4)}</span>
            <span className="relative text-right text-[#666]">{order.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
