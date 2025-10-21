export interface Session {
  AccessToken: string;
  RefreshToken: string;
  UserName: string;
  Email?: string;
  VerificationCode?: string;
  StartDate?: string;
  EndDate?: string;
}
