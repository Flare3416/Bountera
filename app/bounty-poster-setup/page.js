"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import NextImage from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Globe,
  FileText,
  User,
  Upload,
  Pencil,
  Trash2,
  Save,
  Check,
  Sparkles,
  Loader2,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { saveUserData, getAllUserData } from "@/utils/userData";

const industryOptions = [
  "Technology",
  "Design & Creative",
  "Marketing & Advertising",
  "Finance & Fintech",
  "Healthcare",
  "Education",
  "E-commerce",
  "Gaming",
  "Media & Entertainment",
  "Other",
];

const BountyPosterProfileSetup = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profileImageRef = useRef(null);
  const bannerImageRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    bio: "",
    website: "",
    industry: "",
    profileImage: "",
    bannerImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState({
    profile: false,
    banner: false,
  });
  const [previewImages, setPreviewImages] = useState({
    profile: null,
    banner: null,
  });
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  const getDraftKey = useCallback(() => {
    return session?.user?.email
      ? `draft_bounty_profile_${session.user.email}`
      : null;
  }, [session]);

  const saveDraft = useCallback(
    (data) => {
      const draftKey = getDraftKey();
      if (draftKey && typeof window !== "undefined") {
        try {
          setAutoSaveStatus("saving");
          localStorage.setItem(draftKey, JSON.stringify(data));
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus(""), 2000);
        } catch (error) {
          console.warn("Failed to save draft:", error);
          setAutoSaveStatus("");
        }
      }
    },
    [getDraftKey]
  );

  const loadDraft = useCallback(() => {
    const draftKey = getDraftKey();
    if (draftKey && typeof window !== "undefined") {
      try {
        const draft = localStorage.getItem(draftKey);
        return draft ? JSON.parse(draft) : null;
      } catch (error) {
        console.warn("Failed to load draft:", error);
        return null;
      }
    }
    return null;
  }, [getDraftKey]);

  const clearDraft = () => {
    const draftKey = getDraftKey();
    if (draftKey && typeof window !== "undefined") {
      localStorage.removeItem(draftKey);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveDraft(formData);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [formData, saveDraft]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        session?.user?.email &&
        (formData.name || formData.bio || formData.companyName)
      ) {
        saveDraft(formData);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, session, saveDraft]);

  useEffect(() => {
    if (session?.user?.email) {
      const existingData = getAllUserData(session);
      const draftData = loadDraft();
      const dataToLoad = draftData || existingData;

      if (dataToLoad) {
        setFormData({
          name: dataToLoad.name || session.user.name || "",
          companyName: dataToLoad.companyName || "",
          bio: dataToLoad.bio || "",
          website: dataToLoad.website || "",
          industry: dataToLoad.industry || "",
          profileImage: dataToLoad.profileImage || "",
          bannerImage: dataToLoad.bannerImage || "",
        });
        if (dataToLoad.profileImage) {
          setPreviewImages((prev) => ({
            ...prev,
            profile: dataToLoad.profileImage,
          }));
        }
        if (dataToLoad.bannerImage) {
          setPreviewImages((prev) => ({
            ...prev,
            banner: dataToLoad.bannerImage,
          }));
        }
      } else if (session.user.name) {
        setFormData((prev) => ({ ...prev, name: session.user.name }));
      }
    }
  }, [session, loadDraft]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    const timer = setTimeout(() => {
      saveDraft(updatedData);
    }, 1000);
    setAutoSaveTimer(timer);
  };

  const handleImageUpload = async (file, type) => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file is too large. Please choose a file smaller than 5MB.");
        reject(new Error("File too large"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = type === "banner" ? 1200 : 400;
          const maxHeight = type === "banner" ? 400 : 400;
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          const updatedData = {
            ...formData,
            [`${type}Image`]: compressedBase64,
          };
          setFormData(updatedData);
          setPreviewImages((prev) => ({ ...prev, [type]: compressedBase64 }));
          saveDraft(updatedData);
          resolve();
        };
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageProcessing((prev) => ({ ...prev, profile: true }));
    try {
      await handleImageUpload(file, "profile");
    } catch (error) {
      console.error("Error reading profile image:", error);
      alert("Failed to process profile image. Please try a smaller file.");
    } finally {
      setImageProcessing((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleBannerImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageProcessing((prev) => ({ ...prev, banner: true }));
    try {
      await handleImageUpload(file, "banner");
    } catch (error) {
      console.error("Error reading banner image:", error);
      alert("Failed to process banner image. Please try a smaller file.");
    } finally {
      setImageProcessing((prev) => ({ ...prev, banner: false }));
    }
  };

  const handleImageDelete = (type) => {
    if (type === "profile") {
      setFormData((prev) => ({ ...prev, profileImage: "" }));
      setPreviewImages((prev) => ({ ...prev, profile: null }));
    } else if (type === "banner") {
      setFormData((prev) => ({ ...prev, bannerImage: "" }));
      setPreviewImages((prev) => ({ ...prev, banner: null }));
    }
  };

  const handleImageEdit = (type) => {
    if (type === "profile") profileImageRef.current?.click();
    else if (type === "banner") bannerImageRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.email) {
      console.error("No user email found");
      return;
    }
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      try {
        saveUserData(session.user.email, {
          ...formData,
          role: "bounty_poster",
          profileCompleted: true,
          lastUpdated: new Date().toISOString(),
        });
        clearDraft();
        router.push("/bounty-dashboard");
      } catch (storageError) {
        console.error("Storage error:", storageError);
        if (
          storageError.name === "QuotaExceededError" ||
          storageError.message.includes("quota")
        ) {
          const dataWithoutImages = {
            ...formData,
            profileImage: "",
            bannerImage: "",
            role: "bounty_poster",
            profileCompleted: true,
            lastUpdated: new Date().toISOString(),
          };
          try {
            saveUserData(session.user.email, dataWithoutImages);
            alert(
              "Profile saved, but images were too large to store. You can re-upload smaller images later."
            );
            clearDraft();
            router.push("/bounty-dashboard");
          } catch (secondError) {
            console.error("Second storage attempt failed:", secondError);
            alert(
              "Failed to save profile due to storage limitations. Please try with smaller images."
            );
          }
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Profile</h2>
          <p className="mt-2 text-sm text-slate-400">
            Preparing your business setup...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,.35)]">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Redirecting</h2>
          <p className="mt-2 text-sm text-slate-400">Sending you to login...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bountera-grid opacity-50" />
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur">
            <Briefcase className="h-3.5 w-3.5" />
            Business Onboarding
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Set up your{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              business profile
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Complete your profile to start posting bounties and finding talented
            creators on Bountera.
          </p>

          {/* Auto-save pill */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur transition-all ${
                autoSaveStatus === "saved"
                  ? "border-green-500/20 bg-green-500/10 text-green-300"
                  : autoSaveStatus === "saving"
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-500"
              }`}
            >
              <Save className="h-3 w-3" />
              {autoSaveStatus === "saving"
                ? "Saving..."
                : autoSaveStatus === "saved"
                ? "Draft saved"
                : "Auto-save on"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Image */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-violet-300" />
              <h3 className="text-lg font-semibold text-white">Banner Image</h3>
            </div>

            <div
              className="group relative h-52 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-violet-400/40"
              onClick={() => bannerImageRef.current?.click()}
            >
              {previewImages.banner ? (
                <>
                  <NextImage
                    src={previewImages.banner}
                    alt="Banner preview"
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageEdit("banner");
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20"
                    >
                      <Pencil className="h-4 w-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete("banner");
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500 transition-colors group-hover:text-violet-300">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">Click to upload banner</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                ref={bannerImageRef}
                onChange={handleBannerImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {!previewImages.banner && (
              <button
                type="button"
                onClick={() => bannerImageRef.current?.click()}
                disabled={imageProcessing.banner}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {imageProcessing.banner ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Banner
                  </>
                )}
              </button>
            )}
          </div>
                    {/* Profile Image */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-violet-300" />
              <h3 className="text-lg font-semibold text-white">Profile Image</h3>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <div
                  className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-white/10 bg-white/[0.05] ring-2 ring-violet-500/20 transition-all duration-300 hover:ring-violet-400/50"
                  onClick={() => profileImageRef.current?.click()}
                >
                  {previewImages.profile ? (
                    <>
                      <NextImage
                        src={previewImages.profile}
                        alt="Profile preview"
                        fill
                        sizes="112px"
                        className="object-cover transition duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Pencil className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 transition-colors group-hover:text-violet-300">
                      <Briefcase className="h-8 w-8" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={profileImageRef}
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {previewImages.profile && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageEdit("profile");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow-lg transition hover:bg-slate-700 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete("profile");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow-lg transition hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-slate-400">
                  A professional logo or headshot helps creators trust your
                  bounties. Recommended size: 400×400px.
                </p>
                {!previewImages.profile && (
                  <button
                    type="button"
                    onClick={() => profileImageRef.current?.click()}
                    disabled={imageProcessing.profile}
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {imageProcessing.profile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-300" />
              <h3 className="text-lg font-semibold text-white">
                Business Information
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company or organization name"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Industry
                  </label>
                  <div className="relative">
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        Select an industry
                      </option>
                      {industryOptions.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-slate-900 text-white"
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Bio
                  </span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell creators about yourself and what kinds of projects you're looking for..."
                  rows={4}
                  className="h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  This will be visible on your public bounty poster profile.
                </p>
              </div>
            </div>
          </div>
                    {/* Submit */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-10 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,.35)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Profile Setup
                  <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BountyPosterProfileSetup;