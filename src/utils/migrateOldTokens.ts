// src/utils/migrateOldTokens.ts
// Script để migrate tokens cũ sang format mới với prefix

import { tokenStorage } from "./tokenStorage";

/**
 * Migrate old localStorage tokens to new prefixed format
 * Run this once during app initialization if needed
 */
export const migrateOldTokens = (): void => {
  const OLD_ACCESS_KEY = "accessToken";
  const OLD_REFRESH_KEY = "refreshToken";

  try {
    // Check if old tokens exist
    const oldAccessToken = localStorage.getItem(OLD_ACCESS_KEY);
    const oldRefreshToken = localStorage.getItem(OLD_REFRESH_KEY);

    // Migrate if found
    if (oldAccessToken && !tokenStorage.getAccessToken()) {
      console.log("🔄 Migrating old accessToken to new format...");
      tokenStorage.setAccessToken(oldAccessToken);
      localStorage.removeItem(OLD_ACCESS_KEY);
    }

    if (oldRefreshToken && !tokenStorage.getRefreshToken()) {
      console.log("🔄 Migrating old refreshToken to new format...");
      tokenStorage.setRefreshToken(oldRefreshToken);
      localStorage.removeItem(OLD_REFRESH_KEY);
    }

    // Clean up any other non-prefixed tokens from other projects
    cleanupForeignTokens();
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

/**
 * Remove non-prefixed tokens that might be from other projects
 */
const cleanupForeignTokens = (): void => {
  const keys = Object.keys(localStorage);
  const dangerousKeys = [
    "accessToken",
    "refreshToken",
    "token",
    "auth_token",
    "jwt",
  ];

  keys.forEach((key) => {
    // Remove if it's a common token key but doesn't have our prefix
    if (
      dangerousKeys.includes(key) &&
      !key.startsWith("we_connect_")
    ) {
      console.warn(`⚠️ Removing foreign token key: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Debug: Show all tokens in localStorage
 */
export const debugTokens = (): void => {
  console.group("🔍 Token Storage Debug");
  console.log("Our tokens:");
  console.log("  - Access:", tokenStorage.getAccessToken()?.slice(0, 20) + "...");
  console.log("  - Refresh:", tokenStorage.getRefreshToken()?.slice(0, 20) + "...");
  console.log("\nAll localStorage keys:");
  Object.keys(localStorage).forEach((key) => {
    if (key.includes("token") || key.includes("Token")) {
      console.log(`  - ${key}`);
    }
  });
  console.groupEnd();
};
