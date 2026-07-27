"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CirclePlay, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const proofPoints = [
  "No credit card required",
  "Built for every creative discipline",
  "New bounties every week",
];

const Hero = () => (
  <section
    id="hero"
    className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-28 lg:pt-44"
  >
    <div
      className="bountera-grid absolute inset-0 -z-10 opacity-50"
      aria-hidden="true"
    />
    <div className="bountera-glow bountera-glow-one" aria-hidden="true" />
    <div className="bountera-glow bountera-glow-two" aria-hidden="true" />

    <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
      <div className="relative z-10 text-center lg:text-left">
        <p className="bountera-eyebrow mx-auto lg:mx-0">
          <Sparkles className="size-3.5" aria-hidden="true" /> The creator
          network for ambitious work
        </p>

        <h1 className="mt-6 max-w-3xl font-modern text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl xl:text-[5.15rem]">
          Where creative talent becomes{" "}
          <span className="bountera-gradient-text">real momentum.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
          Showcase work you’re proud of, take on purposeful bounties, and build
          the reputation that moves your career forward.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl bg-white px-6 text-base font-semibold text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,.12)] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <Link href="/login">
              Start your profile
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-white/15 bg-white/[.06] px-6 text-base text-white backdrop-blur hover:bg-white/[.12] hover:text-white"
          >
            <a href="#features">
              <CirclePlay className="size-4" aria-hidden="true" /> Explore
              Bountera
            </a>
          </Button>
        </div>

        <ul
          className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-400 lg:justify-start"
          aria-label="Platform benefits"
        >
          {proofPoints.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <Check className="size-4 text-cyan-300" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto w-full max-w-[540px] lg:mx-0">
        <div
          className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-violet-500/30 via-cyan-400/10 to-fuchsia-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="bountera-float rounded-[1.75rem] border border-white/15 bg-slate-900/65 p-3 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-4">
          <div className="rounded-[1.3rem] border border-white/10 bg-gradient-to-br from-white/[.11] to-white/[.025] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950">
                  ✦
                </span>
                Featured brief
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                Open now
              </span>
            </div>

            <p className="mt-9 text-xs font-semibold uppercase tracking-[.18em] text-violet-200">
              Brand &amp; product design
            </p>

            <h2 className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              Shape the launch campaign for a category-defining wellness brand.
            </h2>

            <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs text-slate-400">Bounty reward</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  $2,400
                </p>
              </div>

              <div className="flex -space-x-2" aria-label="Recent contributors">
                {[
                  { name: "AC", src: "/placeholdermale.jpeg" },
                  { name: "MS", src: "/placeholderfemale2.jpeg" },
                  { name: "YT", src: "/placeholderfemale.jpeg" },
                ].map((contributor) => (
                  <span
                    key={contributor.name}
                    className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900"
                  >
                    <Image
                      src={contributor.src}
                      alt={contributor.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ["15k+", "creators"],
              ["$1.2m", "earned"],
              ["4.9/5", "community love"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/[.055] px-2 py-3 text-center"
              >
                <p className="text-sm font-bold text-white sm:text-base">
                  {value}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 sm:text-xs">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;