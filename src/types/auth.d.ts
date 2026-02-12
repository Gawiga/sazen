/**
 * Authentication Types for PocketBase
 */

export interface PBAuthResponse {
  success: boolean;
  token?: string;
  record?: PBUser;
  error?: string;
}

export interface PBUser {
  id: string;
  email: string;
  username?: string;
  verified?: boolean;
  emailVisibility?: boolean;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  passwordConfirm: string;
  [key: string]: unknown;
}

export interface OAuth2Payload {
  provider: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  resetToken: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthStore {
  isValid: boolean;
  token: string;
  record: PBUser | null;
}

export interface OAuthProvider {
  name: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
}

export interface OAuthListResponse {
  oauth2?: {
    providers?: OAuthProvider[];
  };
}
