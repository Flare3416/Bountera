"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  LogOut,
  Pencil,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { getUserDisplayName, getUserProfileImage } from "@/utils/userData";

const navItems = [
  { label: "Dashboard", href: "/bounty-dashboard", icon: LayoutDashboard },
  { label: "Post Bounty", href: "/create-bounty", icon: PlusCircle },
  { label: "My Bounties", href: "/my-bounties", icon: Briefcase },
  { label: "Applications", href: "/applicants", icon: Users },
  { label: "Find Creators", href: "/leaderboard", icon: Search },
];

const BountyPosterNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    setMobileOpen(false);
    setShowProfileDropdown(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleProfileAction = (action) => {
    setShowProfileDropdown(false);
    if (action === "edit-profile") {
      router.push("/bounty-poster-setup");
    } else if (action === "logout") {
      signOut({ callbackUrl: "/" });
    }
  };

  const profileImage = getUserProfileImage(session);
  const displayName = getUserDisplayName(session);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-5"
        aria-label="Bounty poster navigation"
      >
        {/* Logo */}
        <Link
          href="/bounty-dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 text-base text-slate-950 shadow-lg shadow-violet-400/20">
            ✦
          </span>
          Bountera
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.href)}
              className="group relative text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* Right side: Profile + Mobile toggle */}
        <div className="flex items-center gap-3">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-sm transition hover:bg-white/10"
            >
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/10">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-[10px] font-bold text-violet-200">
                    {displayName?.[0]?.toUpperCase() || "B"}
                  </div>
                )}
              </div>
              <span className="hidden max-w-[100px] truncate text-slate-300 sm:block">
                {displayName || "Business"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                  showProfileDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* User Info */}
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profile"
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-200">
                          {displayName?.[0]?.toUpperCase() || "B"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName || "Business"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => handleProfileAction("edit-profile")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <Pencil className="h-4 w-4 text-slate-500" />
                    Edit Profile
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={() => handleProfileAction("logout")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {item.label}
                </button>
              );
            })}

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={() => handleProfileAction("edit-profile")}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
              Edit Profile
            </button>

            <button
              onClick={() => handleProfileAction("logout")}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default BountyPosterNavbar;