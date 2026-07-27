"use client";

import Link from "next/link";

const Footer = () => (
  <footer className="border-t border-white/[.07] bg-slate-950 px-4 py-14 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 text-base text-slate-950">
              ✦
            </span>
            Bountera
          </Link>

          <p className="mt-5 text-sm leading-7 text-slate-400">
            A more meaningful way for creators to discover opportunities, earn
            recognition, and build a career on their own terms.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Platform</h2>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/#features" className="transition hover:text-cyan-200">
                  Features
                </Link>
              </li>

              <li>
                <Link href="/#creators" className="transition hover:text-cyan-200">
                  Creators
                </Link>
              </li>

              <li>
                <Link href="/login" className="transition hover:text-cyan-200">
                  Bounties
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Account</h2>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/login" className="transition hover:text-cyan-200">
                  Log in
                </Link>
              </li>

              <li>
                <Link href="/login" className="transition hover:text-cyan-200">
                  Create profile
                </Link>
              </li>

              <li>
                <Link
                  href="/leaderboard"
                  className="transition hover:text-cyan-200"
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Company</h2>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/#cta" className="transition hover:text-cyan-200">
                  Get Started
                </Link>
              </li>

              <li>
                <Link href="/#hero" className="transition hover:text-cyan-200">
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[.07] pt-6 text-xs text-slate-500 sm:flex-row">
        <p>© 2026 Bountera. All rights reserved.</p>

        <p>Made for creators with something to say.</p>
      </div>
    </div>
  </footer>
);
export default Footer;