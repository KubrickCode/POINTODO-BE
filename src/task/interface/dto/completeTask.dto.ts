import { ApiProperty } from '@nestjs/swagger';
import { COMPLETE_TASK_CONFLICT } from '@shared/messages/task/task.errors';
import { COMPLETE_TASK_SUCCESS_MESSAGE } from '@shared/messages/task/task.message';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class ReqCompleteTaskParamDto {
  @ApiProperty({ description: '작업 고유 ID(INT)' })
  @Type(() => Number)
  @IsInt()
  readonly id: number;
}

export class ResCompleteTaskDto {
  @ApiProperty({
    example: COMPLETE_TASK_SUCCESS_MESSAGE,
    description: '성공 메시지',
  })
  @IsString()
  readonly message: string;
}

export class ResCompleteTaskConflictError {
  @ApiProperty({ example: 409, description: '에러 상태 코드' })
  @IsString()
  readonly statusCode: number;

  @ApiProperty({
    example: COMPLETE_TASK_CONFLICT,
    description: '에러 메시지',
  })
  @IsString()
  readonly message: string[];

  @ApiProperty({ example: '/api/task/complete/:id', description: '요청 경로' })
  @IsString()
  readonly path: string;
}
