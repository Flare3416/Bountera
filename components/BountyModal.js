"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  X,
  Clock,
  DollarSign,
  User,
  Calendar,
  Phone,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Star,
  Tag,
  Timer,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Send,
  Layers,
} from "lucide-react";
import { BOUNTY_CATEGORIES } from "@/utils/bountyConstants";

import {
  getDifficultyById,
  formatCurrency,
  getBountyExpirationInfo,
  getTimeRemainingDisplay,
} from "@/utils/bountyHelpers";

import { applyToBounty, hasUserApplied } from "@/utils/applicationData";
import { awardApplicationPoints } from "@/utils/pointsSystem";

const BountyModal = ({
  bounty,
  isOpen,
  onClose,
  onApply,
  userRole = null,
}) => {
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const poster = bounty?.poster;

  useEffect(() => {
    if (session?.user?.email && bounty?.id) {
      setHasApplied(hasUserApplied(bounty.id, session.user.email));
    }
  }, [session, bounty, isOpen]);

  if (!isOpen || !bounty) return null;

  const { isExpired } = getBountyExpirationInfo(bounty.deadline);
  const categories = Array.isArray(bounty.categories)
    ? bounty.categories
    : bounty.category
    ? [bounty.category]
    : [];
  const difficulty = getDifficultyById(bounty.difficulty);
  const timeDisplay = getTimeRemainingDisplay(bounty.deadline);

  const referenceImages = bounty.referenceImages || [];
  const hasImages = referenceImages.length > 0;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % referenceImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + referenceImages.length) % referenceImages.length
    );
  };

  const handleApply = async () => {
    if (!session?.user?.email || applying || hasApplied) return;

    setApplying(true);

    try {
      // Load current user from PostgreSQL
      const res = await fetch(
        `/api/users/${encodeURIComponent(session.user.email)}`
      );

      if (!res.ok) {
        throw new Error("Failed to load user");
      }

      const currentUser = await res.json();

      const applicationData = {
        email: currentUser.email,
        name: currentUser.name || session.user.name || "Unknown",
        username: currentUser.username || "unknown",
        image: currentUser.profileImage || session.user.image || null,
        message: `I would like to work on this bounty: ${bounty.title}`,
        skills: currentUser.skills || [],
      };

      const success = applyToBounty(bounty.id, applicationData);

      if (success) {
        setHasApplied(true);

        if (currentUser.role === "HUNTER") {
          awardApplicationPoints(
            session.user.email,
            bounty.id,
            bounty.title
          );
        }

        alert(
          "Application submitted successfully! The bounty poster will review your application."
        );
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error applying to bounty:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

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

  const getStatusStyle = () => {
    if (isExpired) {
      return "border-red-500/20 bg-red-500/10 text-red-300";
    }
    switch (bounty.status) {
      case "OPEN":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-200";
      case "COMPLETED":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
      case "CANCELLED":
        return "border-red-500/20 bg-red-500/10 text-red-300";
      default:
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
      onClick={handleOverlayClick}
    >
      {/* Modal container: capped height, scrollable */}
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        
        {/* Sticky Header */}
        <div className="z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              {poster?.profileImage ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src={poster?.profileImage}
                    alt="HUNTER"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                  <User className="h-4 w-4 text-cyan-300" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {poster?.name || "Anonymous Poster"}
              </h3>
              <p className="text-xs text-slate-500">Bounty Poster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Title + Badges */}
          <div className="mb-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-bold text-white sm:text-xl">
                {bounty.title}
              </h1>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getStatusStyle()}`}
              >
                {isExpired ? "EXPIRED" : bounty.status?.toUpperCase() || "OPEN"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map((categoryId, index) => {
                const category = BOUNTY_CATEGORIES.find((c) => c.id === categoryId) || null;
                return category ? (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-200"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {category.name}
                  </span>
                ) : null;
              })}
              {difficulty && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getDifficultyStyle()}`}
                >
                  {difficulty.name}
                </span>
              )}
            </div>
          </div>

          {/* Key Details */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[10px] font-medium text-slate-400">Budget</span>
              </div>
              <p className="text-base font-black text-white">
                {formatCurrency(bounty.budget)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-violet-300" />
                <span className="text-[10px] font-medium text-slate-400">Deadline</span>
              </div>
              <p className="text-xs font-bold text-white">
                {new Date(bounty.deadline).toLocaleDateString()}
              </p>
              {!isExpired && (
                <p
                  className={`mt-0.5 flex items-center gap-1 text-[10px] ${
                    timeDisplay.color === "red"
                      ? "text-red-400"
                      : timeDisplay.color === "yellow"
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  <Timer className="h-2.5 w-2.5" />
                  {timeDisplay.display} {timeDisplay.label}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-[10px] font-medium text-slate-400">Contact</span>
              </div>
              <p className="text-xs font-bold text-white">
                {bounty.contact || "Via platform"}
              </p>
            </div>
          </div>

          {/* Reference Images — CAPPED so it never dominates */}
          {hasImages && (
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-cyan-300" />
                <h3 className="text-xs font-semibold text-white">Reference Images</h3>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {/* max-h caps the image so it never swallows the modal */}
                <div className="relative max-h-[280px] w-full">
                  <Image
                    src={
                      typeof referenceImages[currentImageIndex] === "object"
                        ? referenceImages[currentImageIndex].file
                        : referenceImages[currentImageIndex]
                    }
                    alt={`Reference ${currentImageIndex + 1}`}
                    width={800}
                    height={450}
                    className="mx-auto max-h-[280px] w-auto object-contain"
                  />
                </div>

                {referenceImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {referenceImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-1.5 w-1.5 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {referenceImages.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {referenceImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-cyan-400"
                          : "border-white/10"
                      }`}
                    >
                      <Image
                        src={typeof image === "object" ? image.file : image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-cyan-300" />
              <h3 className="text-xs font-semibold text-white">Description</h3>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                {bounty.description}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          {bounty.deliverables && (
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-violet-300" />
                <h3 className="text-xs font-semibold text-white">Deliverables</h3>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                  {bounty.deliverables}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {bounty.additionalInfo && (
            <div className="mb-2">
              <div className="mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-300" />
                <h3 className="text-xs font-semibold text-white">
                  Additional Information
                </h3>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                  {bounty.additionalInfo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {!isExpired &&
          userRole === "HUNTER" &&
          bounty.status !== "COMPLETED" &&
          bounty.status !== "CANCELLED" && (
            <div className="z-20 shrink-0 border-t border-white/10 bg-slate-900/95 px-5 py-4 backdrop-blur-md">
              <button
                onClick={handleApply}
                disabled={applying || hasApplied}
                className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 ${
                  hasApplied
                    ? "cursor-not-allowed border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : applying
                    ? "cursor-not-allowed bg-white/5 text-slate-400"
                    : "bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,.2)]"
                }`}
              >
                {hasApplied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Application Submitted
                  </>
                ) : applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Apply for This Bounty
                    <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default BountyModal;