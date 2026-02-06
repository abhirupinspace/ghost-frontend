"use client";

const networkMap: Record<string, string> = {
  ethereum: "eth",
  bnb: "bnb",
  avalanche: "avax",
  polygon: "pol",
  arbitrum: "arb",
  optimism: "op",
  solana: "sol",
  base: "base",
};

const fallbackMeta: Record<string, { color: string; letter: string }> = {
  pol: { color: "#8247e5", letter: "P" },
  arb: { color: "#28a0f0", letter: "A" },
  op: { color: "#ff0420", letter: "O" },
  dai: { color: "#f5ac37", letter: "D" },
  link: { color: "#2a5ada", letter: "L" },
  base: { color: "#0052ff", letter: "B" },
  wbtc: { color: "#f09242", letter: "W" },
};

export function CryptoIcon({ id, size = 30 }: { id: string; size?: number }) {
  const iconId = networkMap[id] || id;
  const s = size;

  switch (iconId) {
    case "btc":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#f7931a" />
          <path
            d="M20 12.8c.3-1.8-1.1-2.8-3-3.4l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.5-1-.3h-2l-.4 1.6s1.1.3 1.1.3c.6.1.7.5.7.8l-.7 2.9h.1l-.1 0-1 4c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.7 1.7 1.9.5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.6c2.6.5 4.5.3 5.3-2 .7-1.9 0-3-1.4-3.7 1-.2 1.7-.9 1.9-2.2zm-3.5 4.9c-.5 1.9-3.6.9-4.6.6l.8-3.3c1 .3 4.3.7 3.8 2.7zm.5-4.9c-.4 1.7-3 .8-3.9.6l.7-3c.9.2 3.6.6 3.2 2.4z"
            fill="white"
          />
        </svg>
      );

    case "eth":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#627eea" />
          <path d="M15 5L9.5 15.2 15 18.2l5.5-3L15 5z" fill="white" fillOpacity="0.85" />
          <path d="M9.5 16.3L15 25l5.5-8.7L15 19.5l-5.5-3.2z" fill="white" fillOpacity="0.65" />
        </svg>
      );

    case "bnb":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#f0b90b" />
          <path d="M15 7l2.5 2.5-4.2 4.2L15 15.5l4.2-4.2L15 7z" fill="white" />
          <path d="M21 12.8l2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5z" fill="white" />
          <path d="M15 18.5l2.5 2.5L15 23.5l-2.5-2.5 2.5-2.5z" fill="white" />
          <path d="M9 12.8l2.5 2.5L9 17.8l-2.5-2.5L9 12.8z" fill="white" />
        </svg>
      );

    case "usdt":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#26a17b" />
          <path
            d="M16.8 13.5v-2h4.2V8H9v3.5h4.2v2c-3.7.2-6.5.9-6.5 1.8 0 1 3.4 1.8 7.3 1.8s7.3-.8 7.3-1.8c0-.9-2.8-1.6-6.5-1.8zm-1.8 2.7c-3.3 0-6-.5-6-1.1s2.7-1.1 6-1.1 6 .5 6 1.1-2.7 1.1-6 1.1z"
            fill="white"
          />
        </svg>
      );

    case "usdc":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#2775ca" />
          <path
            d="M19.2 17.5c0-2-1.2-2.7-3.6-3-.8-.1-1.6-.4-1.6-1.2 0-.7.6-1.1 1.4-1.1.9 0 1.5.3 1.8.9l1.5-.9c-.6-1-1.6-1.5-2.7-1.7V9h-1.6v1.6c-1.8.3-2.8 1.4-2.8 2.8 0 1.9 1.2 2.6 3.4 2.9 1.4.2 1.8.6 1.8 1.3 0 .8-.7 1.3-1.6 1.3-1.1 0-1.8-.5-2.1-1.3l-1.6.8c.5 1.2 1.6 1.9 3 2.1V22h1.6v-1.5c1.8-.3 3.1-1.4 3.1-3z"
            fill="white"
          />
        </svg>
      );

    case "sol":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#9945ff" />
          <path d="M8.5 19.5h10.5l2.5-2.5H11l-2.5 2.5z" fill="white" />
          <path d="M8.5 13l2.5 2.5H21.5L19 13H8.5z" fill="white" />
          <path d="M21.5 10.5H11L8.5 13h10.5l2.5-2.5z" fill="white" />
        </svg>
      );

    case "avax":
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="#e84142" />
          <path d="M15 7l7 14H8l7-14z" fill="white" />
        </svg>
      );

    default: {
      const meta = fallbackMeta[iconId];
      const bgColor = meta?.color || "#666";
      const letter = meta?.letter || iconId.charAt(0).toUpperCase();
      return (
        <svg width={s} height={s} viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill={bgColor} />
          <text
            x="15"
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {letter}
          </text>
        </svg>
      );
    }
  }
}
