"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  // Initialize with initialValue to match server-side rendering
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error loading localStorage key "${key}":`, error);
      }
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(
          new CustomEvent("local-storage", {
            detail: { key, value: valueToStore },
          })
        );
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  // Listen for cross-tab changes
  useEffect(() => {
    if (!isHydrated) return;

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener(
      "local-storage",
      handleStorageChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "local-storage",
        handleStorageChange as EventListener
      );
    };
  }, [key, isHydrated]);

  return [storedValue, setValue, isHydrated];
}
