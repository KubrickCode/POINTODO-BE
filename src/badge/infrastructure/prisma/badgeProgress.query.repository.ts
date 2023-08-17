import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/service/prisma.service';
import { BadgeProgressEntity } from '@badge/domain/entities/badgeProgress.entity';
import { IBadgeProgressRepository } from '@badge/domain/interfaces/badgeProgress.repository.interface';
import { BadgeProgress } from '@prisma/client';

@Injectable()
export class BadgeProgressRepository implements IBadgeProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBadgeProgress(
    userId: string,
  ): Promise<Array<Pick<BadgeProgressEntity, 'badgeId' | 'progress'>>> {
    const query = `
    SELECT "badgeId", progress FROM "BadgeProgress"
    WHERE "userId" = $1::uuid
    `;
    const values = [userId];
    const badgeProgressList = await this.prisma.$queryRawUnsafe<
      Array<Pick<BadgeProgress, 'badgeId' | 'progress'>>
    >(query, ...values);
    return badgeProgressList;
  }

  async updateConsistency(
    userId: string,
    isContinuous: boolean,
    badgeId: number,
  ): Promise<number> {
    const consistencyQuery = `
        INSERT INTO "BadgeProgress"("userId", "badgeId", progress)
        VALUES ($1::uuid, $2, 1)
        ON CONFLICT ("userId", "badgeId")
        DO UPDATE 
        SET progress = ${isContinuous ? '"BadgeProgress".progress + 1' : '1'}
        RETURNING progress
      `;

    const consistencyValues = [userId, badgeId];

    const updatedBadgeProgress =
      await this.prisma.$queryRawUnsafe<BadgeProgress>(
        consistencyQuery,
        ...consistencyValues,
      );

    return updatedBadgeProgress[0].progress;
  }

  async updateDiversity(userId: string, badgeId: number): Promise<number> {
    const diversityQuery = `
        INSERT INTO "BadgeProgress"("userId", "badgeId", progress)
        VALUES ($1::uuid, $2, 1)
        ON CONFLICT ("userId", "badgeId")
        DO UPDATE
        SET progress = "BadgeProgress".progress + 1
        RETURNING progress
      `;

    const diversityValues = [userId, badgeId];

    const updatedBadgeProgress =
      await this.prisma.$queryRawUnsafe<BadgeProgress>(
        diversityQuery,
        ...diversityValues,
      );

    return updatedBadgeProgress[0].progress;
  }

  async updateProductivity(
    progress: number,
    userId: string,
    badgeId: number,
  ): Promise<number> {
    const productivityQuery = `
        INSERT INTO "BadgeProgress"("userId", "badgeId", progress)
        VALUES ($2::uuid, $3, 1)
        ON CONFLICT ("userId", "badgeId")
        DO UPDATE
        SET progress = $1
        RETURNING progress
      `;

    const productivityValues = [progress, userId, badgeId];
    const updatedBadgeProgress = await this.prisma.$queryRawUnsafe<any>(
      productivityQuery,
      ...productivityValues,
    );

    return updatedBadgeProgress[0].progress;
  }
}
