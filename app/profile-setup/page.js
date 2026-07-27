"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Trash2,
  Pencil,
  Plus,
  Briefcase,
  Rocket,
  Trophy,
  Link2,
  Check,
  X,
  Sparkles,
  User,
  AtSign,
  FileText,
  ImageIcon,
  Save,
} from "lucide-react";
import { saveUserData, getAllUserData, cleanupBlobUrls } from "@/utils/userData";

const ProfileSetup = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profileImageRef = useRef(null);
  const backgroundImageRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    skills: [],
    profileImage: null,
    backgroundImage: null,
    bio: "",
    experience: [],
    projects: [],
    achievements: [],
    socialLinks: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const autoSaveTimerRef = useRef(null);
  const hasUserEditedRef = useRef(false);

  const getDraftKey = useCallback(() => {
    return session?.user?.email
      ? `creator-profile-draft-${session.user.email}`
      : null;
  }, [session]);

  const saveDraft = useCallback(async () => {
    const draftKey = getDraftKey();
    if (!draftKey) return;

    try {
      setIsSaving(true);
      setSaveStatus("Saving draft...");

      const draftData = {
        ...formData,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(draftKey, JSON.stringify(draftData));

      setSaveStatus("Draft saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving draft:", error);
      setSaveStatus("Save failed");
      setTimeout(() => setSaveStatus(""), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [formData, getDraftKey]);

  const loadDraft = useCallback(() => {
    const draftKey = getDraftKey();
    if (!draftKey) return null;

    try {
      const draftData = localStorage.getItem(draftKey);
      return draftData ? JSON.parse(draftData) : null;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  }, [getDraftKey]);

  const clearDraft = useCallback(() => {
    const draftKey = getDraftKey();
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  }, [getDraftKey]);

  const checkUsernameAvailability = (username) => {
    if (!username) {
      setUsernameError("");
      return true;
    }

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }

    if (username.length > 20) {
      setUsernameError("Username must be less than 20 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setUsernameError(
        "Only letters, numbers, dots, hyphens, and underscores"
      );
      return false;
    }

    const existingUsernames = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes("@") && !key.includes("draft_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data?.username && data.username !== formData.username) {
            existingUsernames.push(data.username.toLowerCase());
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    if (existingUsernames.includes(username.toLowerCase())) {
      setUsernameError("This username is already taken");
      return false;
    }

    setUsernameError("");
    return true;
  };

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 1000);
  }, [saveDraft]);

  // Load existing user data and drafts
  useEffect(() => {
    if (session?.user?.email) {
      cleanupBlobUrls(session.user.email);

      const draftData = loadDraft();
      const existingData = getAllUserData(session);

      const dataToUse =
        draftData &&
        (!existingData?.lastModified ||
          new Date(draftData.lastSaved || 0) >
            new Date(existingData.lastModified || 0))
          ? draftData
          : existingData;

      if (dataToUse) {
        setFormData({
          name: dataToUse.name || session.user.name || "",
          username: dataToUse.username || "",
          skills: Array.isArray(dataToUse.skills) ? dataToUse.skills : [],
          profileImage: dataToUse.profileImage || null,
          backgroundImage: dataToUse.backgroundImage || null,
          bio: dataToUse.bio || "",
          experience: Array.isArray(dataToUse.experience)
            ? dataToUse.experience
            : [],
          projects: Array.isArray(dataToUse.projects)
            ? dataToUse.projects
            : [],
          achievements: Array.isArray(dataToUse.achievements)
            ? dataToUse.achievements
            : [],
          socialLinks: Array.isArray(dataToUse.socialLinks)
            ? dataToUse.socialLinks
            : [],
        });

        if (draftData && draftData.lastSaved) {
          setSaveStatus("Draft recovered");
          setTimeout(() => setSaveStatus(""), 3000);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          name: session.user.name || "",
        }));
      }
    }
  }, [session, loadDraft]);

  // Auto-save after edits
  useEffect(() => {
    if (session?.user?.email && formData.name && hasUserEditedRef.current) {
      scheduleAutoSave();
    }
  }, [formData, session?.user?.email, scheduleAutoSave]);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        session?.user?.email &&
        formData.name &&
        hasUserEditedRef.current
      ) {
        saveDraft();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [formData, session?.user?.email, saveDraft]);

  // Periodic backup every 30s
  useEffect(() => {
    const backupInterval = setInterval(() => {
      if (
        session?.user?.email &&
        formData.name &&
        hasUserEditedRef.current
      ) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(backupInterval);
  }, [formData, session?.user?.email, saveDraft]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const skillOptions = [
    "Music Producer & Sound Designer",
    "Digital Artist & Illustrator",
    "2D/3D Animation Specialist",
    "Video Editor & Content Creator",
    "Full-Stack Web Developer",
    "Mobile App Developer",
    "Game Developer & Designer",
    "Professional Photographer",
    "Content Writer & Copywriter",
    "UI/UX & Graphic Designer",
    "Voice Actor & Narrator",
    "Audio Engineer & Mixer",
    "Data Analyst & Researcher",
    "AI/ML Engineer",
    "Digital Marketing Expert",
  ];

  const handleSkillToggle = (skill) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : prev.skills.length < 3
        ? [...prev.skills, skill]
        : prev.skills,
    }));
    scheduleAutoSave();
  };

  const handleImageUpload = (type, file) => {
    if (file) {
      hasUserEditedRef.current = true;
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please choose an image under 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          [type]: e.target.result,
        }));
        scheduleAutoSave();
      };
      reader.onerror = () => alert("Error uploading image. Please try again.");
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = (type) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({ ...prev, [type]: null }));
    scheduleAutoSave();
  };

  const handleImageEdit = (type) => {
    if (type === "profileImage") profileImageRef.current?.click();
    else if (type === "backgroundImage")
      backgroundImageRef.current?.click();
  };

  const addExperience = () => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", duration: "", description: "" },
      ],
    }));
    scheduleAutoSave();
  };

  const updateExperience = (index, field, value) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
    scheduleAutoSave();
  };

  const removeExperience = (index) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
    scheduleAutoSave();
  };

  const addProject = () => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          technologies: [],
          link: "",
          image: "",
        },
      ],
    }));
    scheduleAutoSave();
  };

  const updateProject = (index, field, value) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
    scheduleAutoSave();
  };

  const removeProject = (index) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    scheduleAutoSave();
  };

  const addAchievement = () => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { title: "", description: "", icon: "🏆" },
      ],
    }));
    scheduleAutoSave();
  };

  const updateAchievement = (index, field, value) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) =>
        i === index ? { ...achievement, [field]: value } : achievement
      ),
    }));
    scheduleAutoSave();
  };

  const removeAchievement = (index) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
    scheduleAutoSave();
  };

  const addSocialLink = () => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "", url: "", icon: "🔗" },
      ],
    }));
    scheduleAutoSave();
  };

  const updateSocialLink = (index, field, value) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
    scheduleAutoSave();
  };

  const removeSocialLink = (index) => {
    hasUserEditedRef.current = true;
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
    scheduleAutoSave();
  };

  const handleProjectImageUpload = (index, file) => {
    if (file) {
      hasUserEditedRef.current = true;
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please choose an image under 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => updateProject(index, "image", e.target.result);
      reader.onerror = () => alert("Error uploading image. Please try again.");
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!session?.user?.email) {
      console.error("No user email found");
      return;
    }

    if (!formData.username) {
      setUsernameError("Username is required");
      return;
    }

    if (!checkUsernameAvailability(formData.username)) return;

    const userData = {
      name: formData.name,
      username: formData.username,
      skills: formData.skills,
      bio: formData.bio,
      profileImage: formData.profileImage,
      backgroundImage: formData.backgroundImage,
      experience: formData.experience,
      projects: formData.projects,
      achievements: formData.achievements,
      socialLinks: formData.socialLinks,
      role: "creator",
      points: 0,
      lastModified: new Date().toISOString(),
    };

    saveUserData(session.user.email, userData);
    clearDraft();
    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Loading Profile</h2>
          <p className="mt-2 text-sm text-slate-400">Preparing your setup...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bountera-grid opacity-50" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(34,211,238,.35)]">
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
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[160px]" />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Creator Onboarding
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Complete your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              profile
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Hi {session?.user?.name}! Tell us about yourself and showcase your
            talents to the Bountera community.
          </p>

          {/* Auto-save indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur transition-all ${
                saveStatus === "Draft saved"
                  ? "border-green-500/20 bg-green-500/10 text-green-300"
                  : saveStatus === "Save failed"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : isSaving
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-500"
              }`}
            >
              <Save className="h-3 w-3" />
              {saveStatus || (isSaving ? "Saving..." : "Auto-save on")}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Background Image */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Background Image
              </h3>
            </div>

            <div
              className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-cyan-400/40"
              onClick={() => backgroundImageRef.current?.click()}
            >
              {formData.backgroundImage ? (
                <>
                  <NextImage
                    src={formData.backgroundImage}
                    alt="Background"
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
                        handleImageEdit("backgroundImage");
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20"
                    >
                      <Pencil className="h-4 w-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete("backgroundImage");
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500 transition-colors group-hover:text-cyan-300">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">Click to upload banner</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                ref={backgroundImageRef}
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload("backgroundImage", e.target.files[0])
                }
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Profile Information
              </h3>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-white/10 bg-white/[0.05] ring-2 ring-cyan-500/20 transition-all duration-300 hover:ring-cyan-400/50"
                  onClick={() => profileImageRef.current?.click()}
                >
                  {formData.profileImage ? (
                    <>
                      <NextImage
                        src={formData.profileImage}
                        alt="Profile"
                        fill
                        sizes="112px"
                        className="object-cover transition duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Pencil className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 transition-colors group-hover:text-cyan-300">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={profileImageRef}
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("profileImage", e.target.files[0])
                    }
                    className="hidden"
                  />
                </div>
                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={() => handleImageDelete("profileImage")}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>

              {/* Inputs */}
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      hasUserEditedRef.current = true;
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      scheduleAutoSave();
                    }}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
                    placeholder="Enter your display name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5" />
                      Username
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        hasUserEditedRef.current = true;
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-zA-Z0-9_.-]/g, "");
                        setFormData((prev) => ({
                          ...prev,
                          username: value,
                        }));
                        checkUsernameAvailability(value);
                        scheduleAutoSave();
                      }}
                      className={`h-11 w-full rounded-xl border bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:ring-2 ${
                        usernameError
                          ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/10"
                          : formData.username && !usernameError
                          ? "border-green-500/30 focus:border-green-400 focus:ring-green-500/10"
                          : "border-white/10 focus:border-cyan-400/50 focus:ring-cyan-500/10"
                      }`}
                      placeholder="your-username"
                      required
                    />
                    {formData.username && !usernameError && (
                      <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                    )}
                  </div>
                  {usernameError ? (
                    <p className="mt-1.5 text-xs text-red-400">
                      {usernameError}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Your profile URL: bountera.com/profile/
                      {formData.username || "username"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Bio
                    </span>
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => {
                      hasUserEditedRef.current = true;
                      setFormData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }));
                      scheduleAutoSave();
                    }}
                    className="h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10"
                    placeholder="Tell everyone about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
                    {/* Skills */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">Your Skills</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                {formData.skills.length}/3 selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {skillOptions.map((skill) => {
                const isSelected = formData.skills.includes(skill);
                const canSelect =
                  formData.skills.length < 3 || isSelected;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    disabled={!canSelect}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,.1)]"
                        : canSelect
                        ? "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200"
                        : "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      )}
                      <span>{skill}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="rounded-full p-0.5 hover:bg-cyan-500/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">
                  Experience
                </h3>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 border border-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {formData.experience.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No experience added yet
                  </p>
                </div>
              )}

              {formData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15"
                >
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) =>
                        updateExperience(index, "title", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Company"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) =>
                      updateExperience(index, "duration", e.target.value)
                    }
                    className="mb-3 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                    placeholder="Duration (e.g., Jan 2020 - Present)"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    className="h-20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                    placeholder="Describe your role..."
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">
                  Projects Showcase
                </h3>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 border border-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {formData.projects.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Rocket className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No projects added yet
                  </p>
                </div>
              )}

              {formData.projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15"
                >
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) =>
                        updateProject(index, "title", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Project Title"
                    />
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) =>
                        updateProject(index, "link", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Project Link"
                    />
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) =>
                      updateProject(index, "description", e.target.value)
                    }
                    className="mb-3 h-20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                    placeholder="Describe your project..."
                  />
                  <input
                    type="text"
                    value={project.technologies.join(", ")}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "technologies",
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                    className="mb-3 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                    placeholder="Technologies (comma-separated)"
                  />

                  <div className="mb-3 flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleProjectImageUpload(index, e.target.files[0])
                        }
                        className="hidden"
                      />
                    </label>
                    {project.image && (
                      <button
                        type="button"
                        onClick={() => updateProject(index, "image", "")}
                        className="text-xs text-red-400 transition hover:text-red-300"
                      >
                        Clear image
                      </button>
                    )}
                  </div>

                  {project.image && (
                    <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg border border-white/10">
                      <NextImage
                        src={project.image}
                        alt="Project preview"
                        fill
                        sizes="(max-width: 896px) 100vw, 896px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
                    {/* Achievements */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">
                  Achievements
                </h3>
              </div>
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 border border-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {formData.achievements.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Trophy className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No achievements added yet
                  </p>
                </div>
              )}

              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15"
                >
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[80px_1fr]">
                    <input
                      type="text"
                      value={achievement.icon}
                      onChange={(e) =>
                        updateAchievement(index, "icon", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-center text-lg outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="🏆"
                    />
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) =>
                        updateAchievement(index, "title", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Achievement Title"
                    />
                  </div>
                  <textarea
                    value={achievement.description}
                    onChange={(e) =>
                      updateAchievement(index, "description", e.target.value)
                    }
                    className="h-20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                    placeholder="Describe your achievement..."
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">
                  Social Links
                </h3>
              </div>
              <button
                type="button"
                onClick={addSocialLink}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 border border-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {formData.socialLinks.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Link2 className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    No social links added yet
                  </p>
                </div>
              )}

              {formData.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) =>
                        updateSocialLink(index, "platform", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="Platform (e.g., Twitter)"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        updateSocialLink(index, "url", e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/10"
                      placeholder="URL"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-10 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,.35)]"
            >
              Save Profile
              <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfileSetup;