import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Gender, User } from './models/user.model';
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
  isChecked = true;
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
    private toastr: ToastrService,
    private viewportRuler: ViewportRuler) { }

  ngOnInit(): void {
    if (!this.usersService.checkExist()) {
      this.usersService.saveToLocalStorage(this.usersService.data);
    }
    this.users = this.usersService.getUserDataFromLocalStorage();
    console.log(this.users);
  }

  ngAfterViewInit(): void {
    const phElement = this.placeholder.element.nativeElement;
    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  getNewFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(8), Validators.pattern('[a-z0-9 ]*')]),
      name: new FormControl('', [Validators.required, Validators.maxLength(20)]),
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
      this.toastr.error('Username is exist!');
      return;
    }
    newData.isDisable = false;
    newData.avatar = null;
    newData.birthday = moment(newData.birthday).toISOString();
    newData.avatar = newData.gender === Gender.FEMALE ? 'https://www.svgrepo.com/show/18074/avatar.svg' : 'https://www.svgrepo.com/show/53617/avatar.svg';
    this.users.unshift(newData);
    this.usersService.saveToLocalStorage(this.users);
    this.table.renderRows();
    this.toastr.success('Add user success!');
    this.dialogRef.close();
  }

  updateUser(oldData: User): void {
    const newData: User = { ...this.userForm.value };
    if (oldData.username !== newData.username && this.usersService.checkExist(newData.username)) {
      this.userForm.controls.username.setErrors({
        usernameExist: true
      });
      this.toastr.error('Username is exist!');
      return;
    }
    newData.isDisable = false;
    newData.avatar = null;
    newData.birthday = moment(newData.birthday).toISOString();
    this.users = this.users.map(user => {
      if (user.username === newData.username) {
        user = newData;
      }
      return user;
    });
    this.usersService.saveToLocalStorage(this.users);
    this.table.renderRows();
    this.toastr.info('Update user success!');
    this.dialogRef.close();
  }

  openDialogUpdateUser(data: User): void {
    console.log(data, this.users);
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

  dropListDropped(): void {
    if (!this.target) {
      return;
    }

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentElement;

    // phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      moveItemInArray(this.users, this.sourceIndex, this.targetIndex);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {

    if (drop === this.placeholder) {
      return true;
    }

    if (drop !== this.activeContainer) {
      return false;
    }

    const phElement = this.placeholder.element.nativeElement;
    const sourceElement = drag.dropContainer.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    // this.placeholder._dropListRef.enter(drag._dragRef, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  dragMoved(e: CdkDragMove): void {
    const point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  /** Determines the point of the page that was touched by the user. */
  // tslint:disable-next-line: typedef
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top
    };
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
    this.table.renderRows();
    this.toastr.success('Delete user success!');
    this.dialogRefDelete.close();
  }

  getErrorMessage(field: keyof User): string {
    // console.log(this.userForm.controls);

    const errorMessage = {
      email: {
        required: 'Your email is required',
        wrongPattern: 'Your email is invalid'
      },
      name: 'Your name is required',
      username: {
        required: 'Your username is required',
        usernameExist: 'Your username is exist'
      },
      location: 'Your location is required',
      birthday: {
        required: 'Your birthday is required',
        wrongPattern: 'Your birthday is invalid'
      },
      gender: 'Your gender is required'
    };
    if (field === 'username') {
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


// tslint:disable-next-line: typedef
function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number): boolean {
  const { top, bottom, left, right } = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}
