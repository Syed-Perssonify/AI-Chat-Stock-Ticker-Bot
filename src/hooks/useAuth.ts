"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/common/routes";

interface UseAuthReturn {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      return data.authenticated;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(false);
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        router.push(ROUTES.LOGIN);
      } else {
        toast({
          title: "Logout failed",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
    logout,
  };
}
