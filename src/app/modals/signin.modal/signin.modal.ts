import { Component, signal, WritableSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
//forms
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Route, Router, RouterLink } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { JwtService } from 'app/services/jwt.service';
import { AuthService } from 'app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment.development';
//directives
import { SubmitdisabledDirective } from 'app/directives/submitdisabled.directive';
@Component({
  selector: 'signin-modal',
  imports: [MatDialogContent, MatButtonModule, ReactiveFormsModule, MatIcon, RouterLink, NgOptimizedImage, SubmitdisabledDirective],
  templateUrl: './signin.modal.html',
  styleUrl: './signin.modal.scss'
})
export class SigninModal {
    usernameRegex: RegExp = /^(?!.*[<>\"'/`&])(?:[a-zA-Z0-9._-]{3,32}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  pwrRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  signInOk: WritableSignal<boolean> = signal<boolean>(false)
  wrongPassword: WritableSignal<boolean> = signal<boolean>(false)
  attemptExceeded: WritableSignal<boolean> = signal<boolean>(false)
  signInFormGroup: FormGroup = new FormGroup({
    username: new FormControl("", [Validators.pattern(this.usernameRegex), Validators.required]),
    password: new FormControl("", [Validators.pattern(this.pwrRegex), Validators.required])
  })
  imgPath: String = "https://i.ibb.co/TMWXdR3j/Gemini-Generated-Image-19exxp19exxp19ex.png"
  constructor(private dialogRef: MatDialogRef<SigninModal>, private jwtApi: JwtService, private authApi: AuthService, private router: Router) {}

  onClose() {
    const username = this.signInFormGroup.value.username
    const password = this.signInFormGroup.value.password

    if (username && password) {
      this.authApi.signIn(username, password).subscribe((res) => {
        const accessToken = res.headers.get(environment.tokenHeader);
        if (accessToken) {
          this.jwtApi.setAccessToken = accessToken;
          this.signInOk.set(true)
          this.authApi.isSignInActive.set(true)
          setTimeout(() => {
            this.dialogRef.close()
            this.router.navigate(['/'])
            this.signInOk.set(false)
            this.authApi.isSignInActive.set(false)
            window.location.reload()
          }, 2000)
        }
      }, (err: HttpErrorResponse) => {

        switch (err.status) {
          case 400: {
            this.wrongPassword.set(false)
            if (err.error?.response === "missing-credentials") {
              window.location.reload()
            } else {
              this.wrongPassword.set(true)
            }
            break
          }
          case 401: {
            if (err.error?.response === "wrong-password") {
              this.wrongPassword.set(true)
            } else {
              this.wrongPassword.set(false)
              this.attemptExceeded.set(true)
            }
            break
          } 
          case 410: {
            this.dialogRef.close()
            this.router.navigate(["/changepwr"])
            break
          }
          default: {
            this.dialogRef.close()
            this.router.navigate(["/error500"])
          }
        }
      })
    }
  }
}
