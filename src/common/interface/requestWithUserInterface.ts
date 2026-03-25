import { Role } from 'src/common/roleEnum';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
    [key: string]: any;
  };
}
