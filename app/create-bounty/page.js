"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Upload,
  X,
  Tag,
  Layers,
  DollarSign,
  Calendar,
  Phone,
  Briefcase,
  FileText,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Save,
  ArrowLeft,
} from "lucide-react";

import BountyPosterNavbar from "@/components/BountyPosterNavbar";
import { getUserRole } from "@/utils/userData";
import {
  saveBounty,
  getBountyById,
  updateBounty,
  BOUNTY_CATEGORIES,
  DIFFICULTY_LEVELS,
  isBountyOwner,
} from "@/utils/bountyData";
import { logActivity, ACTIVITY_TYPES } from "@/utils/activityData";
import {
  forceCleanupIfNeeded,
  isStorageHigh,
  getStorageInfo,
} from "@/utils/storageManager";

const CreateBountyContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editBountyId = searchParams.get("edit");
  const isEditMode = !!editBountyId;

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [],
    difficulty: "",
    budget: "",
    deadline: "",
    contact: "",
    deliverables: "",
    additionalInfo: "",
    referenceImages: [],
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    const updateStorageInfo = () => {
      try {
        const info = getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error("Error getting storage info:", error);
      }
    };

    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const userRole = getUserRole(session);
    if (userRole !== "bounty_poster") {
      router.push("/dashboard");
      return;
    }

    if (isEditMode && editBountyId && initialLoad) {
      const existingBounty = getBountyById(editBountyId);
      if (existingBounty) {
        if (isBountyOwner(existingBounty, session.user.email)) {
          setFormData({
            title: existingBounty.title || "",
            description: existingBounty.description || "",
            categories: existingBounty.categories || [],
            difficulty: existingBounty.difficulty || "",
            budget: existingBounty.budget || "",
            deadline: existingBounty.deadline || "",
            contact: existingBounty.contact || "",
            deliverables: existingBounty.deliverables || "",
            additionalInfo: existingBounty.additionalInfo || "",
            referenceImages: existingBounty.referenceImages || [],
          });
          setImagePreview(existingBounty.referenceImages || []);
        } else {
          alert("You can only edit your own bounties");
          router.push("/bounties");
          return;
        }
      } else {
        alert("Bounty not found");
        router.push("/bounties");
        return;
      }
      setInitialLoad(false);
    }
  }, [session, status, router, isEditMode, editBountyId, initialLoad]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
      const categories = prev.categories || [];
      if (categories.includes(categoryId)) {
        return {
          ...prev,
          categories: categories.filter((cat) => cat !== categoryId),
        };
      } else if (categories.length < 3) {
        return {
          ...prev,
          categories: [...categories, categoryId],
        };
      }
      return prev;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (formData.referenceImages.length + files.length > 3) {
      alert("You can upload maximum 3 reference images");
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(
          "Each image must be less than 2MB to avoid storage issues"
        );
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

      img.onload = () => {
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);

        const imageData = {
          file: compressedDataUrl,
          name: file.name,
          size: Math.round(compressedDataUrl.length * 0.75),
          type: "image/jpeg",
        };

        try {
          setFormData((prev) => ({
            ...prev,
            referenceImages: [...prev.referenceImages, imageData],
          }));
          setImagePreview((prev) => [...prev, imageData]);
        } catch (error) {
          console.error("Error storing image:", error);
          alert(
            "Failed to store image. Image may be too large. Try a smaller image."
          );
        }
      };

      img.onerror = () => {
        alert("Failed to process image. Please try a different image.");
      };

      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.categories.length ||
      !formData.difficulty ||
      !formData.budget ||
      !formData.deadline ||
      !formData.contact
    ) {
      alert(
        "Please fill in all required fields including contact information"
      );
      return;
    }

    if (isStorageHigh()) {
      const confirmCleanup = window.confirm(
        "Storage is getting full. Would you like to clean up old data before saving? This may help avoid issues with saving your bounty."
      );
      if (confirmCleanup) {
        const cleanup = forceCleanupIfNeeded();
        if (cleanup) {
          alert(
            `Cleaned up ${cleanup.freedKB}KB of storage. Your bounty should save successfully now.`
          );
        }
      }
    }

    setLoading(true);

    try {
      if (isEditMode && editBountyId) {
        const updatedData = {
          ...formData,
          budget: parseFloat(formData.budget) || 0,
        };
        const success = updateBounty(editBountyId, updatedData);

        if (success) {
          logActivity(session.user.email, ACTIVITY_TYPES.BOUNTY_UPDATED, {
            bountyId: editBountyId,
            bountyTitle: formData.title,
            categories: formData.categories,
            budget: formData.budget,
          });

          alert("Bounty updated successfully!");
          router.push("/my-bounties");
        } else {
          alert("Failed to update bounty. Please try again.");
        }
      } else {
        const bountyData = {
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          createdAt: new Date().toISOString(),
          status: "open",
          creator: session.user.email,
          applicants: [],
        };

        const success = saveBounty(bountyData, session.user.email);

        if (success) {
          logActivity(session.user.email, ACTIVITY_TYPES.BOUNTY_CREATED, {
            bountyTitle: formData.title,
            categories: formData.categories,
            budget: formData.budget,
          });

          alert("Bounty created successfully!");
          router.push("/my-bounties");
        } else {
          alert(
            "Failed to create bounty. This might be due to storage limitations. Try reducing image sizes or removing some images."
          );
        }
      }
    } catch (error) {
      console.error("Error saving bounty:", error);
      alert("An error occurred while saving the bounty.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading</h2>
          <p className="mt-2 text-sm text-slate-400">Preparing bounty form...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />

      <BountyPosterNavbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur">
            <Briefcase className="h-3.5 w-3.5" />
            {isEditMode ? "Edit Bounty" : "Post a Bounty"}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {isEditMode ? (
              <>
                Edit Your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Bounty
                </span>
              </>
            ) : (
              <>
                Create New{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Bounty
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            {isEditMode
              ? "Update your bounty details and requirements."
              : "Describe your project and find talented creators to bring it to life."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Bounty Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a clear, descriptive title for your bounty"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of what you need accomplished"
              rows={4}
              className="h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              required
            />
          </div>
                    {/* Reference Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Reference Images (Optional)
            </label>
            <div className="space-y-4">
              <div className="flex w-full items-center justify-center">
                <label className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] transition-all hover:border-violet-400/40 hover:bg-white/[0.05]">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <Upload className="mb-3 h-8 w-8 text-slate-500 transition group-hover:text-violet-300" />
                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Click to upload
                      </span>{" "}
                      reference images
                    </p>
                    <p className="text-xs text-slate-600">
                      PNG, JPG or JPEG (Max 3 images, 2MB each — auto-compressed)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src={image.file}
                        alt={`Reference ${index + 1}`}
                        className="h-32 w-full object-cover"
                        width={100}
                        height={100}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-red-500/80 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Upload reference images to help creators understand your vision
                better. These could be mockups, examples, or inspiration images.
              </p>

              {/* Storage Usage Indicator */}
              {storageInfo && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Storage Usage</span>
                    <span
                      className={`font-medium ${
                        storageInfo.percentage > 90
                          ? "text-red-400"
                          : storageInfo.percentage > 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {storageInfo.usedMB}MB / {storageInfo.limitMB}MB (
                      {storageInfo.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        storageInfo.percentage > 90
                          ? "bg-red-500"
                          : storageInfo.percentage > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(storageInfo.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  {storageInfo.percentage > 80 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Storage is getting full. Consider cleaning up old data if
                      you encounter issues.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Categories * (Select up to 3)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {BOUNTY_CATEGORIES.map((category) => {
                const isSelected = formData.categories.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`cursor-pointer rounded-xl border p-3 text-center transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,.1)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="mb-1 text-lg">{category.icon}</div>
                    <div className="text-xs font-medium text-slate-300">
                      {category.name}
                    </div>
                  </div>
                );
              })}
            </div>
            {formData.categories.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Selected: {formData.categories.length}/3 categories
              </p>
            )}
          </div>
                    {/* Difficulty */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Difficulty Level *
            </label>
            <div className="relative">
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                required
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  Select difficulty level
                </option>
                {DIFFICULTY_LEVELS.map((level) => (
                  <option
                    key={level.id}
                    value={level.id}
                    className="bg-slate-900 text-white"
                  >
                    {level.name} — {level.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Budget (USD) *
              </span>
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Enter budget amount"
              min="1"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Deadline *
              </span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              required
            />
          </div>

          {/* Contact Information */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Contact Information *
              </span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Email, Discord, Telegram, or preferred contact method"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Provide how hunters can reach you (e.g., email@example.com,
              Discord: username#1234, Telegram: @username)
            </p>
          </div>

          {/* Deliverables */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Expected Deliverables
              </span>
            </label>
            <textarea
              name="deliverables"
              value={formData.deliverables}
              onChange={handleInputChange}
              placeholder="Describe what you expect to receive upon completion"
              rows={3}
              className="h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          {/* Additional Information */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Additional Information
              </span>
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Any additional details, requirements, or preferences"
              rows={3}
              className="h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
                    {/* Submit Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,.35)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Update Bounty" : "Create Bounty"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

const CreateBounty = () => {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bountera-grid opacity-50" />
          <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[140px]" />

          <div className="relative z-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Loading</h2>
            <p className="mt-2 text-sm text-slate-400">Preparing form...</p>
          </div>
        </div>
      }
    >
      <CreateBountyContent />
    </Suspense>
  );
};

export default CreateBounty;