import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from 'src/auth/Dto/register';

export class UpdateUserDto extends PartialType(RegisterDto) {}
