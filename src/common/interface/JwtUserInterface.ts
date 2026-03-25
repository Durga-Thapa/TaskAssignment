import { Role } from '../roleEnum';

export interface JwtUser {
  id: string;
  email: string;
  role: Role;
  [key: string]: any;
}
