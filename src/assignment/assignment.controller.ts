import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guard/roleGuard';
import { Roles } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';
import { CreateAssignmentDto } from './Dto/createAssignmentDto';
import { Request } from 'express';
import { UpdateAssignmentDto } from './Dto/updateAssignmentDto';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  create(
    @Body() Dto: CreateAssignmentDto,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.create(Dto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  update(
    @Body() Dto: UpdateAssignmentDto,
    @Param('id') id: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.update(Dto, id, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.get();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  delete(
    @Param() id: string,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.remove(id, req.user);
  }
}
