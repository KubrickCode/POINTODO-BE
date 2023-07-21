import {
  Controller,
  UseGuards,
  Inject,
  Body,
  Post,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/auth/passport/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '@infrastructure/auth/passport/guards/admin.guard';
import { IBadgeAdminService } from '@domain/admin/badge/interfaces/badge.admin.service.interface';
import {
  ReqCreateBadgeTypeDto,
  ResCreateBadgeTypeDto,
} from '@interface/dto/admin/badge/createBadgeType.dto';
import {
  ReqUpdateBadgeTypeDto,
  ReqUpdateBadgeTypeParamDto,
  ResUpdateBadgeTypeDto,
} from '@interface/dto/admin/badge/updateBadgeType.dto';
import {
  ReqDeleteBadgeTypeParamDto,
  ResDeleteBadgeTypeDto,
} from '@interface/dto/admin/badge/deleteBadgeType.dto';

@ApiTags('Admin')
@Controller('admin')
export class BadgeAdminController {
  constructor(
    @Inject('IBadgeAdminService')
    private readonly badgeAdminService: IBadgeAdminService,
  ) {}

  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @Post('/badge/create')
  async createBadgeType(
    @Body() body: ReqCreateBadgeTypeDto,
  ): Promise<ResCreateBadgeTypeDto> {
    return await this.badgeAdminService.createBadgeType(body);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @Patch('/badge/update/:id')
  async updateBadgeType(
    @Body() body: ReqUpdateBadgeTypeDto,
    @Param() param: ReqUpdateBadgeTypeParamDto,
  ): Promise<ResUpdateBadgeTypeDto> {
    return await this.badgeAdminService.updateBadgeType({
      ...body,
      id: param.id,
    });
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @Delete('/badge/delete/:id')
  async deleteBadgeType(
    @Param() param: ReqDeleteBadgeTypeParamDto,
  ): Promise<ResDeleteBadgeTypeDto> {
    return await this.badgeAdminService.deleteBadgeType(param.id);
  }
}
