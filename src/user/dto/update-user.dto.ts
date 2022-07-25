import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly username: string;

  @IsString()
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly bio: string;

  @IsString()
  @IsOptional()
  readonly image: string;
}
