import { Role } from 'src/common/roleEnum';

export interface JwtPayload {
  _id: string;
  email: string;
  role: Role;
}
