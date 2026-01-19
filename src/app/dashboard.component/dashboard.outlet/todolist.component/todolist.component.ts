import { Component, OnInit, signal, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
//components
import { FilterComponent } from './filters.component/filters.component';
import { AddtaskModal } from 'app/modals/addtask.modal/addtask.modal';
import { EditdeleteModal } from 'app/modals/editdelete.modal/editdelete.modal';
import { FiltersModal } from 'app/modals/filters.modal/filters.modal';
//services
import { JwtService } from 'app/services/jwt.service';
import { TaskService } from 'app/services/task.service';
import { type TaskType, type SearchTaskResponseType } from 'types/types';
//material
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import { environment } from 'environments/environment.development';
import { MatIconRegistry } from '@angular/material/icon';
//dependencies
import striptags from 'striptags'
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-todolist.component',
  imports: [MatPaginatorModule, MatCardModule, MatButtonModule, MatToolbarModule, MatIcon, FilterComponent, MatProgressSpinnerModule, DatePipe],
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodolistComponent implements OnInit {
  userHasNoTasks = signal<boolean>(true)
  searchKeyWord = signal<string>("");
  tasksFetched = signal<boolean>(false);
  isArraySearched = signal<boolean>(false)
  isArrayFiltered = signal<boolean>(false)
  pageIndex: number = 0;
  pageSize: number = 10;
  totalUserTasks: number = 0;
  defaultTaskArray = signal<TaskType[]>([])
  filteredTaskArray = signal<TaskType[]>([])
  platformId = inject(PLATFORM_ID)

  constructor(public jwtApi: JwtService, public taskApi: TaskService, public router: Router, public dialog: MatDialog, private matRegistry: MatIconRegistry, private domSanitaizer: DomSanitizer) {
    this.matRegistry.addSvgIcon("sadface", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/sad-face.svg`), {
      withCredentials: false
    });
  }

  ngOnInit() {
    this.getPageTasks()
  }
  //tasks management
  getPageTasks() {
    const _user_id = this.jwtApi.getAccessTokenUserId()
      if (!_user_id) {
        this.jwtApi.deleteRefreshToken()
        this.jwtApi.setAccessToken = ""
        this.router.navigate(["/signin"])
        return
      }
      this.taskApi.getTasks(_user_id, this.pageIndex + 1, this.pageSize).subscribe(res => {
        if (res.status == 201) {
          const accessToken = res.headers.get(environment.tokenHeader);
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken
          this.getPageTasks()
        } else if (res.status == 204) {
          this.tasksFetched.set(true)
          this.userHasNoTasks.set(true);
        } else {
          if (!res.body) return
          const {tasks, totalUserTasks} = res.body
          this.defaultTaskArray.set(Object.create(tasks))
          this.filteredTaskArray.set(Object.create(tasks));
          this.taskApi.setPageTasks = tasks;
          this.totalUserTasks = totalUserTasks
          this.tasksFetched.set(true)
          this.userHasNoTasks.set(false)
        }
      }, (err: HttpErrorResponse) => {
          switch (err.status) {
            case (400): {
              if (err.error.response === "missing-parameters") {
                window.location.reload()
              }
              break
            }
            case (401): {
              const response = err.error?.response;
              if (response === "jwt-unauthorized") {
                this.reSignIn()
              } else if (response === "user-not-found") {
                this.reSignIn()
              }
              break
            };
            case (403): {
              if (err.error?.response === "jwt-not-found") {
                this.reSignIn()
              }
              break
            }
            default: {
              this.router.navigate(["/error500"])
            }
          }
      })
  }

  firstPageTasks() {
    const _user_id = this.jwtApi.getAccessTokenUserId()
      if (!_user_id) {
        this.jwtApi.deleteRefreshToken()
        this.jwtApi.setAccessToken = ""
        this.router.navigate(["/signin"])
        return
      }
      this.taskApi.getTasks(_user_id, 0, 10).subscribe(res => {
        if (res.status == 201) {
          const accessToken = res.headers.get(environment.tokenHeader);
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken
          this.getPageTasks()
        } else if (res.status == 204) {
          this.userHasNoTasks.set(true);
        } else {

          if (!res.body) return
          const {tasks, totalUserTasks} = res.body
          this.defaultTaskArray.set(Object.create(tasks))
          this.filteredTaskArray.set(Object.create(tasks));
          this.taskApi.setPageTasks = tasks;
          this.totalUserTasks = totalUserTasks
          this.userHasNoTasks.set(false)
        }
      }, (err: HttpErrorResponse) => {
          switch (err.status) {
            case (400): {
              if (err.error.response === "missing-parameters") {
                window.location.reload()
              }
              break
            }
            case (401): {
              const response = err.error?.response;
              if (response === "jwt-unauthorized") {
                this.reSignIn()
              } else if (response === "user-not-found") {
                this.reSignIn()
              }
              break
            };
            case (403): {
              if (err.error?.response === "jwt-not-found") {
                this.reSignIn()
              }
              break
            }
            default: {
              this.router.navigate(["/error500"])
            }
          }
      })
  }

  searchTask(text: string) {
    if (!text) {
      this.searchKeyWord.set("")
      this.getPageTasks()
      return
    }
    this.searchKeyWord.set(striptags(text))

    const _user_id = this.jwtApi.getAccessTokenUserId()
    if (!_user_id) return this.reSignIn()
    this.taskApi.searchTask(_user_id, this.searchKeyWord(), this.pageIndex, this.pageSize).subscribe(res => {
      switch (res.status) {
        case 201: {
          const accessToken = res.headers.get(environment.tokenHeader)
          if (!accessToken) return
          this.searchTask(this.searchKeyWord());
          break
        };
        case 204: {
          this.isArraySearched.set(true)
          this.filteredTaskArray.set([])
          break
        }
        default: {
          const {filteredTasks, totalFilteredTasks} = res.body as SearchTaskResponseType
          if (!filteredTasks || !totalFilteredTasks) return
          this.defaultTaskArray.set(Object.create(filteredTasks))
          this.filteredTaskArray.set(filteredTasks);
          this.totalUserTasks = totalFilteredTasks
          this.isArraySearched.set(true)
        }
      }
    }, (err: HttpErrorResponse) => {
      switch (err.status) {
        case (400): {
          if (err.error.response === "missing-parameters") {
            window.location.reload()
          }
          break
        }
        case (401): {
          const response = err.error?.response;
          if (response === "jwt-unauthorized") {
            this.reSignIn()
          } else if (response === "user-not-found") {
            this.reSignIn()
          }
          break
        };
        case (403): {
          if (err.error?.response === "jwt-not-found") {
            this.reSignIn()
          }
          break
        }
        default: {
          this.router.navigate(["/error500"])
        }
      }
      })
  }

  filterTask(emitObject: {
    filteredTasks: TaskType[]
    totalFilteredTasks: number
  }) {
    this.isArrayFiltered.set(true)
    this.filteredTaskArray.set(emitObject.filteredTasks)
    this.totalUserTasks = emitObject.totalFilteredTasks
  }

  removeFilters() {
    this.isArrayFiltered.set(false)
    this.isArraySearched.set(false)
    this.firstPageTasks()
  }
  //taskapi
  openAddTaskModal() {
    this.dialog.open(AddtaskModal).afterClosed().subscribe(res => {
      if (res === "true") {
        this.firstPageTasks()
      }
    })
  }

  openFiltersModal() {
    this.dialog.open(FiltersModal).afterClosed().subscribe(data => {
      this.filterTask(data)
    })
  }

  openEditOrDeleteModal(type: "edit" | "delete", taskId: string | number) {
    if (type === "edit") {

      this.dialog.open(EditdeleteModal, {
        data: {
          type,
          taskId
        }
      }).afterClosed().subscribe(res => {
        if (res === "true") this.firstPageTasks()
      })
    } else {
      this.dialog.open(EditdeleteModal, {
        data: {
          type,
          taskId
        }
      }).afterClosed().subscribe(res => {
        if (res === "true") this.firstPageTasks()
      })
    }
  }
  //utils
  reSignIn() {
    this.jwtApi.setAccessToken = "";
    this.jwtApi.deleteRefreshToken();
    this.router.navigate(["/signin"]);
  }

  onPageChange(event: PageEvent) {
    switch (this.isArraySearched()) {
      case false: {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getPageTasks()
        break
      };
      case true: {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.searchTask(this.searchKeyWord())
      }
    }
  }

  timeStampToDate(unix: number | string | undefined) {
    if (!unix) return
    console.log(unix)
    if (typeof unix != 'number') return
    return new Date(unix * 1000)
  }
}
