import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly config: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    const userByUsername = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });

    if (userByUsername || userByEmail) {
      throw new UnprocessableEntityException('Email or username are taken');
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: {
        bio: true,
        username: true,
        email: true,
        id: true,
        image: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('Credentials are not valid');
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnprocessableEntityException('Credentials are not valid');
    }

    delete user.password;
    return user;
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      this.config.get<string>('JWT_SECRET'),
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
}
