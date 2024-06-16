import { RoleEnumType } from '@prisma/client';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role?: RoleEnumType | null;
  notification: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInformations {
  role: RoleEnumType | null;
  username: string;
}
