import { Component, signal } from '@angular/core';
//material
import {MatButtonModule} from '@angular/material/button';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatButton} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {provideNativeDateAdapter} from '@angular/material/core';
//types
import type { TaskType,  SubjectArrayType,  SubjectLiterals } from 'types/types';
//dependencies
import dayjs from "dayjs"
import { JwtService } from 'app/services/jwt.service';
import { TaskService } from 'app/services/task.service';
import { environment } from 'environments/environment.development';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

const validateDate = (control: AbstractControl): ValidationErrors | null => {
  const date = control.value

  if (!date) return null
  if (Date.parse(Date()) > (Date.parse(date) + 3600)) return {invalidDate: true}
  return null
}
@Component({
  selector: 'app-addtask.modal',
  providers: [provideNativeDateAdapter()],
  imports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatButtonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule],
  templateUrl: './addtask.modal.html',
  styleUrl: './addtask.modal.scss'
})
export class AddtaskModal {
  taskPosted = signal<boolean>(false)
  subjectArray: SubjectArrayType = ["school", "work", "family", "friends", "hobbies"]
  safeTextRegex: RegExp = /^[^<>]*$/;
  addTaskFormGroup = new FormGroup({
    subject: new FormControl<SubjectLiterals>("work", Validators.required),
    label: new FormControl<string | null>("", [Validators.pattern(this.safeTextRegex), Validators.required]),
    description: new FormControl<string | null>("", [Validators.pattern(this.safeTextRegex), Validators.required]),
    dueDate: new FormControl<Date | null>(null, validateDate)
  })

  constructor(private dialogRef: MatDialogRef<AddtaskModal>, public jwtApi: JwtService, public taskApi: TaskService, private router: Router) {}

  addTask() {
    const subject = this.addTaskFormGroup.value.subject
    const label = this.addTaskFormGroup.value.label
    const description = this.addTaskFormGroup.value.description
    let dueDate: Date | null | undefined | number = this.addTaskFormGroup.value.dueDate

    if (dueDate){
      dueDate = dayjs(dueDate).unix()
    }

    if (!subject || !label || !description) return
    const _user_id = this.jwtApi.getAccessTokenUserId()

    if (!_user_id) return
    const task: TaskType = {
      _user_id,
      label: label,
      name: subject,
      description,
      dueDate: dueDate ? dueDate : undefined,
      done: false
    }

    this.taskApi.postTask(task).subscribe(res => {
      switch (res.status) {
        case 201: {
          const accessToken = res.headers.get(environment.tokenHeader);
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken;
          this.addTask()
          break
        }
        default: {
          this.taskPosted.set(true);

          setTimeout(() => {
            this.dialogRef.close(this.taskPosted() ? "true" : "false")
          }, 1000)
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

  reSignIn() {
    this.jwtApi.setAccessToken = "";
    this.jwtApi.deleteRefreshToken();
    this.router.navigate(["/signin"]);
  }
}
