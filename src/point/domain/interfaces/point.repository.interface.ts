import {
  EarnedPointEntity,
  EarnedPointWithTaskName,
} from '../entities/earnedPoint.entity';
import {
  SpentPointEntity,
  SpentPointWithBadgeName,
} from '../entities/spentPoint.entity';

export interface IPointRepository {
  getEarnedPointsLogs(
    userId: string,
    limit: number,
    offset: number,
    order: string,
  ): Promise<EarnedPointWithTaskName[]>;

  getSpentPointsLogs(
    userId: string,
    limit: number,
    offset: number,
    order: string,
  ): Promise<SpentPointWithBadgeName[]>;

  getTotalPointPages(
    userId: string,
    transactionType: 'EARNED' | 'SPENT',
  ): Promise<number>;

  isContinuous(userId: string): Promise<boolean>;

  createEarnedPointLog(
    taskId: number,
    points: number,
  ): Promise<EarnedPointEntity>;

  createSpentPointLog(
    badgeLogId: number,
    points: number,
  ): Promise<SpentPointEntity>;

  countTasksPerDate(userId: string, date: string): Promise<number>;

  calculateUserPoints(userId: string): Promise<number>;

  deleteEarnedPointLog(id: number): Promise<EarnedPointEntity>;

  deleteSpentPointLog(id: number): Promise<SpentPointEntity>;
}
