import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guard/roleGuard';
import { Roles } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';
import { GetUser } from 'src/common/getDecorator';
import type { JwtUser } from 'src/common/interface/JwtUserInterface';
import { UpdateUserDto } from './Dto/updateUserDto';

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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  removeUser(
    @Param('id') id: string,
    @Req() req: Request & { user: { _id: string; role: 'ADMIN' } },
  ) {
    return this.service.remove(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  update(
    @Param('id') id: string,
    @Body() Dto: UpdateUserDto,
    @Req()
    req: Request & {
      user: { _id: string; role: 'ADMIN' | 'TEACHER' | 'USER' };
    },
  ) {
    return this.service.updateUser(id, Dto, req.user);
  }
}
