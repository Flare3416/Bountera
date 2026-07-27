"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Creators", href: "/#creators" },
  { label: "Bounties", href: "/login" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-5"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 text-base text-slate-950 shadow-lg shadow-violet-400/20">
            ✦
          </span>
          Bountera
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">

          <Button
            asChild
            size="sm"
            className="rounded-lg bg-white px-4 text-slate-950 hover:bg-slate-200"
          >
            <Link href="/login">Join Bountera</Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Button
            asChild
            className="mt-3 w-full rounded-xl bg-white text-slate-950 hover:bg-slate-200"
          >
            <Link href="/login" onClick={closeMenu}>
              Join Bountera
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
