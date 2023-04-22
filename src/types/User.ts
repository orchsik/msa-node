export type IUser = {
  username: string;
  password: string;
};

export type UserGetDto = IUser;

export const isUserGetDto = (data: any): data is UserGetDto => {
  return typeof data.username === 'string' && typeof data.password === 'string';
};
