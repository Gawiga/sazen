export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  username?: string;
}

export interface AuthLoginPayload {
  email?: string;
  password?: string;
}

export interface AuthSignupPayload {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  name?: string;
  emailVisibility?: boolean;
}
