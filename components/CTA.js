"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => <section id="cta" className="px-4 py-20 sm:px-6 sm:py-28"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/25 via-slate-900 to-cyan-500/15 px-6 py-16 text-center shadow-2xl shadow-black/30 sm:px-12 sm:py-20"><div className="absolute -left-24 -top-32 size-80 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" /><div className="absolute -bottom-36 -right-24 size-96 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden="true" /><div className="relative mx-auto max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-200">Your work deserves a stage</p><h2 className="mt-5 font-modern text-4xl font-semibold leading-[1.05] tracking-[-.05em] text-white sm:text-5xl">The opportunity that changes everything could be next.</h2><p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">Join a community built around meaningful work, generous recognition, and creative ambition.</p><Button asChild size="lg" className="mt-9 h-12 rounded-xl bg-white px-6 text-base font-semibold text-slate-950 hover:-translate-y-0.5 hover:bg-slate-100"><Link href="/login">Create your profile <ArrowRight className="size-4" aria-hidden="true" /></Link></Button></div></div></section>;

export default CTA;
