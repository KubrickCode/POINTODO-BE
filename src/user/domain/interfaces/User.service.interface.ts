import { ReqGetUserAppDto, ResGetUserAppDto } from '../dto/GetUser.app.dto';
import { ReqRegisterAppDto } from '../dto/Register.app.dto';
import { ReqUpdateUserAppDto } from '../dto/UpdateUser.app.dto';
import { ReqDeleteUserAppDto } from '../dto/DeleteUser.app.dto';
import {
  ReqGetUserListAppDto,
  ResGetUserListAppDto,
} from '../dto/GetUserList.app.dto';
import {
  ReqGetTotalUserListPagesAppDto,
  ResGetTotalUserListPagesAppDto,
} from '../dto/GetTotalUserListPages.app.dto';
import {
  ReqGetTopUsersOnDateAppDto,
  ResGetTopUsersOnDateAppDto,
} from '../dto/GetTopUsersOnDate.app.dto';

export interface IUserService {
  register(user: ReqRegisterAppDto): Promise<void>;

  getUser(req: ReqGetUserAppDto): Promise<ResGetUserAppDto>;

  updateUser(req: ReqUpdateUserAppDto): Promise<void>;

  deleteUser(req: ReqDeleteUserAppDto): Promise<void>;

  getUserList(req: ReqGetUserListAppDto): Promise<ResGetUserListAppDto[]>;

  getTotalUserListPages(
    req: ReqGetTotalUserListPagesAppDto,
  ): Promise<ResGetTotalUserListPagesAppDto>;

  getTopUsersOnDate(
    req: ReqGetTopUsersOnDateAppDto,
  ): Promise<ResGetTopUsersOnDateAppDto[]>;
}
