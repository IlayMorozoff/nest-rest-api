import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ExpressRequestInterface } from 'src/types/expressRequest.interface';
import { UserEntity } from '../entities/user.entity';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decode = verify(
        token,
        this.config.get<string>('JWT_SECRET'),
      ) as UserEntity;

      const user = await this.userService.findById(decode.id);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}
