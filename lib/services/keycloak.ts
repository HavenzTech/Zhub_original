// Keycloak OIDC service for authentication
// Uses Authorization Code flow (PKCE disabled for email verification compatibility)
// Security maintained via mandatory TOTP/MFA

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'havenz';
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'havenz-frontend';
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/callback`
  : 'http://localhost:3000/callback';

// Helper function for state parameter
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((v) => charset[v % charset.length])
    .join('');
}

export interface KeycloakTokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  email_verified?: boolean;
}

class KeycloakService {
  private tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  private authEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;
  private userInfoEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
  private logoutEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

  /**
   * Initiate login by redirecting to Keycloak
   */
  async login(returnTo?: string): Promise<void> {
    // Store the return URL if provided
    if (returnTo) {
      sessionStorage.setItem('auth_return_to', returnTo);
    }

    // Build authorization URL (no PKCE - security via MFA)
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email',
      state: generateRandomString(16),
    });

    // Redirect to Keycloak
    window.location.href = `${this.authEndpoint}?${params.toString()}`;
  }

  /**
   * Handle the callback from Keycloak and exchange code for tokens
   */
  async handleCallback(code: string): Promise<KeycloakTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KEYCLOAK_CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  /**
   * Get user info from Keycloak
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    const response = await fetch(this.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<KeycloakTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: KEYCLOAK_CLIENT_ID,
      refresh_token: refreshToken,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  /**
   * Logout from Keycloak
   */
  logout(idToken?: string): void {
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      post_logout_redirect_uri: window.location.origin + '/login',
    });

    if (idToken) {
      params.append('id_token_hint', idToken);
    }

    window.location.href = `${this.logoutEndpoint}?${params.toString()}`;
  }

  /**
   * Get the stored return URL after login
   */
  getReturnUrl(): string {
    const returnTo = sessionStorage.getItem('auth_return_to');
    sessionStorage.removeItem('auth_return_to');
    return returnTo || '/';
  }
}

export const keycloakService = new KeycloakService();
