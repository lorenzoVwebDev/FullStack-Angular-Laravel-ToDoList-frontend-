import { Component, inject, input, OnChanges, output, signal} from '@angular/core';
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
@Component({
  selector: 'filters-component',
  imports: [ReactiveFormsModule, MatAccordion, MatExpansionModule, MatExpansionPanel, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule, MatCardModule, MatIcon],
  providers: [provideNativeDateAdapter(), /* provideMomentDateAdapter(undefined, {useUtc: true}) */],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FilterComponent implements OnChanges{
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
          this.emitFilteredArray.emit({
            filteredTasks: [],
            totalFilteredTasks: 0
          })
          return
        }
        default:
        const {filteredTasks, totalFilteredTasks} = res.body as SearchTaskResponseType;
        this.emitFilteredArray.emit({
          filteredTasks,
          totalFilteredTasks
        })
      }
    })
  }
}

/*     switch (taskDone) {
      case 'Y': {
        taskDone = true
        break
      };
      case 'N': {
        taskDone = false;
        break
      }
      default:
        break
    }

    let newTaskArray: TaskType[] = []
    if (!this.taskArray()) return []

    this.taskArray().forEach(task => {
      let bool = false;

      const addingDate = (task?.addDate as number) * 1000;
      const beforeDate = dayjs(addedBefore).unix() * 1000;
      const afterDate = dayjs(addedAfter).unix() * 1000;

      if (!Number.isNaN(beforeDate)) {
        if (beforeDate > addingDate) bool = true;
      }

      if (!Number.isNaN(afterDate)) {
        if (afterDate < addingDate) bool = true;
      }

      if (taskSubject != null) taskSubject === task.name ? bool = true : bool = false;

      if (taskDone != null) taskDone === task.done ? bool = true : bool = false;

      if (bool) newTaskArray.push(task)
     })

     this.filtersForm.setValue({
      addedBefore: "",
      addedAfter: "",
      taskSubject: "",
      taskDone: false
     })

     if (this.taskArray()) return this.emitFilteredArray.emit(newTaskArray)  */
