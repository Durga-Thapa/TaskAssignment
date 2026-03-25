import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  deadline: number;

  @IsString()
  @IsOptional()
  teacher?: string;
}
