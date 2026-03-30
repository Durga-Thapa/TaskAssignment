import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';
import { CreateCourseWithEnrollmentDto } from './Dto/createCoursewithEntrollmentDto';
import { RoleGuard } from 'src/common/guard/roleGuard';
import { AddStudentDto } from './Dto/addStudentDto';
import { RemoveStudentsDto } from './Dto/removeStudentDto';

@Controller('course')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  createCourseWithEnrollment(
    @Body() Dto: CreateCourseWithEnrollmentDto,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.createCourseWithEnrollment(Dto, req.user);
  }

  @Post('add-students/:courseId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  addStudents(
    @Body() Dto: AddStudentDto,
    @Param('courseId') courseId: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.addStudent(courseId, Dto, req.user);
  }

  @Post('remove-students/:courseId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  removeStudents(
    @Param('courseId') courseId: string,
    @Body() dto: RemoveStudentsDto,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.removeStudents(courseId, dto, req.user);
  }

  @Get(':courseId/students')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  getStudents(
    @Param('courseId') courseId: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' };
    },
  ) {
    return this.service.getStudents(courseId, req.user);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  getCoursesForStudent(
    @Param('studentId') studentId: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'USER' | 'TEACHER' | 'ADMIN' };
    },
  ) {
    return this.service.getCoursesForStudent(studentId, req.user);
  }
}
