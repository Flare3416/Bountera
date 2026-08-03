"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/apiClient";

const UserContext = createContext({
  user: null,
  userLoading: false,
  refreshUser: () => {},
});

// Global provider that loads the authenticated user's full profile (including
// points, rank, skills, experience, projects, achievements, socialLinks)
// EXACTLY ONCE and shares it with every consumer through context.
export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  const email = session?.user?.email;

  const loadUser = useCallback(
    async (force = false) => {
      if (!email) {
        setUser(null);
        return;
      }

      setUserLoading(true);

      try {
        const data = await apiGet(`/api/users/${encodeURIComponent(email)}`, {
          force,
        });
        setUser(data);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    },
    [email]
  );

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setUser(null);
      return;
    }

    loadUser();
  }, [status, loadUser]);

  const refreshUser = useCallback(() => loadUser(true), [loadUser]);

  const value = useMemo(
    () => ({ user, userLoading, refreshUser }),
    [user, userLoading, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
