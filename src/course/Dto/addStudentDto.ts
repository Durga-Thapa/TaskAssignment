import {
  ArrayNotEmpty,
  ArrayUnique,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';

export class AddStudentDto {
  @IsNotEmpty()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  studentId: string[];
}
