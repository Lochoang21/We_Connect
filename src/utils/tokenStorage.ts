// src/utils/tokenStorage.ts
// Centralized token storage management with namespace

const TOKEN_PREFIX = "we_connect_";

export const TOKEN_KEYS = {
  ACCESS_TOKEN: `${TOKEN_PREFIX}accessToken`,
  REFRESH_TOKEN: `${TOKEN_PREFIX}refreshToken`,
} as const;

export const tokenStorage = {
  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // Set access token
  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  },

  // Set refresh token
  setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  },

  // Set both tokens
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // Check if tokens exist
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },
};
