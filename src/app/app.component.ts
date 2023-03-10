import { CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Gender, ImageURL, User } from './models/user.model';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('dialogRef', { static: true }) dialog: TemplateRef<any>;
  @ViewChild('documentEditForm') documentEditForm: FormGroupDirective;
  @ViewChild('table') table: MatTable<User>;
  @ViewChild('dialogDelete', { static: true }) dialogDelete: TemplateRef<any>;
  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;

  @ViewChild(CdkDropList) placeholder: CdkDropList;

  activeContainer;
  target: CdkDropList = null;
  targetIndex: number;
  source: CdkDropList = null;
  sourceIndex: number;
  dragIndex: number;

  dialogRef: MatDialogRef<any, any>;
  dialogRefDelete: MatDialogRef<any, any>;

  users: User[] = [];
  isChecked = false;
  value: any;
  birthdayRange = {
    min: new Date('1950-1-1'),
    max: new Date()
  };

  userForm = this.getNewFormGroup();
  displayedColumns: string[] = ['avatar', 'username', 'name', 'email', 'birthday', 'action'];

  constructor(
    private usersService: UsersService,
    public dialogService: MatDialog,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    if (!this.usersService.checkExist()) {
      this.usersService.saveToLocalStorage(this.usersService.data);
    }
    this.users = this.usersService.getUserDataFromLocalStorage();
    this.isChecked = !this.isChecked;
    setTimeout(() => {
    this.isChecked = !this.isChecked;
    }, 1);
  }

  ngAfterViewInit(): void {
    const phElement = this.placeholder.element.nativeElement;
    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  getNewFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(8), Validators.pattern('[a-z][a-z0-9_.]+')]),
      name: new FormControl('', [Validators.maxLength(20)]),
      email: new FormControl('', [Validators.required, Validators.pattern(`\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+`)]),
      gender: new FormControl(Gender.MALE, Validators.required),
      location: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      birthday: new FormControl('', Validators.required),
    });
  }

  openDialog(): void {
    this.dialogRef = this.dialogService.open(this.dialog, {
      data: {
        type: 'create'
      }
    });
    this.userForm = this.getNewFormGroup();
  }

  drop(event: CdkDragDrop<string[]>): void {
    const prevIndex = this.users.findIndex((d) => d === event.item.data);
    moveItemInArray(this.users, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  addUser(): void {
    const newData: User = { ...this.userForm.value };
    if (this.usersService.checkExist(newData.username)) {
      this.userForm.controls.username.setErrors({
        usernameExist: true
      });
      this.toastr.error('T??n t??i kho???n ???? t???n t???i!');
      return;
    }
    newData.isDisable = false;
    newData.avatar = null;
    newData.birthday = moment(newData.birthday).toISOString();
    newData.avatar = newData.gender === Gender.FEMALE ? ImageURL.female : ImageURL.male;
    this.users.unshift(newData);
    this.usersService.saveToLocalStorage(this.users);
    if (!this.isChecked) {
      this.table.renderRows();
    }
    this.toastr.success('Th??m ng?????i d??ng th??nh c??ng!');
    this.dialogRef.close();
  }

  updateUser(oldData: User): void {
    const newData: User = { ...this.userForm.value };
    if (oldData.username !== newData.username && this.usersService.checkExist(newData.username)) {
      this.userForm.controls.username.setErrors({
        usernameExist: true
      });
      this.toastr.error('T??n t??i kho???n ???? t???n t???i!');
      return;
    }
    newData.isDisable = oldData.isDisable;
    newData.avatar = oldData.avatar;
    newData.birthday = moment(newData.birthday).toISOString();
    newData.avatar = newData.gender === Gender.FEMALE ? ImageURL.female : ImageURL.male;
    this.users = this.users.map(user => {
      if (user.username === newData.username) {
        user = newData;
      }
      return user;
    });
    this.usersService.saveToLocalStorage(this.users);
    if (!this.isChecked) {
      this.table.renderRows();
    }
    this.toastr.info('C???p nh???t ng?????i d??ng th??nh c??ng!');
    this.dialogRef.close();
  }

  openDialogUpdateUser(data: User): void {
    this.dialogRef = this.dialogService.open(this.dialog, {
      data: {
        user: data,
        type: 'update'
      }
    });
    const dataCopy = { ...data };
    delete dataCopy.isDisable;
    delete dataCopy.avatar;
    this.dialogRef.afterOpened().subscribe(() => {
      this.userForm.setValue(dataCopy);
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.userForm = this.getNewFormGroup();
    });
  }

  dropListDropped(event: CdkDragDrop<any>): void {
    this.users[event.previousContainer.data.index] = event.container.data.user;
    this.users[event.container.data.index] = event.previousContainer.data.user;
  }

  openDialogDeleteUser(data: User): void {
    this.dialogRefDelete = this.dialogService.open(this.dialogDelete, {
      data
    });
  }

  deleteUser(username: string): void {
    const copyUsers = [...this.users].map(user => {
      if (user.username === username) {
        user.isDisable = true;
      }
      return user;
    });
    this.usersService.saveToLocalStorage(copyUsers);
    this.users = this.usersService.getUserDataFromLocalStorage();
    if (!this.isChecked) {
      this.table.renderRows();
    }
    this.toastr.success('X??a ng?????i d??ng th??nh c??ng!');
    this.dialogRefDelete.close();
  }

  getErrorMessage(field: keyof User): string {
    const errorMessage = {
      email: {
        required: 'Email l?? b???t bu???c',
        wrongPattern: 'Vui l??ng nh???p ????ng ?????nh d???ng email'
      },
      name: 'T??n kh??ng ????ng',
      username: {
        required: 'T??n t??i kho???n l?? b???t bu???c',
        usernameExist: 'T??i kho???n ???? t???n t???i',
        wrongPattern: 'T??n t??i kho???n ch??? c?? a-z, 0-9, kh??ng b???t ?????u b???ng ch??? s???'
      },
      location: '?????a ch??? l?? b???t bu???c',
      birthday: {
        required: 'Ng??y sinh l?? b???t bu???c',
        wrongPattern: 'Ng??y sinh kh??ng ????ng'
      },
      gender: 'Gi???i t??nh l?? b???t bu???c'
    };
    if (field === 'username') {
      if (this.userForm.controls.username.hasError('pattern')) {
        return errorMessage.username.wrongPattern;
      }
      if (this.userForm.controls.username.hasError('required')) {
        return errorMessage.username.required;
      }
      return errorMessage.username.usernameExist;
    }
    if (field === 'email') {
      if (this.userForm.controls.email.hasError('required')) {
        return errorMessage.email.required;
      }
      return errorMessage.email.wrongPattern;
    }
    if (field === 'birthday') {
      if (this.userForm.controls.birthday.hasError('required')) {
        return errorMessage.birthday.required;
      }
      return errorMessage.birthday.wrongPattern;
    }
    return errorMessage[field];
  }
}
