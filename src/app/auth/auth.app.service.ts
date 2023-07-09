import { Injectable } from '@nestjs/common';
import { UserEntity } from '@domain/user/entities/user.entity';
import { AuthService } from '@domain/auth/auth.service';
import { ResLogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthAppService {
  constructor(private readonly authService: AuthService) {}

  async login(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.authService.login(user);
    return { accessToken, refreshToken };
  }

  async logout(user: UserEntity): Promise<ResLogoutDto> {
    await this.authService.logout(user);
    return { message: 'success' };
  }

  async refresh(token: string) {
    return await this.authService.refresh(token);
  }
}
