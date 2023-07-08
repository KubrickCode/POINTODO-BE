import { IsEmail, IsString, Matches } from 'class-validator';

class ReqRegisterDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,20}$/)
  readonly password: string;
}

class ResRegisterDto {
  @IsString()
  readonly message: string;
}

export { ReqRegisterDto, ResRegisterDto };
