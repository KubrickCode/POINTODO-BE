import { BadgeEntity } from '@admin/badge/domain/entities/Badge.entity';
import { IBadgeAdminRepository } from '@admin/badge/domain/interfaces/Badge.admin.repository.interface';
import { ReqBuyBadgeAppDto } from '@badge/domain/dto/BuyBadge.app.dto';
import { ReqChangeSelectedBadgeAppDto } from '@badge/domain/dto/ChangeSelectedBadge.app.dto';
import { ReqDeleteUserBadgeAppDto } from '@badge/domain/dto/DeleteUserBadge.app.dto';
import {
  ReqGetAllBadgeProgressAppDto,
  ResGetAllBadgeProgressAppDto,
} from '@badge/domain/dto/GetAllBadgeProgress.app.dto';
import {
  ReqGetUserBadgeListAppDto,
  ResGetUserBadgeListAppDto,
} from '@badge/domain/dto/GetUserBadgeList.app.dto';
import {
  ReqGetUserBadgeListWithNameAppDto,
  ResGetUserBadgeListWithNameAppDto,
} from '@badge/domain/dto/GetUserBadgeListWithName.app.dto';
import { ReqPutBadgeToUserAppDto } from '@badge/domain/dto/PutBadgeToUser.app.dto';
import { IBadgeService } from '@badge/domain/interfaces/Badge.service.interface';
import { IBadgeProgressRepository } from '@badge/domain/interfaces/BadgeProgress.repository.interface';
import { IUserBadgeRepository } from '@badge/domain/interfaces/UserBadge.repository.interface';
import { ICacheService } from '@cache/domain/interfaces/Cache.service.interface';
import {
  ConflictException,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPointRepository } from '@point/domain/interfaces/Point.repository.interface';
