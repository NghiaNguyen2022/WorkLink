import { randomUUID } from 'node:crypto';

import {
  ConflictException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  customerProfiles,
  users,
  workerProfiles,
} from '../../database/schema/index';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly database: DatabaseService,
  ) {}

  async login(input: LoginInput) {
    const user =
      await this.usersService.findByEmailWithPassword(
        input.email.trim().toLowerCase(),
      );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không hợp lệ',
      );
    }

    const passwordValid = await compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không hợp lệ',
      );
    }

    await this.usersService.updateLastLogin(user.id);

    return this.issueToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
  }

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();

    const existing =
      await this.usersService.findByEmailWithPassword(
        email,
      );

    if (existing) {
      throw new ConflictException(
        'Email đã được sử dụng',
      );
    }

    if (
      input.role === 'CUSTOMER' &&
      (!input.customerType || !input.displayName)
    ) {
      throw new BadRequestException(
        'customerType và displayName là bắt buộc khi đăng ký khách hàng',
      );
    }

    const userId = randomUUID();
    const passwordHash = await hash(input.password, 10);

    await this.database.db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
        isActive: true,
        mustChangePassword: false,
      });

      if (input.role === 'CUSTOMER') {
        await tx.insert(customerProfiles).values({
          id: randomUUID(),
          userId,
          customerType: input.customerType!,
          displayName: input.displayName!,
        });
      }

      if (input.role === 'WORKER') {
        await tx.insert(workerProfiles).values({
          id: randomUUID(),
          userId,
        });
      }
    });

    return this.issueToken({
      id: userId,
      email,
      fullName: input.fullName,
      phone: input.phone ?? null,
      role: input.role,
      mustChangePassword: false,
    });
  }

  private async issueToken(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    mustChangePassword: boolean;
  }) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const profileId = await this.findProfileId(
      user.id,
      user.role,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      profileId,
    };
  }

  private async findProfileId(
    userId: string,
    role: string,
  ): Promise<string | null> {
    if (role === 'CUSTOMER') {
      const [profile] = await this.database.db
        .select({ id: customerProfiles.id })
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, userId))
        .limit(1);

      return profile?.id ?? null;
    }

    if (role === 'WORKER') {
      const [profile] = await this.database.db
        .select({ id: workerProfiles.id })
        .from(workerProfiles)
        .where(eq(workerProfiles.userId, userId))
        .limit(1);

      return profile?.id ?? null;
    }

    return null;
  }
}
