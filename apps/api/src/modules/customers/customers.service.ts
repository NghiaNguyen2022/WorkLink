import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  customerLocations,
  customerProfiles,
  users,
} from '../../database/schema/index';

@Injectable()
export class CustomersService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async findAll() {
    return this.database.db
      .select({
        id: customerProfiles.id,
        userId: customerProfiles.userId,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        customerType: customerProfiles.customerType,
        displayName: customerProfiles.displayName,
        companyName: customerProfiles.companyName,
        taxCode: customerProfiles.taxCode,
        verificationStatus:
          customerProfiles.verificationStatus,
        rating: customerProfiles.rating,
        completedJobs: customerProfiles.completedJobs,
        isBlocked: customerProfiles.isBlocked,
        createdAt: customerProfiles.createdAt,
      })
      .from(customerProfiles)
      .innerJoin(
        users,
        eq(customerProfiles.userId, users.id),
      )
      .orderBy(asc(customerProfiles.displayName));
  }

  async findById(id: string) {
    const profiles = await this.database.db
      .select({
        id: customerProfiles.id,
        userId: customerProfiles.userId,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        customerType: customerProfiles.customerType,
        displayName: customerProfiles.displayName,
        companyName: customerProfiles.companyName,
        taxCode: customerProfiles.taxCode,
        verificationStatus:
          customerProfiles.verificationStatus,
        rating: customerProfiles.rating,
        completedJobs: customerProfiles.completedJobs,
        isBlocked: customerProfiles.isBlocked,
        createdAt: customerProfiles.createdAt,
        updatedAt: customerProfiles.updatedAt,
      })
      .from(customerProfiles)
      .innerJoin(
        users,
        eq(customerProfiles.userId, users.id),
      )
      .where(eq(customerProfiles.id, id))
      .limit(1);

    const profile = profiles[0];

    if (!profile) {
      return null;
    }

    const locations = await this.database.db
      .select()
      .from(customerLocations)
      .where(eq(customerLocations.customerId, id))
      .orderBy(asc(customerLocations.label));

    return {
      ...profile,
      locations,
    };
  }
}
