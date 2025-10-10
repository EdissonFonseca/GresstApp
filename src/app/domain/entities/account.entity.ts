export interface Account {
  Id: string;

  PersonId: string;
  UserPersonId: string;
  UserId: string;
  Login: string;
  Name: string;
  UserName: string;

  Settings: Record<string,string>;
  Parameters: Record<string,string>;
  Permissions: Record<string,string>;
}
