export interface AuthUser {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string | null;
  userName: string | null;
  emailVerified: boolean;
}

export interface AuthState {
  isLoggedIn: boolean;
  initialAuth: boolean;
  authFormIsOpen: boolean;
  reAuthFormIsOpen: boolean;
  showResetPassword: boolean;
  isLoading: boolean;
  userDataIsLoading: boolean;
  userDataLoadError: string;
  errorMessage: string;
  successMessage: string;
  tester: boolean;
  user: AuthUser;
}

export interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}
