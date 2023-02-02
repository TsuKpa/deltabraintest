import { Injectable } from '@angular/core';
import { User, Gender } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    data: User[] = [
        {
            avatar: 'https://www.svgrepo.com/show/53617/avatar.svg',
            gender: Gender.MALE,
            username: 'nva123',
            name: 'Nguyen Van An',
            location: 'VN',
            birthday: new Date ('1989-2-1').toISOString(),
            email: 'nva123@gmail.com',
            isDisable: false
        },
        {
            avatar: 'https://www.svgrepo.com/show/18074/avatar.svg',
            gender: Gender.FEMALE,
            username: 'ntb23',
            name: 'Nguyen Thi Binh',
            birthday: new Date ('1977-1-1').toISOString(),
            location: 'VN',
            email: 'ntb23@gmail.com',
            isDisable: false
        },
        {
            avatar: 'https://www.svgrepo.com/show/53617/avatar.svg',
            gender: Gender.MALE,
            username: 'nvc13',
            name: 'Nguyen Van Cuong',
            birthday: new Date ('1984-1-1').toISOString(),
            location: 'VN',
            email: 'nvc13@gmail.com',
            isDisable: false
        },
        {
            avatar: 'https://www.svgrepo.com/show/53617/avatar.svg',
            gender: Gender.MALE,
            username: 'tqa123',
            name: 'Tran Quang Anh',
            birthday: new Date ('1985-1-1').toISOString(),
            location: 'VN',
            email: 'tqa123@gmail.com',
            isDisable: false
        },
        {
            avatar: 'https://www.svgrepo.com/show/18074/avatar.svg',
            gender: Gender.FEMALE,
            username: 'ntd123',
            name: 'Nguyen Thi Diem',
            birthday: new Date ('1998-1-1').toISOString(),
            email: 'ntd3@gmail.com',
            location: 'VN',
            isDisable: false
        },
        {
            avatar: 'https://www.svgrepo.com/show/53617/avatar.svg',
            gender: Gender.MALE,
            username: 'dvh123',
            name: 'Doan Van Hau',
            birthday: new Date ('1994-3-1').toISOString(),
            location: 'VN',
            email: 'dvh2@gmail.com',
            isDisable: false
        }
    ];

    getUserDataFromLocalStorage(): User[] {
        this.data = JSON.parse(localStorage.getItem('users')).filter(item => !item.isDisable);
        return [...this.data];
    }

    public get userData(): User[] {
        return [...this.data];
    }

    checkExist(username?: string): boolean {
      if (username) {
        return this.data.findIndex(user => user.username === username) !== -1;
      }
      return !!localStorage.length;
    }

    saveToLocalStorage(data: User[]): void {
        localStorage.setItem('users', JSON.stringify(data));
    }
}