import { IRedisService } from '@redis/domain/interfaces/Redis.service.interface';
import { cacheConfig } from '@shared/config/Cache.config';
import { BadgeConstant } from '@shared/constants/Badge.constant';
import { ProviderConstant } from '@shared/constants/Provider.constant';
import { ITransactionService } from '@shared/interfaces/ITransaction.service.interface';
import { BadgeErrorMessage } from '@shared/messages/badge/Badge.errors';
import { BadgeMessage } from '@shared/messages/badge/Badge.messages';
import { IUserRepository } from '@user/domain/interfaces/User.repository.interface';
import { plainToClass } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class BadgeService implements IBadgeService {
  constructor(
    @Inject(ProviderConstant.IPOINT_REPOSITORY)
    private readonly pointRepository: IPointRepository,
    @Inject(ProviderConstant.IUSER_BADGE_REPOSITORY)
    private readonly userBadgeRepository: IUserBadgeRepository,
    @Inject(ProviderConstant.IBADGE_ADMIN_REPOSITORY)
    private readonly badgeAdminRepository: IBadgeAdminRepository,
    @Inject(ProviderConstant.IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ProviderConstant.IBADGE_PROGRESS_REPOSITORY)
    private readonly badgeProgressRepository: IBadgeProgressRepository,
    @Inject(ProviderConstant.IREDIS_SERVICE)
    private readonly redisService: IRedisService,
    @Inject(ProviderConstant.ICACHE_SERVICE)
    private readonly cacheService: ICacheService,
    @Inject(ProviderConstant.ITRANSACTION_SERVICE)
    private readonly transactionService: ITransactionService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async buyBadge(req: ReqBuyBadgeAppDto): Promise<void> {
    const { userId, badgeId } = req;
    let badgeLogId: number;

    await this.transactionService.runInTransaction(async (tx) => {
      const price = await this.badgeAdminRepository.getBadgePrice(badgeId, tx);

      const badgeLog = await this.userBadgeRepository.createUserBadgeLog(
        userId,
        badgeId,
        tx,
      );

      badgeLogId = badgeLog.id;

      await this.pointRepository.createSpentPointLog(
        badgeLogId,
        userId,
        price,
        tx,
      );
    });

    const userPoints = await this.pointRepository.calculateUserPoints(userId);
    if (userPoints < 0) {
      await this.userBadgeRepository.deleteUserBadgeLog(badgeLogId);
      throw new ConflictException(BadgeErrorMessage.BUY_BADGE_CONFLICT_POINTS);
    }

    await this.cacheService.deleteCache(`userBadgeList:${userId}`);
    await this.redisService.deleteKeysByPrefix(
      `userSpentPointsLogs:${userId}*`,
    );
    await this.cacheService.deleteCache(`SPENTtotalPointPages:${userId}`);

    this.logger.log(
      'info',
      `${BadgeMessage.BUY_BADGE_SUCCESS_MESSAGE}-유저 ID:${userId}, 뱃지 ID:${badgeId}`,
    );
  }

  async getUserBadgeList(
    req: ReqGetUserBadgeListAppDto,
  ): Promise<ResGetUserBadgeListAppDto[]> {
    const cacheKey = `userBadgeList:${req.userId}`;
    const cachedBadgeList = await this.cacheService.getFromCache<
      ResGetUserBadgeListAppDto[]
    >(cacheKey);
    if (cachedBadgeList) {
      return cachedBadgeList.map((item) =>
        plainToClass(ResGetUserBadgeListAppDto, item),
      );
    }

    const response = await this.userBadgeRepository.getUserBadgeList(
      req.userId,
    );
    const result = response.map((item) =>
      plainToClass(ResGetUserBadgeListAppDto, item),
    );

    await this.cacheService.setCache(
      cacheKey,
      result,
      cacheConfig(this.configService).cacheTTL,
    );

    return result;
  }

  async getUserBadgeListWithName(
    req: ReqGetUserBadgeListWithNameAppDto,
  ): Promise<ResGetUserBadgeListWithNameAppDto[]> {
    return await this.userBadgeRepository.getUserBadgeListWithName(req.userId);
  }

  async changeSelectedBadge(req: ReqChangeSelectedBadgeAppDto): Promise<void> {
    const { userId, badgeId } = req;
    const userBadgeList = await this.userBadgeRepository.getUserBadgeList(
      userId,
    );

    const badgeTypeList = userBadgeList.map((item) => item.badgeId);

    if (!badgeTypeList.includes(badgeId))
      throw new BadRequestException(BadgeErrorMessage.NOT_EXIST_USER_BADGE);

    await this.cacheService.deleteCache(`user:${userId}`);
    await this.userRepository.changeSelectedBadge(userId, badgeId);
    this.logger.log(
      'info',
      `${BadgeMessage.CHANGE_USER_BADGE_MESSAGE}-유저 ID:${userId}, 뱃지 ID:${badgeId}`,
    );
  }

  async getAllBadgeProgress(
    req: ReqGetAllBadgeProgressAppDto,
  ): Promise<ResGetAllBadgeProgressAppDto[]> {
    const result = await this.badgeProgressRepository.getAllBadgeProgress(
      req.userId,
    );
    return result.map((item) =>
      plainToClass(ResGetAllBadgeProgressAppDto, item),
    );
  }

  async getAllBadges(): Promise<BadgeEntity[]> {
    const cacheKey = `allBadges`;
    const cachedAllBadges = await this.cacheService.getFromCache<BadgeEntity[]>(
      cacheKey,
    );
    if (cachedAllBadges) {
      return cachedAllBadges;
    }
    const result = await this.badgeAdminRepository.getAllBadges();
    await this.cacheService.setCache(
      cacheKey,
      result,
      cacheConfig(this.configService).cacheTTL,
    );
    return result;
  }

  async putBadgeToUser(req: ReqPutBadgeToUserAppDto): Promise<void> {
    const { userId, badgeId } = req;
    const createdUserBadgeLog =
      await this.userBadgeRepository.createUserBadgeLog(userId, badgeId);
    const userBadgeList = await this.userBadgeRepository.getUserBadgeList(
      userId,
    );

    const filteredBadgeList = userBadgeList.filter(
      (item) => item.badgeId === badgeId,
    );

    if (filteredBadgeList.length > 1) {
      await this.userBadgeRepository.deleteUserBadgeLog(createdUserBadgeLog.id);
      throw new ConflictException(BadgeErrorMessage.ALREADY_EXIST_USER_BADGE);
    }
    await this.cacheService.deleteCache(`userBadgeList:${userId}`);
    this.logger.log(
      'info',
      `${BadgeMessage.PUT_BADGE_SUCCESS_MESSAGE}-유저 ID:${userId},뱃지 ID:${badgeId}`,
    );
  }

  async deleteUserBadge(req: ReqDeleteUserBadgeAppDto): Promise<void> {
    const { userId, badgeId } = req;
    if (badgeId === BadgeConstant.DEFAULT_BADGE_ID)
      throw new BadRequestException(
        BadgeErrorMessage.CANT_DELETE_DEAFULT_BADGE,
      );
    await this.cacheService.deleteCache(`userBadgeList:${userId}`);
    await this.cacheService.deleteCache(`user:${userId}`);
    await this.cacheService.deleteCache(`SPENTtotalPointPages:${userId}`);
    await this.redisService.deleteKeysByPrefix(`userSpentPointsLogs:${userId}`);
    await this.userRepository.changeSelectedBadge(
      userId,
      BadgeConstant.DEFAULT_BADGE_ID,
    );
    await this.userBadgeRepository.deleteUserBadge(badgeId, userId);
    this.logger.log(
      'info',
      `${BadgeMessage.DELETE_USER_BADGE_SUCCESS_MESSAGE}-유저 ID:${userId},뱃지 ID:${badgeId}`,
    );
  }
}
