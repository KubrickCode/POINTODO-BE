import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '@user/app/user.service';
import { UserRepository } from '@user/infrastructure/prisma/user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@shared/service/prisma.service';
import { CacheService } from '@cache/infrastructure/cache.service';
import { jwtConfig } from '@shared/config/jwt.config';
import { BadgeProgressRepository } from '@badge/infrastructure/prisma/badgeProgress.repository';
import { PrismaTransaction } from '@shared/service/transaction.service';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IUserService',
      useClass: UserService,
    },
    {
      provide: 'ICacheService',
      useClass: CacheService,
    },
    {
      provide: 'IBadgeProgressRepository',
      useClass: BadgeProgressRepository,
    },
    {
      provide: 'ITransaction',
      useFactory: (prismaService: PrismaService) => {
        return new PrismaTransaction(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: jwtConfig(configService).accessTokenSecret,
        signOptions: {
          expiresIn: jwtConfig(configService).accessTokenExpiration,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UserModule {}
