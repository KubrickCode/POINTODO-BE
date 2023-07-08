import { Injectable } from '@nestjs/common';
import { UserEntity } from '@domain/user/entities/user.entity';
import { Inject } from '@nestjs/common';
import { ITokenService } from './interfaces/itoken.service';
import { IRedisService } from '@domain/redis/interfaces/iredis.service';
import { IUserRepository } from '@domain/user/interfaces/iuser.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IRedisService')
    private readonly redisService: IRedisService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async login(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      60 * 60 * 24 * 7,
    );
    return { accessToken, refreshToken };
  }

  async logout(user: UserEntity): Promise<void> {
    await this.redisService.delete(`refresh_token:${user.id}`);
  }

  async refresh(token: string) {
    const decoded = this.tokenService.decodeToken(token);
    const { id, exp } = decoded;
    if (exp === 0) return;
    const redisToken = await this.redisService.get(`refresh_token:${id}`);
    if (token !== redisToken) return;
    const user = await this.userRepository.findByEmail(decoded.email);
    return this.tokenService.generateAccessToken(user);
  }
}
