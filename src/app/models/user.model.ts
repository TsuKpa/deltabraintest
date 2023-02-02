export interface User {
  avatar: string;
  gender: Gender;
  username: string;
  name: string;
  birthday: string;
  email: string;
  location: string;
  isDisable: boolean;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}
