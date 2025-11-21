import { Component, inject, input, OnChanges, output, signal, ChangeDetectionStrategy} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
//material
import {MatAccordion, MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
//types
import { type TaskType, type SearchTaskResponseType, type SubjectArrayType } from 'types/types';
//dependencies
import dayjs from 'dayjs';
import { TaskService } from 'app/services/task.service';
import { JwtService } from 'app/services/jwt.service';
import { environment } from 'environments/environment.development';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

type AppliedFiltersType = {
  addedBefore: any,
  addedAfter: any,
  taskSubject: string | null | undefined,
  taskDone: string | null
}

import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'filters-modal',
  templateUrl: 'filters.modal.html',
  styleUrl: './filters.modal.scss',
  providers: [provideNativeDateAdapter(),],
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatAccordion, MatExpansionModule, MatExpansionPanel, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatCardModule, MatIcon, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersModal implements OnChanges {
  readonly dialogRef = inject(MatDialogRef<FiltersModal>);
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  subjectArray: SubjectArrayType = ["school", "work", "family", "friends", "hobbies"]
  filtersActivated = input<boolean>(false);
  page = input<number>(0)
  limit = input<number>(10)
  appliedFilters = signal<AppliedFiltersType>({
    addedBefore: null,
    addedAfter: null,
    taskSubject: null,
    taskDone: null
  })
  filteredTasksArray = signal<TaskType[]>([])
  emitFilteredArray = output<{
    filteredTasks: TaskType[]
    totalFilteredTasks: number
  }>();
  readonly panelOpenState = signal(false);
  filtersForm = new FormGroup({
    addedBefore: new FormControl(),
    addedAfter: new FormControl(),
    taskSubject: new FormControl<string | null>(null),
    taskDone: new FormControl()
  })

  constructor(public tasksApi: TaskService, public jwtApi: JwtService) {
  }

  ngOnChanges() {
    if (this.filtersActivated()) {
      return this.applyFilters()
    } else {
      this.filtersForm.setValue({
        addedBefore: "",
        addedAfter: "",
        taskSubject: "",
        taskDone: ""
      })
    }
  }

  applyFilters() {
    const addedBefore = this.filtersForm.value.addedBefore
    const addedAfter = this.filtersForm.value.addedAfter
    const taskSubject = this.filtersForm.value.taskSubject
    let taskDone = this.filtersForm.value.taskDone

    const appliedFilters: AppliedFiltersType = {
      addedBefore,
      addedAfter,
      taskSubject,
      taskDone
    }

    this.appliedFilters.update(signal => {
      if (appliedFilters === signal) return signal
      else return appliedFilters
    })
    const _user_id = this.jwtApi.getAccessTokenUserId()
    if (!_user_id) return
    const getFilteredArray = this.tasksApi.filterTask(_user_id, this.page(), this.limit(), this.appliedFilters().addedBefore, this.appliedFilters().addedAfter, this.appliedFilters().taskSubject, this.appliedFilters().taskDone)

    if (getFilteredArray === null) return

    getFilteredArray.subscribe(res => {
      switch (res.status) {
        case 201: {
          const accessToken = res.headers.get(environment.tokenHeader)
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken;
          this.applyFilters()
          break
        }
        case 204: {
          this.dialogRef.close({
            filteredTasks: [],
            totalFilteredTasks: 0
          })
          return
        }
        default:
        const {filteredTasks, totalFilteredTasks} = res.body as SearchTaskResponseType;
        this.dialogRef.close({
          filteredTasks,
          totalFilteredTasks
        })
      }
    })
  }
}
