import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWorkLogDto {
  @IsDateString()
  date: string;

  @IsUUID()
  workTypeId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  volume: number;

  @IsString()
  @MinLength(1)
  executorName: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
