import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtModule,
  type JwtModuleOptions,
} from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type JwtExpiresIn =
  NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
  imports: [
    UsersModule,

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (
        config: ConfigService,
      ): JwtModuleOptions => {
        const expiresIn =
          config.get<string>('JWT_EXPIRES_IN') ?? '1d';

        return {
          secret: config.getOrThrow<string>('JWT_SECRET'),

          signOptions: {
            expiresIn: expiresIn as JwtExpiresIn,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
