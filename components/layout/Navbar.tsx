"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainNav } from "@/config/Navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 py-2 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-slate-50">
            Geo<span className="text-emerald-400">Bet</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white font-semibold text-slate-950"
                    : "text-slate-100 hover:bg-slate-800 hover:text-slate-50",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Connect wallet pakai RainbowKit */}
        <div className="hidden items-center gap-2 md:flex">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              if (!connected) {
                // belum connect → tombol "Connect Wallet"
                return (
                  <button
                    onClick={openConnectModal}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-emerald-500 hover:text-gray-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                // salah chain
                return (
                  <button
                    onClick={openChainModal}
                    className="rounded-full border border-rose-500/60 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500 hover:text-slate-950 transition-colors"
                  >
                    Wrong Network
                  </button>
                );
              }

              // sudah connect & chain benar
              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <span
                        className="mr-1 inline-block h-3 w-3 rounded-full bg-slate-700"
                        style={{
                          backgroundImage: `url(${chain.iconUrl})`,
                          backgroundSize: "cover",
                        }}
                      />
                    )}
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-slate-800 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open main menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </div>
        </button>
      </nav>

      {/* Mobile menu (kalau mau, kamu bisa tambah ConnectButton juga di sini) */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-emerald-500/90 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* versi simple di mobile */}
            <div className="mt-2">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
