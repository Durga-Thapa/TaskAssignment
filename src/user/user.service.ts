import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './userSchema';
import { Model } from 'mongoose';
import { IResponse } from 'src/common/interface/responseInterface';
import { Pagination } from 'src/common/utils/paginationUtils';
import { UpdateUserDto } from './Dto/updateUserDto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@InjectModel(User.name) private UseModel: Model<UserDocument>) {}

  //get
  async get(page = 1, limit = 10): Promise<IResponse> {
    try {
      this.logger.log('Fetching all user');
      const filter = {}; // fetch all users
      const sort: Record<string, 1 | -1> = { createdAt: -1 }; // newest first

      const result = await Pagination(
        this.UseModel,
        { page, limit },
        sort,
        filter,
      );

      if (!result.data || result.data.length === 0) {
        throw new NotFoundException('No users found');
      }

      return {
        statusCode: 200,
        message: 'User Fetched successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error Fetching');
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('failed to fetching');
    }
  }

  // get own profile
  async getMyProfile(userId: string): Promise<IResponse> {
    try {
      this.logger.log('trying to fetch own data');
      const user = await this.UseModel.findById(userId).select('-password');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        statusCode: 200,
        message: 'Fetch data Successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('Failed to fetch data');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch data ');
    }
  }

  // get assigned students
  async getMyStudents(
    teacherId: string,
    page = 1,
    limit = 10,
  ): Promise<IResponse> {
    try {
      this.logger.log('trying to fetch students');

      const filter = { role: 'user', teacher: teacherId };
      const populate = [];

      const result = await Pagination(
        this.UseModel,
        { page, limit },
        { createdAt: -1 },
        filter,
        populate,
      );

      return {
        statusCode: 200,
        message: 'Students fetch successfully ',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to fetch students');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  // delete user
  async remove(
    id: string,
    users: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ): Promise<IResponse> {
    try {
      this.logger.log('tryiing to delete users ');

      if (users.role !== 'ADMIN') {
        throw new ForbiddenException('Only admin can delete users and teacher');
      }
      const user = await this.UseModel.findByIdAndDelete(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        statusCode: 200,
        message: 'User deleted successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('Failed to delete user');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  //update user (only admin allowed)
  async updateUser(
    id: string,
    Dto: UpdateUserDto,
    users: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ): Promise<IResponse> {
    try {
      this.logger.log('trying to update user ');

      const user = await this.UseModel.findByIdAndUpdate(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (users.role !== 'ADMIN') {
        if (users._id !== id) {
          throw new ForbiddenException('You can only update your own profile');
        }
      }
      const updatedUser = await this.UseModel.findByIdAndUpdate(
        { ...Dto },
        { new: true },
      );

      return {
        statusCode: 200,
        message: 'Users deleted successfully',
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error('Failed to delete users');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete users ');
    }
  }
}
