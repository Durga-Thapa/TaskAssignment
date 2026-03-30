import { IsMongoId, IsString } from 'class-validator';

export class EnrollStudentDto {
  @IsMongoId()
  @IsString()
  studentId: string;
}
