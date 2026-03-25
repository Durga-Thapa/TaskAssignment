import { IsEmail, IsString, Matches } from 'class-validator';

export class RequestPasswordDto {
  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Email must contain "need@"',
  })
  email: string;
}
