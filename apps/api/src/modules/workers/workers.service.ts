import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  users,
  workerAvailability,
  workerProfiles,
  workerSkills,
} from '../../database/schema/index';

@Injectable()
export class WorkersService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async findAll() {
    return this.database.db
      .select({
        id: workerProfiles.id,
        userId: workerProfiles.userId,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        verificationLevel:
          workerProfiles.verificationLevel,
        verificationStatus:
          workerProfiles.verificationStatus,
        currentDistrict: workerProfiles.currentDistrict,
        currentCity: workerProfiles.currentCity,
        maxTravelKm: workerProfiles.maxTravelKm,
        minimumHourlyRate:
          workerProfiles.minimumHourlyRate,
        rating: workerProfiles.rating,
        completedJobs: workerProfiles.completedJobs,
        cancellationRate:
          workerProfiles.cancellationRate,
        onTimeRate: workerProfiles.onTimeRate,
        available: workerProfiles.available,
        isSuspended: workerProfiles.isSuspended,
      })
      .from(workerProfiles)
      .innerJoin(
        users,
        eq(workerProfiles.userId, users.id),
      )
      .orderBy(asc(users.fullName));
  }

  async findById(id: string) {
    const profiles = await this.database.db
      .select({
        id: workerProfiles.id,
        userId: workerProfiles.userId,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        dateOfBirth: workerProfiles.dateOfBirth,
        gender: workerProfiles.gender,
        verificationLevel:
          workerProfiles.verificationLevel,
        verificationStatus:
          workerProfiles.verificationStatus,
        biography: workerProfiles.biography,
        currentAddress: workerProfiles.currentAddress,
        currentDistrict: workerProfiles.currentDistrict,
        currentCity: workerProfiles.currentCity,
        latitude: workerProfiles.latitude,
        longitude: workerProfiles.longitude,
        transportType: workerProfiles.transportType,
        maxTravelKm: workerProfiles.maxTravelKm,
        minimumHourlyRate:
          workerProfiles.minimumHourlyRate,
        rating: workerProfiles.rating,
        completedJobs: workerProfiles.completedJobs,
        cancellationRate:
          workerProfiles.cancellationRate,
        onTimeRate: workerProfiles.onTimeRate,
        available: workerProfiles.available,
        isSuspended: workerProfiles.isSuspended,
      })
      .from(workerProfiles)
      .innerJoin(
        users,
        eq(workerProfiles.userId, users.id),
      )
      .where(eq(workerProfiles.id, id))
      .limit(1);

    const profile = profiles[0];

    if (!profile) {
      return null;
    }

    const skills = await this.database.db
      .select()
      .from(workerSkills)
      .where(eq(workerSkills.workerId, id))
      .orderBy(asc(workerSkills.skillName));

    const availability = await this.database.db
      .select()
      .from(workerAvailability)
      .where(eq(workerAvailability.workerId, id));

    return {
      ...profile,
      skills,
      availability,
    };
  }
}
