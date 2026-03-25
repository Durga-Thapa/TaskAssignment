import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guard/roleGuard';
import { Roles } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';
import { GetUser } from 'src/common/getDecorator';
import type { JwtUser } from 'src/common/interface/JwtUserInterface';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('all-users')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.get();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  getMyProfile(@GetUser() user: JwtUser) {
    return this.service.getMyProfile(user.id);
  }

  @Roles(Role.TEACHER)
  @Get('my-students')
  getMyStudents(
    @GetUser() user: JwtUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.getMyStudents(user.id, page, limit);
  }
}
