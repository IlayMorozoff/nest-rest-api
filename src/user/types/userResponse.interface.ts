import { UserEntity } from '../entities/user.entity';

export interface UserResponseInterface {
  user: Omit<UserEntity, 'hashPassword'> & { token: string };
}
