import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './Dto/register';
import { LoginDto } from './Dto/loginDto';
import { ChangePasswordDto } from './Dto/changePasswordDto';
import { RequestPasswordDto } from './Dto/requestPasswordDto';
import { ResetPasswordDto } from './Dto/resetPasswordDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() Dto: RegisterDto) {
    return this.authService.register(Dto);
  }

  @Post('login')
  login(@Body() Dto: LoginDto) {
    return this.authService.login(Dto);
  }

  @Post('change-password')
  changePassword(@Body() Dto: ChangePasswordDto) {
    return this.authService.changePassword(Dto);
  }

  @Post('forget-Password')
  requestReset(@Body() Dto: RequestPasswordDto) {
    return this.authService.requestPasswordReset(Dto.email);
  }

  @Post('reset-password')
  reset(@Body() Dto: ResetPasswordDto) {
    return this.authService.resetPassword(Dto);
  }
}
