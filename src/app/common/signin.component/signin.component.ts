import { Component, signal, WritableSignal } from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms'
import { NgOptimizedImage } from '@angular/common';
import { JwtService } from 'app/services/jwt.service';
import { AuthService } from 'app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'environments/environment.development';
import { MatIcon } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { SubmitdisabledDirective } from 'app/directives/submitdisabled.directive';
@Component({
  selector: 'app-signin.component',
  imports: [ReactiveFormsModule, RouterLink, MatIcon, NgOptimizedImage, SubmitdisabledDirective],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  usernameRegex: RegExp = /^(?!.*[<>\"'/`&])(?:[a-zA-Z0-9._-]{3,32}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  pwrRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  signInOk: WritableSignal<boolean> = signal<boolean>(false)
  wrongPassword: WritableSignal<boolean> = signal<boolean>(false)
  attemptExceeded: WritableSignal<boolean> = signal<boolean>(false)
  signInFormGroup: FormGroup = new FormGroup({
    username: new FormControl("", [Validators.pattern(this.usernameRegex), Validators.required]),
    password: new FormControl("", [Validators.pattern(this.pwrRegex), Validators.required])
  })
  imgPath: String = `${environment.apiUrl}assets/lcp/home-lcp.png`
  constructor(public jwtApi: JwtService, public authApi: AuthService, private router: Router) {}

  signIn() {
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
            this.router.navigate(['/'])
            this.signInOk.set(false)
            this.authApi.isSignInActive.set(false)
          }, 2000)
        }
      }, (err: HttpErrorResponse) => {

        switch (err.status) {
          case 401: {
            if (err.error?.response === "wrong-password") {
              this.wrongPassword.set(true)
            } else {
              this.wrongPassword.set(false)
              this.attemptExceeded.set(true)
            }
            break
          }
          case 400: {
            this.wrongPassword.set(false)
            if (err.error?.response === "missing-credentials") {
              window.location.reload()
            } else {
              this.wrongPassword.set(true)
            }
            break
          }
          case 410: {
            this.router.navigate(["/changepwr"])
            break
          }
          default: {
            this.router.navigate(["/error500"])
          }
        }
      })
    }
  }
}
