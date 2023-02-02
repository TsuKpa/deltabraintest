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

export const ImageURL = {
  male: 'https://www.svgrepo.com/show/53617/avatar.svg',
  female: 'https://www.svgrepo.com/show/18074/avatar.svg'
};

