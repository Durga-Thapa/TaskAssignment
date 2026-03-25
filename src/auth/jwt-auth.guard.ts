import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from 'src/common/guard/roleDecorators';
import { Role } from 'src/common/roleEnum';

interface JwtUser {
  _id: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    console.log('user', user);
    if (err || !user) {
      throw err ?? new UnauthorizedException();
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const jwtUser = user as unknown as JwtUser;

    if (requiredRoles && !requiredRoles.includes(jwtUser.role)) {
      console.log('inside auth guard', jwtUser);
      throw new ForbiddenException('Access denied');
    }

    return user;
  }
}
