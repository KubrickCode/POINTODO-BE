import {
  BadgeType_,
  BadgeTypes,
} from '@admin/badge/domain/entities/badge.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BADGE_ICON_LINK,
  BADGE_DESC,
  BADGE_ID,
  BADGE_NAME,
  BADGE_TYPE,
  BADGE_PRICE,
} from '@shared/constants/badge.constant';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class ReqGetBadgeListParamDto {
  @ApiProperty({ description: BADGE_TYPE })
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  readonly type: BadgeType_;
}

export class ResGetBadgeListDto {
  @ApiProperty({ description: BADGE_ID })
  @IsInt()
  readonly id: number;

  @ApiProperty({ description: BADGE_NAME })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: BADGE_DESC })
  @IsString()
  readonly description: string;

  @ApiProperty({ description: BADGE_ICON_LINK })
  @IsString()
  readonly iconLink: string;

  @ApiProperty({ description: BADGE_TYPE })
  @IsEnum(BadgeTypes)
  readonly type: BadgeType_;

  @ApiProperty({ description: BADGE_PRICE })
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly price?: number;
}
