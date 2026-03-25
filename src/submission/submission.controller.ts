import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guard/roleGuard';
import { Roles } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';
import { CreateSubmissionDto } from './Dto/createSubmissionDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GradeSubmissionDto } from './Dto/gradeSubmissionDto';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly service: SubmissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @UseInterceptors(FileInterceptor('submission'))
  create(
    @Body() Dto: CreateSubmissionDto,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.createSubmission(Dto, req.user, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  getAllSubmittedAssignment() {
    return this.service.getSubmissionByAssignment();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  get(@Param() id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/grade-submission')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  gradeSubmission(
    @Body() Dto: GradeSubmissionDto,
    @Param('id') id: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' };
    },
  ) {
    return this.service.gradeSubmission(id, Dto, req.user);
  }

  @Get(':id/my-submission')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  mySubmission(
    @Param('id') id: string,
    @Req() req: Request & { user: { _id: string; role: 'USER' } },
  ) {
    return this.service.mySubmission(id, req.user);
  }
}
