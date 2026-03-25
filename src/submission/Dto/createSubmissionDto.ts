import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}
