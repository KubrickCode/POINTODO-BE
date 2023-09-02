import { AdminAuthGuard } from '@auth/infrastructure/passport/guards/admin.guard';
import { JwtAuthGuard } from '@auth/infrastructure/passport/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { adminDocs } from './docs/admin.docs';
import { globalDocs } from '@shared/docs/global.docs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ReqAdminGetUserListQueryDto,
  ResAdminGetUserListDto,
} from './dto/user/getUserList.admin.dto';
import { IUserService } from '@user/domain/interfaces/user.service.interface';
import {
  ReqAdminGetTotalUserListPagesParamDto,
  ResAdminGetTotalUserListPagesDto,
} from './dto/user/getTotalUserListPages.admin.dto';
import {
  ResAdminGetUserBadgeListDto,
  ReqAdminGetUserBadgeListParamDto,
} from './dto/user/getUserBadgeList.admin.dto';
import { IBadgeService } from '@badge/domain/interfaces/badge.service.interface';
import {
  ReqAdminPutBadgeToUserDto,
  ResAdminPutBadgeToUserDto,
} from './dto/user/putBadgeToUser.admin.dto';
import {
  ReqAdminDeleteUserBadgeQueryDto,
  ResAdminDeleteUserBadgeDto,
} from './dto/user/deleteUserBadge.admin.dto';

@ApiTags('Admin - User')
@ApiBearerAuth()
@ApiUnauthorizedResponse(globalDocs.unauthorizedResponse)
@ApiForbiddenResponse(adminDocs.forbidden)
@Controller('/admin/users')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class UserAdminController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject('IBadgeService')
    private readonly badgeService: IBadgeService,
  ) {}

  @Get()
  @HttpCode(200)
  async getUserList(
    @Query() query: ReqAdminGetUserListQueryDto,
  ): Promise<ResAdminGetUserListDto[]> {
    const { offset, limit, order, provider } = query;
    return await this.userService.getUserList({
      order,
      offset,
      limit,
      provider,
    });
  }

  @Get('/count/:provider')
  @HttpCode(200)
  async getTotalUserListPages(
    @Param() param: ReqAdminGetTotalUserListPagesParamDto,
  ): Promise<ResAdminGetTotalUserListPagesDto> {
    const { provider } = param;
    return await this.userService.getTotalUserListPages({ provider });
  }

  @Get('/badges/list/:id')
  @HttpCode(200)
  async getUserBadgeList(
    @Param() param: ReqAdminGetUserBadgeListParamDto,
  ): Promise<ResAdminGetUserBadgeListDto[]> {
    const { id } = param;
    return await this.badgeService.getUserBadgeListWithName({ userId: id });
  }

  @Put('/badges/put')
  @HttpCode(201)
  async putBadgeToUser(
    @Body() body: ReqAdminPutBadgeToUserDto,
  ): Promise<ResAdminPutBadgeToUserDto> {
    const { userId, badgeId } = body;
    return await this.badgeService.putBadgeToUser({ userId, badgeId });
  }

  @Delete('/badges')
  @HttpCode(200)
  async deleteUserBadge(
    @Query() query: ReqAdminDeleteUserBadgeQueryDto,
  ): Promise<ResAdminDeleteUserBadgeDto> {
    const { userId, badgeId } = query;
    return await this.badgeService.deleteUserBadge({ userId, badgeId });
  }
}
