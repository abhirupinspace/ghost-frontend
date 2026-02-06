export interface ExploreToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change1d: number;
  fdv: number;
  volume: number;
  marketCap: number;
  tvl: number;
  description: string;
  sparkline: number[];
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSparkline(rand: () => number, trend: number): number[] {
  const points: number[] = [];
  let val = 50;
  for (let i = 0; i < 24; i++) {
    val += (rand() - 0.48) * 6 + trend * 0.3;
    val = Math.max(10, Math.min(90, val));
    points.push(val);
  }
  return points;
}

export const exploreTokens: ExploreToken[] = [
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2052.91, change1h: 0.22, change1d: 9.62, fdv: 251.4e9, volume: 343.3e6, marketCap: 251.4e9, tvl: 126.3e6, description: "Ethereum is a smart contract platform that enables developers to build tokens and decentralized applications (dapps). ETH is the native currency for the Ethereum platform and also works as the transaction fees to miners on the Ethereum network. Ethereum is the pioneer for blockchain based smart contracts.", sparkline: [] },
  { id: "usdt", name: "Tether USD", symbol: "USDT", price: 1.0, change1h: 0.0, change1d: 0.0, fdv: 191e9, volume: 14e6, marketCap: 191e9, tvl: 0, description: "Tether (USDT) is a cryptocurrency stablecoin pegged to the U.S. dollar, issued by the Hong Kong-based company Tether. It was designed to always be worth $1.00, maintaining $1.00 in reserves for each USDT issued.", sparkline: [] },
  { id: "usdc", name: "USD Coin", symbol: "USDC", price: 1.0, change1h: 0.28, change1d: 0.2, fdv: 71.9e9, volume: 10.5e6, marketCap: 71.9e9, tvl: 0, description: "USD Coin (USDC) is a stablecoin fully backed by U.S. dollars held in reserve. It is issued by regulated financial institutions and governed by Centre, a consortium founded by Circle and Coinbase.", sparkline: [] },
  { id: "sol", name: "Solana", symbol: "SOL", price: 87.07, change1h: 0.91, change1d: 10.79, fdv: 52.8e9, volume: 10.3e6, marketCap: 42.1e9, tvl: 89.5e6, description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. It is known for its fast transaction speeds and low costs, using a unique proof-of-history consensus mechanism.", sparkline: [] },
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 97500, change1h: 0.35, change1d: 4.21, fdv: 1.9e12, volume: 9.8e6, marketCap: 1.9e12, tvl: 0, description: "Bitcoin is a decentralized cryptocurrency originally described in a 2008 whitepaper by Satoshi Nakamoto. It was launched in January 2009 and is the world's first and most well-known digital currency.", sparkline: [] },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 658.81, change1h: 0.31, change1d: 6.37, fdv: 90.7e9, volume: 7.2e6, marketCap: 90.7e9, tvl: 45.2e6, description: "Binance Coin is the cryptocurrency issued by Binance exchange and trades with the BNB symbol. BNB runs on the BNB Chain and is used to pay transaction fees, participate in token sales, and more.", sparkline: [] },
  { id: "avax", name: "Avalanche", symbol: "AVAX", price: 38.42, change1h: 0.55, change1d: 3.18, fdv: 15.2e9, volume: 6.1e6, marketCap: 14.8e9, tvl: 32.1e6, description: "Avalanche is an open-source platform for launching decentralized applications and enterprise blockchain deployments in one interoperable, highly scalable ecosystem.", sparkline: [] },
  { id: "link", name: "Chainlink", symbol: "LINK", price: 18.5, change1h: 0.72, change1d: 5.44, fdv: 11.1e9, volume: 5.7e6, marketCap: 10.8e9, tvl: 18.7e6, description: "Chainlink is a decentralized oracle network that provides real-world data to smart contracts on the blockchain. It enables smart contracts to securely connect to external data sources, APIs, and payment systems.", sparkline: [] },
  { id: "dai", name: "Dai", symbol: "DAI", price: 1.0, change1h: 0.01, change1d: 0.02, fdv: 5.3e9, volume: 4.2e6, marketCap: 5.3e9, tvl: 0, description: "Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain, managed by MakerDAO.", sparkline: [] },
  { id: "arb", name: "Arbitrum", symbol: "ARB", price: 1.15, change1h: 0.44, change1d: 7.83, fdv: 4.6e9, volume: 3.8e6, marketCap: 3.7e9, tvl: 52.4e6, description: "Arbitrum is a Layer 2 scaling solution for Ethereum that aims to boost the speed and efficiency of Ethereum smart contracts while adding additional privacy features. It uses optimistic rollup technology.", sparkline: [] },
  { id: "op", name: "Optimism", symbol: "OP", price: 2.1, change1h: 0.63, change1d: 5.12, fdv: 4.1e9, volume: 3.5e6, marketCap: 2.9e9, tvl: 41.8e6, description: "Optimism is a Layer 2 scaling solution for Ethereum powered by optimistic rollups. It is designed to be the simplest and most powerful L2 scaling solution for Ethereum.", sparkline: [] },
  { id: "pol", name: "Polygon", symbol: "POL", price: 0.45, change1h: 0.38, change1d: -2.15, fdv: 3.8e9, volume: 2.9e6, marketCap: 3.6e9, tvl: 38.9e6, description: "Polygon (formerly Matic Network) is a protocol and framework for building and connecting Ethereum-compatible blockchain networks. It provides scalable solutions on Ethereum supporting a multi-chain ecosystem.", sparkline: [] },
];

// Pre-generate sparklines with seeded random
exploreTokens.forEach((token, i) => {
  const rand = seededRandom(i * 7919 + 42);
  token.sparkline = generateSparkline(rand, token.change1d > 0 ? 1 : token.change1d < 0 ? -1 : 0);
});

export function getExploreToken(id: string) {
  return exploreTokens.find((t) => t.id === id);
}

export function formatCompact(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(3)}`;
}
