import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission, SubmissionDocument } from './submissionSchema';
import { Model } from 'mongoose';
import { CreateSubmissionDto } from './Dto/createSubmissionDto';
import { IResponse } from 'src/common/interface/responseInterface';
import { Status } from 'src/common/roleEnum';
import * as fs from 'fs';
import path from 'path';
import { Pagination } from 'src/common/utils/paginationUtils';
import { Document, Types } from 'mongoose';
import { GradeSubmissionDto } from './Dto/gradeSubmissionDto';
import { AssignmentDocument } from 'src/assignment/assignmentSchema';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  // create submission
  async createSubmission(
    Dto: CreateSubmissionDto,
    user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
    file?: Express.Multer.File,
  ): Promise<IResponse> {
    try {
      this.logger.log('trying to create submission');

      if (user.role !== 'USER') {
        throw new ForbiddenException(
          'Only student allowed to submit the assignments',
        );
      }

      if (!file) {
        throw new BadRequestException('File is required');
      }

      const allowedMimeTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
      ];

      const allowedEx = ['.pdf', '.png', '.jpg', '.jpeg', ',gif'];

      const ext = path.extname(file.originalname).toLowerCase();

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only PDF and image files are allowed');
      }

      if (!allowedEx.includes(ext)) {
        throw new BadRequestException('Invalid file type');
      }

      let folder = 'others';
      if (ext === '.pdf') folder = 'pdfs';
      else if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext))
        folder = 'images';

      const uploadDir = path.join(process.cwd(), 'uploads', folder);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `./uploads/${folder}/${uniqueFilename}`;

      const submission = new this.submissionModel({
        assignment: new Types.ObjectId(Dto.assignmentId),
        student: new Types.ObjectId(user._id),
        fileUrl,
        status: Status.SUBMITTED,
      });

      const savedSubmission = await submission.save();

      return {
        statusCode: 200,
        message: 'Assignment submitted successfully',
        data: savedSubmission,
      };
    } catch (error) {
      this.logger.error('Failed to create submission', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create submission');
    }
  }

  //get submission
  async getSubmissionByAssignment(page = 1, limit = 10): Promise<IResponse> {
    try {
      this.logger.log('trying to fetch submission');
      this.logger.log('trying to fetch all submitted assignments');
      const filter = {};
      const sort: Record<string, 1 | -1> = { createdAt: -1 };

      const result = await Pagination(
        this.submissionModel,
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
      this.logger.error('Failed to fetch the submitted assignment ');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch the submitted assignment',
      );
    }
  }

  // get by id
  async findOne(id: string): Promise<IResponse<Submission>> {
    try {
      this.logger.log('fetching single user submission');

      const submitted = await this.submissionModel.findById(id).lean().exec();

      if (!submitted) {
        this.logger.warn(`Testimonial not found: ${id}`);
        throw new NotFoundException('Testimonial not found');
      }

      return {
        statusCode: 201,
        message: 'Fetched successfull',
        data: submitted,
      };
    } catch (error) {
      this.logger.error(`Error fetching testimonial ${id}`, error);
      throw error;
    }
  }

  // grade Submission
  async gradeSubmission(
    id: string,
    Dto: GradeSubmissionDto,
    user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' },
  ) {
    try {
      this.logger.log('Trying to grade submission');
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only teacher and admin are allowed to grade',
        );
      }

      const submission = await this.submissionModel
        .findById(id)
        .populate<{ assignment: AssignmentDocument }>('assignment')
        .exec();

      if (!submission) {
        throw new NotFoundException('Submission not found ');
      }

      if (
        user.role === 'TEACHER' &&
        submission.assignment.teacher.toString() !== user._id
      ) {
        throw new ForbiddenException('Not allowed to grade this submission');
      }

      submission.grade = Dto.grade;
      submission.feedback = Dto.feedback ?? submission.feedback;

      await submission.save();

      return {
        message: 'Grade submitted successfully',
        data: submission,
      };
    } catch (error) {
      this.logger.error('Failed to grade submission');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to grade submission');
    }
  }

  // student view own submission
  async mySubmission(
    id: string,
    user: { _id: string; role: 'USER' },
  ): Promise<IResponse> {
    try {
      this.logger.log('trying to fetching user submission');

      if (user.role !== 'USER') {
        throw new ForbiddenException('Only user allowed to fetch');
      }
      const submission = await this.submissionModel
        .findById(id)
        .populate('assignment')
        .exec();

      if (!submission) {
        throw new NotFoundException('Submission not found ');
      }

      if (submission.student.toString() !== user._id) {
        throw new ForbiddenException('Access denied');
      }

      return {
        statusCode: 201,
        message: 'Your data fetched successfully',
        data: submission,
      };
    } catch (error) {
      this.logger.error('Failed to fetch  submission');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch submission');
    }
  }
}
