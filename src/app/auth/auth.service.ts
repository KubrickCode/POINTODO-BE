import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CHECK_PASSWORD_MESSAGE,
  LOGOUT_SUCCESS_MESSAGE,
} from '../../shared/messages/auth.messages';
import { ITokenService } from '@domain/auth/interfaces/token.service.interface';
import { IRedisService } from '@domain/redis/interfaces/redis.service.interface';
import { IUserRepository } from '@domain/user/interfaces/user.repository.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { jwtExpiration } from 'src/shared/config/jwt.config';
import {
  AUTH_EXPIRED_REFRESH_TOKEN,
  AUTH_INVALID_ADMIN,
  AUTH_INVALID_TOKEN,
} from '@domain/auth/errors/auth.errors';
import { IAuthService } from '@domain/auth/interfaces/auth.service.interface';
import { IPasswordHasher } from '@domain/user/interfaces/passwordHasher.interface';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ReqValidateUserAppDto,
  ResValidateUserAppDto,
} from '@domain/auth/dto/app/vaildateUser.app.dto';
import {
  ReqCheckPasswordAppDto,
  ResCheckPasswordAppDto,
} from '@domain/auth/dto/app/checkPassword.app.dto';
import {
  ReqLoginAppDto,
  ResLoginAppDto,
} from '@domain/auth/dto/app/login.app.dto';
import {
  ReqLogoutAppDto,
  ResLogoutAppDto,
} from '@domain/auth/dto/app/logout.app.dto';
import {
  ReqRefreshAppDto,
  ResRefreshAppDto,
} from '@domain/auth/dto/app/refresh.app.dto';
import { ReqSocialLoginAppDto } from '@domain/auth/dto/app/socialLogin.app.dto';
import {
  ReqValidateAdminAppDto,
  ResValidateAdminAppDto,
} from '@domain/auth/dto/app/validateAdmin.app.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IRedisService')
    private readonly redisService: IRedisService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async validateUser(
    req: ReqValidateUserAppDto,
  ): Promise<ResValidateUserAppDto> {
    const loginDto = plainToClass(ReqValidateUserAppDto, req);
    const validationErrors = await validate(loginDto);

    if (validationErrors.length > 0) {
      const message = validationErrors
        .map((err) => Object.values(err.constraints))
        .flat();
      throw new BadRequestException(message);
    }

    const user = await this.userRepository.findByEmail(req.email);

    if (!user) {
      throw new NotFoundException('존재하지 않는 계정입니다');
    }

    const isCorrectPassword = await this.passwordHasher.comparePassword(
      req.password,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다');
    }

    return user;
  }

  async checkPassword(
    req: ReqCheckPasswordAppDto,
  ): Promise<ResCheckPasswordAppDto> {
    const user = await this.userRepository.findById(req.id);
    const isCorrectPassword = await this.passwordHasher.comparePassword(
      req.password,
      user.password,
    );
    if (!isCorrectPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다');
    }
    return { message: CHECK_PASSWORD_MESSAGE };
  }

  async login(req: ReqLoginAppDto): Promise<ResLoginAppDto> {
    const accessToken = this.tokenService.generateAccessToken(req);
    const refreshToken = this.tokenService.generateRefreshToken(req);
    await this.redisService.set(
      `refresh_token:${req.id}`,
      refreshToken,
      jwtExpiration.refreshTokenExpirationSeconds,
    );
    return { accessToken, refreshToken };
  }

  async logout(req: ReqLogoutAppDto): Promise<ResLogoutAppDto> {
    await this.redisService.delete(`refresh_token:${req.id}`);
    return { message: LOGOUT_SUCCESS_MESSAGE };
  }

  async refresh(req: ReqRefreshAppDto): Promise<ResRefreshAppDto> {
    const decoded = this.tokenService.decodeToken(req.refreshToken);
    if (!decoded || !decoded.id) {
      throw new UnauthorizedException(AUTH_INVALID_TOKEN);
    }
    const redisToken = await this.redisService.get(
      `refresh_token:${decoded.id}`,
    );

    if (redisToken === null) {
      this.logger.error(AUTH_EXPIRED_REFRESH_TOKEN);
      throw new UnauthorizedException(AUTH_EXPIRED_REFRESH_TOKEN);
    }
    if (req.refreshToken !== redisToken) {
      this.logger.error(AUTH_INVALID_TOKEN);
      throw new UnauthorizedException(AUTH_INVALID_TOKEN);
    }
    const user = await this.userRepository.findById(decoded.id);
    const accessToken = this.tokenService.generateAccessToken(user);
    return { accessToken };
  }

  async socialLogin(socialUser: ReqSocialLoginAppDto): Promise<ResLoginAppDto> {
    const { email, provider } = socialUser;
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      return await this.login(user);
    } else {
      const user = { email, provider };
      const newUser = await this.userRepository.createUser(user);
      return await this.login(newUser);
    }
  }

  async validateAdmin(
    req: ReqValidateAdminAppDto,
  ): Promise<ResValidateAdminAppDto> {
    const { id } = req;
    const user = await this.userRepository.findById(id);
    if (user.role !== 'Admin') {
      throw new ForbiddenException(AUTH_INVALID_ADMIN);
    }
    return { validation: true };
  }
}
