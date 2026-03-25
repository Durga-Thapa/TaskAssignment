import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/userSchema';
import { RegisterDto } from './Dto/register';
import { IResponse } from 'src/common/interface/responseInterface';
import { comparedPassword, hashPassword } from 'src/common/utils/passwordUtils';
import { LoginDto } from './Dto/loginDto';
import { JwtPayload } from 'src/common/interface/jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './Dto/changePasswordDto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './Dto/resetPasswordDto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModule: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  //Register
  async register(Dto: RegisterDto): Promise<IResponse<any>> {
    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('Password does not match');
    }
    const { name, password, email, role } = Dto;
    try {
      this.logger.log('Attempting to register');
      const existingUser = await this.userModule.findOne({ email: Dto.email });

      if (existingUser) {
        this.logger.log('Email is already registered');
        throw new ConflictException('Email is already registered');
      }

      const hashedPassword = await hashPassword(password);

      const user = await this.userModule.create({
        name,
        email,
        role,
        password: hashedPassword,
      });

      return {
        message: 'User registered successfully',
        statusCode: HttpStatus.CREATED,
        data: { id: user._id.toString(), email: user.email },
      };
    } catch (error) {
      this.logger.error(`Registration Failed | email=${email}`);

      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Registration Failed');
    }
  }

  //login
  async login(Dto: LoginDto) {
    const { password, email } = Dto;
    try {
      this.logger.log('Attempting to login');
      const user = await this.userModule.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await comparedPassword(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const accesToken: string = this.jwtService.sign(payload);

      return {
        message: 'login successfully',
        access_token: accesToken,
      };
    } catch (error) {
      this.logger.error(`login failed | email:${email}`, error as Error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('login failed');
    }
  }

  // change password with old password
  async changePassword(Dto: ChangePasswordDto) {
    const { email, oldPassword, newPassword } = Dto;
    try {
      this.logger.log('Trying to change the password');
      if (!email || !oldPassword || !newPassword) {
        throw new BadRequestException('All fields are required');
      }

      const user = await this.userModule.findOne({ email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await comparedPassword(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('old password is inCorrect');
      }

      const hashedPassword = await hashPassword(newPassword);
      await this.userModule.findOneAndUpdate(
        { email },
        { password: hashedPassword },
      );
      return { message: 'password changed successfully' };
    } catch (error) {
      this.logger.error('Failed to change the password');

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Password change failed');
    }
  }

  // request password reset token
  async requestPasswordReset(email: string) {
    try {
      this.logger.log('Tryint to reset password');
      const user = await this.userModule.findOneAndUpdate({ email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const token = randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600 * 1000);

      await this.userModule.findOneAndUpdate(
        { email },
        { passwordResetToken: token, passwordResetTokenExpires: expiry },
      );

      // send reset link
      const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
      console.log(resetLink);

      return { message: 'pasword reset link sent to your email' };
    } catch (error) {
      this.logger.error(`User not found`, error);
      throw new InternalServerErrorException('User not found');
    }
  }

  //Reset Password using token
  async resetPassword(Dto: ResetPasswordDto): Promise<IResponse> {
    try {
      const user = await this.userModule.findOne({
        passwordResetToken: Dto.token,
        passwordResetTokenExpires: { $gte: new Date() },
      });
      if (!user) {
        throw new BadRequestException('Invalid or expired token');
      }

      const hashedPassword = await hashPassword(Dto.newPassword);

      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetTokenExpires = null;
      await user.save();

      return {
        statusCode: 201,
        message: 'Password change successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('password reset failed', error);
      throw new InternalServerErrorException('password reset failed ');
    }
  }
}
