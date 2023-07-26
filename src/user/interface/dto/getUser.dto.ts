import { ApiProperty } from '@nestjs/swagger';
import { Provider, Role } from '@prisma/client';
import { IsDate, IsEnum, IsInt, IsString } from 'class-validator';

export class ResGetUserDto {
  @ApiProperty({ description: '유저 고유 ID(UUID)' })
  @IsString()
  readonly id: string;

  @ApiProperty({ example: 'test@gmail.com', description: '이메일' })
  @IsString()
  readonly email: string;

  @ApiProperty({ example: 'LOCAL | GOOGLE | KAKAO', description: '공급 업체' })
  @IsEnum(Provider)
  readonly provider: Provider;

  @ApiProperty({ example: 'USER | ADMIN', description: '권한' })
  @IsEnum(Role)
  readonly role: Role;

  @ApiProperty({ description: '뱃지ID' })
  @IsInt()
  readonly defaultBadgeId: number;

  @IsDate()
  @ApiProperty({ description: '가입 날짜' })
  readonly createdAt: Date;
}
