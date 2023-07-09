import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserAppService } from './user.app.service';
import { UserService } from '@domain/user/user.service';
import { UserRepository } from '@infrastructure/user/prisma/user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@infrastructure/services/prisma.service';
import { PasswordHasher } from '@infrastructure/user/passwordHasher';

@Module({
  controllers: [UserController],
  providers: [
    UserAppService,
    UserService,
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IPasswordHasher',
      useClass: PasswordHasher,
    },
  ],
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UserModule {}
