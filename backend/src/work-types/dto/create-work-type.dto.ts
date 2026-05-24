import { IsString, MinLength } from 'class-validator';

export class CreateWorkTypeDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  unit: string;
}
