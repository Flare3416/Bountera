"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import RoleSelectionModal from "@/components/RoleSelectionModal";

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    const { role, profileCompleted } = session.user;

    if (!role) {
      setShowRoleModal(true);
      return;
    }

    if (role === "POSTER") {
      router.push(profileCompleted ? "/bounty-dashboard" : "/bounty-poster-setup");
      return;
    }

    if (role === "HUNTER") {
      router.push(profileCompleted ? "/dashboard" : "/profile-setup");
      return;
    }

    setShowRoleModal(true);
  }, [session, status, router]);

  const handleRoleSelect = async (role) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          role,
          profileCompleted: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      setShowRoleModal(false);

      if (role === "POSTER") {
        router.push("/bounty-poster-setup");
      } else {
        router.push("/profile-setup");
      }
    } catch (error) {
      console.error("Failed to save role:", error);
      alert("Failed to save your role. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bountera-grid opacity-40" />

      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/15 blur-[120px]" />

      <RoleSelectionModal
        isOpen={showRoleModal}
        onRoleSelect={handleRoleSelect}
        onClose={() => setShowRoleModal(false)}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_40px_rgba(6,182,212,0.35)]">
          <svg
            className="h-10 w-10 animate-pulse text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">
          Setting Things Up
        </h1>

        <p className="text-slate-400">
          {status === "loading"
            ? "Checking your account..."
            : "Redirecting you to your workspace..."}
        </p>

        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-cyan-400/20 border-t-cyan-400" />
        </div>
      </div>
    </div>
  );
}