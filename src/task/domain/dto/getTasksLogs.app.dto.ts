import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';

export class ReqGetTasksLogsAppDto {
  @ApiProperty({ description: '작업 유저 ID(UUID)' })
  @IsString()
  readonly userId: string;

  @ApiProperty({ description: '작업 유형 ID(INT)' })
  @IsInt()
  readonly taskTypesId: number;
}

export class ResGetTasksLogsAppDto {
  @ApiProperty({ description: '작업 고유 ID(INT)' })
  @IsInt()
  id: number;

  @ApiProperty({ description: '작업 유저 ID(UUID)' })
  @IsString()
  readonly userId: string;

  @ApiProperty({ description: '작업 유형 ID(INT)' })
  @IsInt()
  readonly taskTypesId: number;

  @ApiProperty({ description: '작업 이름' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: '작업 설명' })
  @IsString()
  readonly description: string;

  @ApiProperty({ description: '작업 완료 여부' })
  @IsInt()
  completion: number;

  @ApiProperty({ description: '작업 중요도' })
  @IsInt()
  importance: number;

  @ApiProperty({ description: '작업 생성 시간' })
  @IsDate()
  occurredAt: Date;
}
