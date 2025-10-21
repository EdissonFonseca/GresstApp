export interface Party {
  Id: string;
  Email?: string;
  Identification: string;
  IsClient?: boolean | null;
  IsProvider?: boolean | null;
  IsEmployee?: boolean | null;
  IsTransporter?: boolean | null;
  Name: string;
  Phone: string;
}
