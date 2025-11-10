import { Component, inject, signal } from '@angular/core';
//components
import { FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { JwtService } from 'app/services/jwt.service';
import { TaskService } from 'app/services/task.service';
import { environment } from 'environments/environment.development';
import dayjs from 'dayjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
const validateDate = (control: AbstractControl): ValidationErrors | null => {
  const date = control.value

  if (!date) return null
  if (Date.parse(Date()) > (Date.parse(date) + 3600)) return {invalidDate: true}
  return null
}

@Component({
  selector: 'app-editdelete.modal',
  providers: [provideNativeDateAdapter()],
  imports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatButtonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule],
  templateUrl: './editdelete.modal.html',
  styleUrl: './editdelete.modal.scss'
})
export class EditdeleteModal {
  taskDeleted = signal<boolean>(false)
  taskEdited = signal<boolean>(false)
  dialogData = inject(MAT_DIALOG_DATA)
  editTaskFormGroup = new FormGroup({
    description: new FormControl("", Validators.required),
    taskDone: new FormControl(),
    dueDate: new FormControl<Date | null>(null, validateDate)
  })

  constructor(public dialogRef: MatDialogRef<EditdeleteModal>, public jwtApi: JwtService, public taskApi: TaskService, public router: Router) {}

  deleteTask(response: "Y" | "N") {
    if (response === "N") return this.dialogRef.close()

    this.taskApi.deleteTask(this.dialogData.taskId).subscribe(res => {
      switch (res.status) {
        case 201: {
          const accessToken = res.headers.get(environment.tokenHeader);
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken;
          this.deleteTask("Y")
          break
        }
        default: {
          this.taskDeleted.set(true);

          setTimeout(() => {
            this.dialogRef.close("true");
            this.taskDeleted.set(false)
          }, 1000)
        }
      }
    })
  }

  editTask(response: "Y" | "N") {
    if (response === "N") return this.dialogRef.close()
      const description = this.editTaskFormGroup.value.description
      const taskDone = this.editTaskFormGroup.value.taskDone
      let dueDate: Date | null | undefined | number = this.editTaskFormGroup.value.dueDate

      if (dueDate){
        dueDate = dayjs(dueDate).unix()
      }

      if (!description) return

      this.taskApi.editTask({
        idTask: this.dialogData.taskId,
        description,
        taskDone: taskDone != null ? 'Y' : 'N',
        dueDate: dueDate != null ? dueDate : undefined
      }).subscribe(res => {
      switch (res.status) {
        case 201: {
          const accessToken = res.headers.get(environment.tokenHeader);
          if (!accessToken) return
          this.jwtApi.setAccessToken = accessToken;
          this.editTask("Y")
          break
        }
        default: {
          this.taskEdited.set(true);

          setTimeout(() => {
            this.dialogRef.close(this.taskEdited() ? "true" : "false");
            this.taskEdited.set(false)
          }, 1000)
        }
      }
      }, (err: HttpErrorResponse) => {
          switch (err.status) {
            case (400): {
              if (err.error.response === "missing-parameters") {
                window.location.reload()
              } else if (err.error.response === "invalid-request") {
                this.dialogRef.close("false")
              }
              break
            }
            case (401): {
              const response = err.error?.response;
              if (response === "jwt-unauthorized") {
                this.reSignIn()
              } else if (response === "user-not-found") {
                this.reSignIn()
              } else if (response === "task-not-found") {
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
