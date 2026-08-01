"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Tag,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  DollarSign,
  Users,
  Timer,
  Clock,
  Layers,
} from "lucide-react";
import {
  getCategoryById,
  getDifficultyById,
  formatCurrency,
  getBountyExpirationInfo,
  getTimeRemainingDisplay,
  normalizeBountyCategories,
} from "@/utils/bountyData";
import { getApplicationCountForBounty } from "@/utils/applicationData";

const BountyCard = ({
  bounty,
  isOwner = false,
  onEdit,
  onDelete,
  onApply,
  onViewDetails,
  onUpdateStatus,
  userRole = null,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [applicantCount, setApplicantCount] = useState(0);
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bounty?.id) {
      const count = getApplicationCountForBounty(bounty.id);
      setApplicantCount(count);
    }
  }, [bounty?.id]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (bounty?.id) {
        const count = getApplicationCountForBounty(bounty.id);
        setApplicantCount(count);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("applicationsUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("applicationsUpdated", handleStorageChange);
    };
  }, [bounty?.id]);

  useEffect(() => {
    if (!bounty?.creator) return;

    const loadCreator = async () => {
      try {
        const res = await fetch(
          `/api/users/${encodeURIComponent(bounty.creator)}`
        );

        if (!res.ok) return;

        const data = await res.json();
        setCreator(data);
      } catch (err) {
        console.error("Failed to load creator:", err);
      }
    };

    loadCreator();
  }, [bounty?.creator]);

  const categories = normalizeBountyCategories(bounty);
  const primaryCategory = categories.length > 0 ? getCategoryById(categories[0]) : null;
  const difficulty = getDifficultyById(bounty.difficulty);
  const { isExpired } = getBountyExpirationInfo(bounty.deadline);
  const timeInfo = getTimeRemainingDisplay(bounty.deadline);

  const getStatusInfo = () => {
    if (isExpired) {
      return {
        text: "EXPIRED",
        style: "border-red-500/20 bg-red-500/10 text-red-300",
      };
    }
    switch (bounty.status) {
      case "open":
        return {
          text: "OPEN",
          style: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
        };
      case "in-progress":
      case "in_progress":
        return {
          text: "IN PROGRESS",
          style: "border-amber-500/20 bg-amber-500/10 text-amber-200",
        };
      case "completed":
        return {
          text: "COMPLETED",
          style: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
        };
      case "cancelled":
        return {
          text: "CANCELLED",
          style: "border-red-500/20 bg-red-500/10 text-red-300",
        };
      case "expired":
        return {
          text: "EXPIRED",
          style: "border-red-500/20 bg-red-500/10 text-red-300",
        };
      default:
        return {
          text: "OPEN",
          style: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getDifficultyStyle = () => {
    switch (difficulty?.color) {
      case "green":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
      case "yellow":
        return "border-amber-500/20 bg-amber-500/10 text-amber-200";
      case "red":
        return "border-red-500/20 bg-red-500/10 text-red-200";
      default:
        return "border-white/10 bg-white/5 text-slate-300";
    }
  };
    return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:shadow-cyan-500/5 sm:p-6 ${
        isExpired || bounty.status === "cancelled" ? "opacity-60" : ""
      } ${onViewDetails ? "cursor-pointer" : ""}`}
      onClick={onViewDetails ? () => onViewDetails(bounty) : undefined}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/5 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Top Row: Creator + Actions */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {creator?.profileImage ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src={creator.profileImage}
                    alt={creator?.name || "Creator"}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-cyan-200">
                  {(creator?.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {creator?.name || "Anonymous Creator"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Creator
                </span>
              </div>
              <span className="text-xs text-slate-600">
                {new Date(bounty.createdAt ?? 0).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {isOwner ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onEdit === "function") onEdit(bounty.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
                  title="Edit Bounty"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onDelete === "function") onDelete(bounty.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete Bounty"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {onUpdateStatus && typeof onUpdateStatus === "function" && (
                  <>
                    {bounty.status !== "completed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(bounty.id, "completed");
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20"
                        title="Mark as Completed"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {bounty.status !== "cancelled" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(bounty.id, "cancelled");
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10"
                        title="Mark as Cancelled"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              !isExpired &&
              onApply &&
              typeof onApply === "function" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(bounty);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,.35)]"
                >
                  Apply
                </button>
              )
            )}
          </div>
        </div>
                {/* Title & Badges */}
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-lg">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-tight text-white sm:text-lg">
              {bounty.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${getDifficultyStyle()}`}
              >
                {difficulty.name}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusInfo.style}`}
              >
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {bounty.description}
        </p>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {categories.slice(0, 2).map((catId, index) => {
              const cat = getCategoryById(catId);
              if (!cat) return null;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium text-cyan-200"
                >
                  <Tag className="h-3 w-3" />
                  {cat.name}
                </span>
              );
            })}
            {categories.length > 2 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                +{categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Contact */}
        {bounty.contact && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-300">
                Contact
              </span>
            </div>
            <p className="break-words text-xs text-slate-400">
              {bounty.contact}
            </p>
          </div>
        )}
                {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-1 text-lg font-bold text-white">
                <DollarSign className="h-4 w-4 text-cyan-300" />
                {formatCurrency(bounty.budget).replace("$", "")}
              </div>
              <div className="text-[10px] text-slate-500">Budget</div>
            </div>
            <div>
              <div
                className={`flex items-center gap-1 text-sm font-bold ${
                  timeInfo.color === "red"
                    ? "text-red-300"
                    : timeInfo.color === "yellow"
                    ? "text-amber-300"
                    : "text-slate-200"
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                {timeInfo.display}
              </div>
              <div className="text-[10px] text-slate-500">
                {timeInfo.label}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-slate-300">
              {primaryCategory ? primaryCategory.name : "No category"}
            </div>
            <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-slate-500">
              <Users className="h-3 w-3" />
              {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyCard;