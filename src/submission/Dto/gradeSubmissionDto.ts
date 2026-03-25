import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GradeSubmissionDto {
  @IsNumber()
  grade: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
