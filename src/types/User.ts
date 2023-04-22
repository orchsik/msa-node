export type IUser = {
  id: number;
  username: string;
  password: string;
};

export type UserGetDto = Pick<IUser, 'username' | 'password'>;

export const isUserGetDto = (data: any): data is UserGetDto => {
  return typeof data.username === 'string' && typeof data.password === 'string';
};
