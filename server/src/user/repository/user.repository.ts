import { User } from '@prisma/client';
import prisma from '../../../prisma/client';
import { IUserInformations, IUser } from '../../types/user';
import { IUserUpdateDto, UserDto } from '../dto/user.dto';

export class UserRepository {
  static async createUser(user: UserDto): Promise<User> {
    return await prisma.user.create({
      data: user,
    });
  }

  static async switchVerificationCode({
    userId,
    verificationCode,
  }: {
    userId: string;
    verificationCode: string | null;
  }): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { verificationCode },
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { email },
    });
  }

  static async findUserByVerificationCode(
    verificationCode: string
  ): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { verificationCode },
    });
  }

  static async verifyUser(userId: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { verified: true, verificationCode: null },
    });
  }

  static async updateResetPasswordToken({
    userId,
    passwordResetToken,
    passwordResetAt,
  }: {
    userId: string;
    passwordResetToken: string | null;
    passwordResetAt: Date | null;
  }): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken, passwordResetAt },
    });
  }

  static async findUserByPasswordResetToken(
    passwordResetToken: string
  ): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { passwordResetToken, passwordResetAt: { gt: new Date() } },
    });
  }

  static async updateUserPassword({
    userId,
    hashedPassword,
    passwordResetToken,
    passwordResetAt,
  }: {
    userId: string;
    hashedPassword: string;
    passwordResetToken: null;
    passwordResetAt: null;
  }): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, passwordResetToken, passwordResetAt },
    });
  }

  static async findByUserId(userId: string): Promise<IUser | null> {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        notification: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  static async updateUser(userUpdate: IUserUpdateDto) {
    const { id, username } = userUpdate;
    const user = await prisma.user.update({
      where: { id },
      data: { username },
    });
    return user;
  }

  static async getUserInformations(
    userId: string
  ): Promise<IUserInformations | null> {
    const userinfos = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        role: true,
        username: true,
      },
    });
    return userinfos;
  }
}
