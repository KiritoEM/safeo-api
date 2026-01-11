import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltOrRounds = 10;

  return await hash(password, saltOrRounds);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await compare(password, hash);
};
