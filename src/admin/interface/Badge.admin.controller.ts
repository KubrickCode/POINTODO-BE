import {
  Controller,
  UseGuards,
  Inject,
  Body,
  Post,
  Param,
  Delete,
  Patch,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/infrastructure/passport/guards/Jwt.guard';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '@auth/infrastructure/passport/guards/Admin.guard';
import { IBadgeAdminService } from '@admin/badge/domain/interfaces/Badge.admin.service.interface';
import { ReqAdminCreateBadgeDto } from '@admin/interface/dto/badge/CreateBadge.admin.dto';
import {
  ReqAdminUpdateBadgeDto,
  ReqAdminUpdateBadgeParamDto,
} from '@admin/interface/dto/badge/UpdateBadge.admin.dto';
import { ReqAdminDeleteBadgeParamDto } from '@admin/interface/dto/badge/DeleteBadge.admin.dto';
import { globalDocs } from '@shared/docs/Global.docs';
import { createBadgeDocs } from '@admin/interface/docs/badge/CreateBadge.admin.docs';
import { updateBadgeDocs } from '@admin/interface/docs/badge/UpdateBadge.admin.docs';
import { deleteBadgeDocs } from '@admin/interface/docs/badge/DeleteBadge.admin.docs';
import { adminDocs } from '@admin/interface/docs/Admin.docs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { uploadFileDocs } from './docs/badge/UploadFile.admin.docs';
import { ResAdminUploadFileDto } from './dto/badge/UploadFile.admin.dto';
import { ProviderConstant } from '@shared/constants/Provider.constant';

@Controller('/admin/badges')
@ApiTags('Admin - Badge')
@ApiCookieAuth('accessToken')
@ApiForbiddenResponse(adminDocs.forbidden)
@ApiUnauthorizedResponse(globalDocs.unauthorizedResponse)
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class BadgeAdminController {
  constructor(
    @Inject(ProviderConstant.IBADGE_ADMIN_SERVICE)
    private readonly badgeAdminService: IBadgeAdminService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(createBadgeDocs.operation)
  @ApiCreatedResponse(createBadgeDocs.createdResponse)
  @ApiBadRequestResponse(globalDocs.invalidationResponse)
  @ApiConflictResponse(createBadgeDocs.conflict)
  async createBadge(
    @Res() res: Response,
    @Body() body: ReqAdminCreateBadgeDto,
  ): Promise<void> {
    const { id } = await this.badgeAdminService.createBadge(body);
    res.header('Location', String(id));
    res.send();
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation(updateBadgeDocs.operation)
  @ApiNoContentResponse(updateBadgeDocs.noContentResponse)
  @ApiBadRequestResponse(globalDocs.invalidationResponse)
  @ApiConflictResponse(updateBadgeDocs.conflict)
  async updateBadge(
    @Body() body: ReqAdminUpdateBadgeDto,
    @Param() param: ReqAdminUpdateBadgeParamDto,
  ): Promise<void> {
    await this.badgeAdminService.updateBadge({
      ...body,
      id: param.id,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation(deleteBadgeDocs.operation)
  @ApiNoContentResponse(deleteBadgeDocs.noContentResponse)
  async deleteBadge(
    @Param() param: ReqAdminDeleteBadgeParamDto,
  ): Promise<void> {
    await this.badgeAdminService.deleteBadge({ id: param.id });
  }

  @Post('upload-image')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(uploadFileDocs.operation)
  @ApiCreatedResponse(uploadFileDocs.createdResponse)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<ResAdminUploadFileDto> {
    return await this.badgeAdminService.uploadFile({ file });
  }
}
