import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/service/prisma.service';
import {
  EarnedPointsLogEntity,
  EarnedPointsLogWithTaskName,
  TopOfUserOnDate,
} from '@point/domain/entities/earnedPointsLog.entity';
import { IPointRepository } from 'src/point/domain/interfaces/point.repository.interface';
import {
  SpentPointsLogEntity,
  SpentPointsLogWithBadgeName,
} from '@point/domain/entities/spentPointsLog.entity';
import { IHandleDateTime } from '@shared/interfaces/IHandleDateTime';
import { plainToClass } from 'class-transformer';
import { UUID } from 'crypto';
import { IHANDLE_DATE_TIME } from '@shared/constants/provider.constant';

@Injectable()
export class PointRepository implements IPointRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IHANDLE_DATE_TIME)
    private readonly handleDateTime: IHandleDateTime,
  ) {}

  async getEarnedPointsLogs(
    userId: UUID,
    limit: number,
    offset: number,
    order: string,
  ): Promise<EarnedPointsLogWithTaskName[]> {
    const result = await this.prisma.earnedPointsLogs.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        taskId: true,
        points: true,
        occurredAt: true,
        taskLog: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        occurredAt: order === 'newest' ? 'desc' : 'asc',
      },
      take: limit,
      skip: offset,
    });

    return result.map((item) =>
      plainToClass(EarnedPointsLogWithTaskName, {
        id: item.id,
        taskId: item.taskId,
        userId: item.userId,
        points: item.points,
        occurredAt: item.occurredAt,
        taskName: item.taskLog.name,
      }),
    );
  }

  async getSpentPointsLogs(
    userId: UUID,
    limit: number,
    offset: number,
    order: string,
  ): Promise<SpentPointsLogWithBadgeName[]> {
    const result = await this.prisma.spentPointsLogs.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        badgeLogId: true,
        userId: true,
        points: true,
        occurredAt: true,
        badgeLog: {
          select: {
            badge: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        occurredAt: order === 'newest' ? 'desc' : 'asc',
      },
      take: limit,
      skip: offset,
    });

    return result.map((item) =>
      plainToClass(SpentPointsLogWithBadgeName, {
        id: item.id,
        badgeLogId: item.badgeLogId,
        userId: item.userId,
        points: item.points,
        occurredAt: item.occurredAt,
        badgeName: item.badgeLog.badge.name,
      }),
    );
  }

  async getTotalPointPages(
    userId: UUID,
    transactionType: 'EARNED' | 'SPENT',
  ): Promise<number> {
    if (transactionType === 'EARNED') {
      return await this.prisma.earnedPointsLogs.count({
        where: {
          userId,
        },
      });
    }
    if (transactionType === 'SPENT') {
      return await this.prisma.spentPointsLogs.count({
        where: { userId },
      });
    }
  }

  async isContinuous(userId: string): Promise<boolean> {
    const count = await this.prisma.earnedPointsLogs.count({
      where: {
        userId,
        occurredAt: {
          gte: new Date(this.handleDateTime.getYesterday()),
          lt: new Date(this.handleDateTime.getToday()),
        },
      },
    });

    return count > 0;
  }

  async createEarnedPointLog(
    taskId: number,
    userId: UUID,
    points: number,
  ): Promise<EarnedPointsLogEntity> {
    const result = await this.prisma.earnedPointsLogs.create({
      data: { taskId, userId, points },
    });
    return plainToClass(EarnedPointsLogEntity, result);
  }

  async createSpentPointLog(
    badgeLogId: number,
    userId: UUID,
    points: number,
  ): Promise<SpentPointsLogEntity> {
    const result = await this.prisma.spentPointsLogs.create({
      data: { badgeLogId, userId, points },
    });
    return plainToClass(SpentPointsLogEntity, result);
  }

  async countTasksPerDate(userId: string, date: string): Promise<number> {
    return await this.prisma.earnedPointsLogs.count({
      where: {
        userId,
        occurredAt: {
          gte: new Date(date),
        },
      },
    });
  }

  async calculateUserPoints(userId: UUID): Promise<number> {
    const totalEarnedPoints = await this.prisma.earnedPointsLogs.aggregate({
      _sum: {
        points: true,
      },
      where: {
        userId,
      },
    });

    const totalSpentPoints = await this.prisma.spentPointsLogs.aggregate({
      _sum: {
        points: true,
      },
      where: {
        userId,
      },
    });

    const userTotalPoints =
      (totalEarnedPoints._sum.points || 0) -
      (totalSpentPoints._sum.points || 0);

    return userTotalPoints;
  }

  async deleteEarnedPointLog(id: number): Promise<EarnedPointsLogEntity> {
    const result = await this.prisma.earnedPointsLogs.delete({ where: { id } });
    return plainToClass(EarnedPointsLogEntity, result);
  }

  async deleteSpentPointLog(id: number): Promise<SpentPointsLogEntity> {
    const result = await this.prisma.spentPointsLogs.delete({ where: { id } });
    return plainToClass(SpentPointsLogEntity, result);
  }

  async getTopUserOnDate(
    startDate: string,
    endDate: string,
  ): Promise<TopOfUserOnDate[]> {
    const topUsers = await this.prisma.earnedPointsLogs.groupBy({
      by: ['userId'],
      where: {
        occurredAt: {
          gte: new Date(startDate),
          lt: new Date(endDate),
        },
      },
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 10,
    });

    const topUsersWithEmail = await this.prisma.user.findMany({
      where: {
        id: {
          in: topUsers.map((user) => user.userId),
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const result = topUsers.map((user) =>
      plainToClass(TopOfUserOnDate, {
        userId: user.userId,
        email: topUsersWithEmail.find((u) => u.id === user.userId).email,
        points: user._sum.points,
      }),
    );

    return result;
  }
}
