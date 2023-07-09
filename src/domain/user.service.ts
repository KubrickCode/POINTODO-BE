import { IUserRepository } from './user/interfaces/iuser.repository';
import { UserEntity } from './user/entities/user.entity';
import { IPasswordHasher } from './user/interfaces/ipasswordHasher';
import { ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DomainRegisterDto } from './user/dto/register.dto';

export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async createUser(newUser: DomainRegisterDto): Promise<UserEntity> {
    const { email, password } = newUser;
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 계정입니다.');
    }

    const hashedPassword = await this.passwordHasher.hashPassword(password);

    const user = {
      email,
      password: hashedPassword,
    };
    return await this.userRepository.createUser(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findByEmail(email);
  }
}
