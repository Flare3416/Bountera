"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Loader2,
  TrendingUp,
  Trophy,
  MessageSquare,
  ArrowLeft,
  Wallet,
  Sparkles,
  User,
  Clock,
  DollarSign,
  BarChart3,
  Gift,
} from "lucide-react";

import BountyHunterNavbar from "@/components/BountyHunterNavbar";
import { apiGet } from "@/lib/apiClient";

const MyDonationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        setUserRole(session.user.role || null);

        if (session.user.role !== "HUNTER") {
          router.push("/dashboard");
          return;
        }

        const userDonations = await apiGet(
          `/api/donations?recipientEmail=${encodeURIComponent(
            session.user.email
          )}`
        );

        setDonations(userDonations);

        const total = userDonations.reduce(
          (sum, donation) => sum + donation.amount,
          0
        );

        setTotalAmount(total);
      } catch (error) {
        console.error("Failed to load data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    }, [session?.user?.email, session?.user?.role, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Donations</h2>
          <p className="mt-2 text-sm text-slate-400">Fetching your support...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      <BountyHunterNavbar />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <Heart className="h-3.5 w-3.5" />
            Creator Support
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            My{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Donations
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            All the support you&apos;ve received from generous donors
          </p>
        </div>

        {/* Total Card */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Donations Received
                </p>
                <h2 className="mt-1 text-5xl font-black text-white">
                  ${totalAmount.toFixed(2)}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  {donations.length}{" "}
                  {donations.length === 1 ? "donation" : "donations"} from
                  supporters
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
                {/* Donations List */}
        {donations.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Heart className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">
              No Donations Yet
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              When people support your work, their donations will appear here.
            </p>
            <button
              onClick={() => router.push("/profile-setup")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
            >
              <Sparkles className="h-4 w-4" />
              Complete Your Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />

                <div className="relative">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {donation.donor?.name ||
                           donation.donor?.username ||
                           "Anonymous"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(donation.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-amber-300">
                        ${donation.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {donation.message && (
                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        Message
                      </p>
                      <p className="text-sm italic text-slate-300">
                        &quot;{donation.message}&quot;
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-slate-500">
                      {donation.donor?.email
                        ? "Registered Donor"
                        : "Anonymous Donor"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
                      <Heart className="h-3 w-3" />
                      Supporter
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
                {/* Bottom Stats */}
        {donations.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <BarChart3 className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Average Donation
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  ${(totalAmount / donations.length).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <Trophy className="h-4 w-4 text-violet-300" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Largest Donation
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  ${Math.max(...donations.map((d) => d.amount)).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  With Messages
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {donations.filter((d) => d.message).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDonationsPage;