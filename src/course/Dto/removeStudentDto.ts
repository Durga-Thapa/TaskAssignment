import { IsMongoId, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class RemoveStudentsDto {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  studentIds: string[];
}
