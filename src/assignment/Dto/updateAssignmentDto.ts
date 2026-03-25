import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  deadline?: number;

  @IsString()
  @IsOptional()
  teacher?: string;
}
