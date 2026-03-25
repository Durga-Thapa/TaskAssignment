import bcrypt from 'node_modules/bcryptjs';

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10);

export const comparedPassword = async (plain: string, hashed: string) =>
  bcrypt.compare(plain, hashed);
