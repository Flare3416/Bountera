"use client";

import Image from "next/image";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

const creators = [
  {
    name: "Alex Chen",
    role: "Full-stack developer",
    bounties: "31",
    earned: "$22.8k",
    image: "/placeholdermale.jpeg",
  },
  {
    name: "Yuki Tanaka",
    role: "Product designer",
    bounties: "24",
    earned: "$15.2k",
    image: "/placeholderfemale.jpeg",
  },
  {
    name: "Maria Silva",
    role: "Digital artist",
    bounties: "18",
    earned: "$12.5k",
    image: "/placeholderfemale2.jpeg",
  },
];

const TopCreators = () => (
  <section
    id="creators"
    className="relative overflow-hidden border-y border-white/[.07] bg-white/[.025] px-4 py-20 sm:px-6 sm:py-28"
  >
    <div
      className="bountera-grid absolute inset-0 opacity-20"
      aria-hidden="true"
    />
    <div className="relative mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <p className="bountera-kicker">Community spotlight</p>
          <h2 className="mt-4 font-modern text-4xl font-semibold leading-[1.02] tracking-[-.05em] text-white sm:text-5xl">
            Creators doing remarkable work.
          </h2>
        </div>
        <a
          href="#cta"
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-cyan-200 transition hover:text-white sm:self-auto"
        >
          Find your place here
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {creators.map((creator, index) => (
          <article
            key={creator.name}
            className="group rounded-3xl border border-white/10 bg-slate-900/55 p-6 shadow-xl shadow-black/10 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div className="relative size-14 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  fill
                  sizes="56px"
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-sm font-medium text-slate-500">
                0{index + 1}
              </span>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white">
                {creator.name}
              </h3>
              <BadgeCheck
                className="size-4 text-cyan-300"
                aria-label="Verified creator"
              />
            </div>

            <p className="mt-1 text-sm text-slate-400">{creator.role}</p>

            <div className="mt-7 flex gap-8 border-t border-white/[.08] pt-5 text-sm">
              <span>
                <strong className="block text-lg text-white">
                  {creator.bounties}
                </strong>
                <span className="text-slate-500">bounties</span>
              </span>
              <span>
                <strong className="block text-lg text-white">
                  {creator.earned}
                </strong>
                <span className="text-slate-500">earned</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default TopCreators;