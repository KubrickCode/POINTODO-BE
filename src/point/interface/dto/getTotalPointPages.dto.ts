import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { TOTAL_PAGE } from '@shared/constants/task.constant';
import { POINT_TRANSACTION_TYPE } from '@shared/constants/point.constant';

export class ReqGetTotalPointPagesParamDto {
  @ApiProperty({ description: POINT_TRANSACTION_TYPE })
  @IsString()
  readonly transactionType: string;
}

export class ResGetTotalPointPagesDto {
  @ApiProperty({ description: TOTAL_PAGE })
  @IsInt()
  readonly totalPages: number;
}
