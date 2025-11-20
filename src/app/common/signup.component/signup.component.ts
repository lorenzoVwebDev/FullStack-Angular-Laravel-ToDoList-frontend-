import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, WritableSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { JwtService } from 'app/services/jwt.service';
//directives
import { SubmitdisabledDirective } from 'app/directives/submitdisabled.directive';
import { environment } from 'environments/environment.development';

const validateFile = (control: AbstractControl): ValidationErrors | null => {
  const file: File | null | undefined = control.value
  const allowedTypes = ["image/png", "image/jpeg"]

  if (file && !allowedTypes.includes(file.type)) {
    return {typeNotAllowed: true}
  }
  return null
}

@Component({
  selector: 'app-signup.component',
  imports: [ReactiveFormsModule, MatIconModule, NgOptimizedImage, SubmitdisabledDirective],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isSignUpOk: WritableSignal<boolean> = signal<boolean>(false)
  duplicateUser: WritableSignal<boolean> = signal<boolean>(false)
  usernameRegex: RegExp = /^(?!.*[<>\"'/`&])(?:[a-zA-Z0-9._-]{3,32}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  pwrRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  file: File | undefined = undefined;
  imgPath: String = `${environment.apiUrl}assets/lcp/home-lcp.png`
  constructor(public jwtApi: JwtService, public authApi: AuthService, public router: Router) {}

  onImagePicker(event: Event) {
    if (event != null && event != undefined) {
      if (event.target === null) return undefined
      const input = event.target as HTMLInputElement

      if (input.files && input) return this.file = input.files[0]
      else return undefined
    } else return undefined
  }

  signUpFormGroup = new FormGroup({
    username: new FormControl<string>("", [Validators.pattern(this.usernameRegex), Validators.required]),
    email: new FormControl("", [Validators.pattern(this.emailRegex), Validators.required]),
    password: new FormControl("", [Validators.pattern(this.pwrRegex), Validators.required]),
    confirmPassword: new FormControl("", [Validators.pattern(this.pwrRegex), Validators.required]),
    avatar: new FormControl<File | undefined>(undefined, validateFile)
  })

  signUp() {
    const username = this.signUpFormGroup.value.username
    const email = this.signUpFormGroup.value.email
    const password = this.signUpFormGroup.value.password
    const confirmPassword = this.signUpFormGroup.value.confirmPassword
    const avatar = this.file
    if (!this.signUpFormGroup.valid) return

    if (password === confirmPassword) {
    if (!username || !password || !email) return
      this.authApi.signUp(username, email, password, avatar ? avatar : undefined).subscribe(res => {
        this.isSignUpOk.set(true)
        setTimeout(() => {
          this.router.navigate(["/"])
          this.isSignUpOk.set(false)
        }, 2000)
      }, (err: HttpErrorResponse) => {
        switch (err.status) {
          case 401: {
            if (err.error.response === "missing-credentials") {
              window.location.reload()
              break
            }
            break
          }
          case 409: {
            if (err.error.response = "user-duplicated") {
              this.duplicateUser.set(true)
              this.signUpFormGroup.setValue({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
                avatar: null
              })
              break
            }
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
