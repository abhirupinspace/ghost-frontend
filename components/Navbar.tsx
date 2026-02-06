"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { formatAddress } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Swap" },
  { href: "/explore", label: "Explore" },
  { href: "/stake", label: "Stake" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Navbar() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-[20px] tracking-tight">
          <span className="font-black">GHOST </span>
          <span className="font-normal">FINANCE</span>
        </Link>
        <nav className="flex items-center gap-5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] transition-colors ${
                  isActive ? "text-white font-medium" : "text-[#555] hover:text-[#999]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#999] hover:text-white transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="8.5" x2="12" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="11.5" x2="9" y2="11.5" stroke="currentColor" strokeWidth="1.2" />
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
  );
}
