import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import { users } from '../../database/schema';

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async findAll(): Promise<SafeUser[]> {
    return this.database.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(asc(users.fullName));
  }

  async findById(id: string): Promise<SafeUser | null> {
    const rows = await this.database.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByEmailWithPassword(email: string) {
    const rows = await this.database.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return rows[0] ?? null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, id));
  }
}
