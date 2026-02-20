export interface AuthUser {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string | null;
  userName: string | null;
  emailVerified: boolean;
}
