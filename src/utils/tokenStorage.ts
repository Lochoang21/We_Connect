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

  // Check if tokens exist
  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },
};
