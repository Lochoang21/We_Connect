// Token storage utility for managing access and refresh tokens
export const tokenStorage = {
  // Access Token
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
  },

  // Refresh Token
  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  },

  setRefreshToken(token: string): void {
    localStorage.setItem("refreshToken", token);
  },

  // Set both tokens at once
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  clearAuth(): void {
    this.clearTokens();
  },

  // Check if tokens exist
  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },

  getUserIdFromAccessToken(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const [, payload] = token.split('.');
      if (!payload) return null;

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4 || 4)) % 4, '='));
      const parsed = JSON.parse(decoded) as Record<string, unknown>;
      const rawId = parsed.sub ?? parsed.userId ?? parsed.id;
      const userId = Number(rawId);

      return Number.isFinite(userId) ? userId : null;
    } catch {
      return null;
    }
  },
};
