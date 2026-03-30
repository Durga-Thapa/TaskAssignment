import {
  IsMongoId,
  IsNotEmpty,
  ArrayNotEmpty,
  ArrayUnique,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateCourseWithEnrollmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  instructorId: string;

  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  studentId: string[];
}
