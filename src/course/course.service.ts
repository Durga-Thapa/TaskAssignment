import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './courseSchema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { IResponse } from 'src/common/interface/responseInterface';
import { CreateCourseWithEnrollmentDto } from './Dto/createCoursewithEntrollmentDto';
import { AddStudentDto } from './Dto/addStudentDto';
import { RemoveStudentsDto } from './Dto/removeStudentDto';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async createCourseWithEnrollment(
    Dto: CreateCourseWithEnrollmentDto,
    user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' },
  ): Promise<IResponse<CourseDocument>> {
    try {
      this.logger.log('trying to create course with enrollment');
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only admin can create course with entrollment',
        );
      }

      const course = new this.courseModel({
        ...Dto,
        instructor: new Types.ObjectId(Dto.instructorId),
        students: Dto.studentId.map((id) => new Types.ObjectId(id)),
      });

      // prevent dublicate enrollment
      const uniqueStudentIds = Dto.studentId
        .map((id) => new Types.ObjectId(id)) // convert to ObjectId
        .filter(
          (id) => !course.students.some((s) => s.equals(id)), // use equals for ObjectId comparison
        );

      course.students.push(...uniqueStudentIds);

      await course.save();

      return {
        statusCode: 201,
        message: 'Course created and entrollment successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create course with enrollment');
      if (error instanceof Error) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create enrollment');
    }
  }

  // add student to an existing course
  async addStudent(
    courseId: string,
    Dto: AddStudentDto,
    user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' },
  ): Promise<IResponse> {
    try {
      this.logger.log('Trying to add student(s)');

      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('Only admin can add students');
      }

      if (!isValidObjectId(courseId)) {
        throw new BadRequestException('Invalid courseId');
      }

      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found');

      // Convert DTO studentId(s) to ObjectId(s)
      const studentObjectIds = Array.isArray(Dto.studentId)
        ? Dto.studentId.map((id) => {
            if (!isValidObjectId(id)) {
              throw new BadRequestException(`Invalid studentId: ${id}`);
            }
            return new Types.ObjectId(id);
          })
        : [new Types.ObjectId(Dto.studentId)];

      // Prevent duplicates
      const newStudents = studentObjectIds.filter(
        (id) => !course.students.some((s) => s.equals(id)),
      );

      if (!newStudents.length) {
        throw new BadRequestException('This student is already enrolled');
      }

      course.students.push(...newStudents);
      await course.save();

      return {
        statusCode: 201,
        message: 'Students added to course successfully',
      };
    } catch (error) {
      this.logger.error('Failed to add students', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add student(s)');
    }
  }

  // remove one or more than students from the course
  async removeStudents(
    courseId: string,
    Dto: RemoveStudentsDto,
    user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' },
  ) {
    try {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('Only admin can remove students');
      }

      if (!isValidObjectId(courseId)) {
        throw new BadRequestException('Invalid courseId');
      }

      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found');

      // Convert to ObjectIds
      const studentObjectIds = Dto.studentIds.map(
        (id) => new Types.ObjectId(id),
      );

      // Filter students that actually exist in course

      const existingStudents = studentObjectIds.filter((id) =>
        course.students.some((s) => s.equals(id)),
      );

      if (!existingStudents.length) {
        throw new BadRequestException('None of the students are enrolled');
      }

      // Remove students
      course.students = course.students.filter(
        (s) => !studentObjectIds.some((id) => id.equals(s)),
      );

      await course.save();

      return {
        statusCode: 200,
        message: 'Student(s) removed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to remove student(s)', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove student(s)');
    }
  }

  // fetch student in courses
  async getStudents(
    courseId: string,
    user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' },
  ) {
    try {
      this.logger.log('trying to fetch student in course');
      if (!['ADMIN', 'INSTRUCTOR'].includes(user.role)) {
        throw new ForbiddenException('Access denied');
      }

      const course = await this.courseModel
        .findById(courseId)
        .populate('students', 'name email');
      if (!course) throw new NotFoundException('Course not found');

      return {
        message: 'Students fetched successfully',
        data: course.students,
      };
    } catch (error) {
      this.logger.error('Failed to fetch students in course');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  // fetch courses for a student
  async getCoursesForStudent(
    studentId: string,
    user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' },
  ) {
    try {
      this.logger.log('trying to fetch courses for a student');
      if (user.role === 'USER' && user._id.toString() !== studentId) {
        throw new ForbiddenException('Cannot view other student courses');
      }
      const courses = await this.courseModel.find({ students: studentId });
      return {
        message: 'Courses fetched successfully',
        data: courses,
      };
    } catch (error) {
      this.logger.error('Failed to fetch courses for a student');
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch courses for a students',
      );
    }
  }
}
