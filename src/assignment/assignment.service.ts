import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Assignment, AssignmentDocument } from './assignmentSchema';
import { Model, Types } from 'mongoose';
import { CreateAssignmentDto } from './Dto/createAssignmentDto';
import { IResponse } from 'src/common/interface/responseInterface';
import { UpdateAssignmentDto } from './Dto/updateAssignmentDto';
import { Pagination } from 'src/common/utils/paginationUtils';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
  ) {}

  // create Assignment
  async create(
    Dto: CreateAssignmentDto,
    user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ): Promise<IResponse<AssignmentDocument>> {
    try {
      this.logger.log('Trying to create assignment');

      // Check role
      if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
        throw new ForbiddenException('Not allowed');
      }

      let teacherId: string;

      if (user.role === 'TEACHER') {
        teacherId = user._id;
      } else {
        if (!Dto.teacher) {
          throw new BadRequestException('Teacher is required for admin');
        }
        teacherId = Dto.teacher;
      }

      const assignment = await this.assignmentModel.create({
        ...Dto,
        teacher: new Types.ObjectId(teacherId), // assign the current user as teacher
        deadline: new Date(Dto.deadline),
      });

      return {
        statusCode: 201,
        message: 'Assignment created successfully',
        data: assignment,
      };
    } catch (error) {
      this.logger.error('Failed to create assignment', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create assignment');
    }
  }

  //update Assignment
  async update(
    Dto: UpdateAssignmentDto,
    assignmentId: string,
    user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ): Promise<IResponse<AssignmentDocument>> {
    try {
      this.logger.log('trying to update assignment');

      const assignment = await this.assignmentModel.findById(
        new Types.ObjectId(assignmentId),
      );
      if (!assignment) {
        throw new BadRequestException('Assignment not found');
      }

      if (user.role === 'USER') {
        throw new ForbiddenException('Student cannot update assignments');
      }

      if (
        user.role === 'TEACHER' &&
        assignment.teacher.toString() !== user._id
      ) {
        throw new ForbiddenException('Not allowed to update this assignment');
      }

      if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
        throw new ForbiddenException('Not allowed to update assignments');
      }

      let teacherId: string;

      if (user.role === 'TEACHER') {
        teacherId = user._id;
      } else if (user.role === 'ADMIN') {
        if (!Dto.teacher) {
          throw new BadRequestException('Teacher is required');
        }
        teacherId = Dto.teacher;
      } else {
        throw new ForbiddenException('Not allowed');
      }

      assignment.set({
        ...Dto,
        teacher: teacherId ? new Types.ObjectId(teacherId) : assignment.teacher,
        deadline: Dto.deadline ? new Date(Dto.deadline) : assignment.deadline,
      });

      await assignment.save();

      return {
        statusCode: 200,
        message: 'Assignment updated successfully',
        data: assignment,
      };
    } catch (error) {
      this.logger.error('Failed to update assignment');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update assignment');
    }
  }

  // get all assignment
  async get(page = 1, limit = 10): Promise<IResponse> {
    try {
      this.logger.log('trying to fetch all assignments');
      const filter = {};
      const sort: Record<string, 1 | -1> = { createdAt: -1 };

      const result = await Pagination(
        this.assignmentModel,
        { page, limit },
        sort,
        filter,
      );

      if (!result.data || result.data.length === 0) {
        throw new NotFoundException('No assignment found');
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

  //delete
  async remove(
    assignmentId: string,
    user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ): Promise<IResponse<AssignmentDocument>> {
    try {
      this.logger.log('trying to delete assignment');
      const assignment = await this.assignmentModel.findById(
        new Types.ObjectId(assignmentId),
      );
      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      if (user.role === 'USER') {
        throw new ForbiddenException('Student cannot delete assignment');
      }

      if (
        user.role === 'TEACHER' &&
        assignment.teacher.toString() !== user._id
      ) {
        throw new ForbiddenException('Not allowed to delete this assignment');
      }
      await assignment.deleteOne();

      return {
        statusCode: 200,
        message: 'Assignment deleted successfully',
        data: assignment,
      };
    } catch (error) {
      this.logger.error('trying to delete assignments');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete assignment ');
    }
  }
}
