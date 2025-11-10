import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { JwtService } from 'app/services/jwt.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment.development';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SubmitdisabledDirective } from 'app/directives/submitdisabled.directive';
type ErrorResponseTypes = "missing-credentials" | "not-found" | "equal-to-old-password" | "invalid-password" | "wrong-password"

const validateConfirmPwr = (control: AbstractControl): ValidationErrors | null => {
  const object = control.parent?.controls as unknown as Object
  if (object != undefined && object != null) {
      const controlEntries = Object.entries(object)
      let newPasswordValue;
      for (const [controlName, controlObj] of controlEntries) {
        if (controlName === "newPassword") {
          newPasswordValue = controlObj.value
        }
      }

      if (newPasswordValue === control.value) {
       return null
      }
  }
  return {invalidConfirmation: true}
}

@Component({
  selector: 'app-changepwr.component',
  imports: [ReactiveFormsModule, NgOptimizedImage, ReactiveFormsModule, MatIconModule, SubmitdisabledDirective, NgClass],
  templateUrl: './changepwr.component.html',
  styleUrl: './changepwr.component.scss'
})
export class ChangepwrComponent {
  invalidPattern: WritableSignal<boolean> = signal<boolean>(true)
  errorResponse: WritableSignal<ErrorResponseTypes | undefined> = signal<ErrorResponseTypes | undefined>(undefined)
  pwrChanged: WritableSignal<boolean> = signal<boolean>(false);
  notEqualPasswords: WritableSignal<boolean> = signal<boolean>(true);
  usernameAndEmailRegex: RegExp = /^(?!.*[<>\"'\/`&])(?:[a-zA-Z0-9._-]{3,32}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  pwrRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  imgPath: String = "https://i.ibb.co/TMWXdR3j/Gemini-Generated-Image-19exxp19exxp19ex.png"
  constructor(public jwtApi: JwtService, public authApi: AuthService, public router: Router) {}

  changepwrFormGroup = new FormGroup({
    usernameOrEmail: new FormControl("", [Validators.required, Validators.pattern(this.usernameAndEmailRegex)]),
    oldPassword: new FormControl("", [Validators.required, Validators.pattern(this.pwrRegex)]),
    newPassword: new FormControl("", [Validators.required, Validators.pattern(this.pwrRegex)],),
    confirmPassword: new FormControl("", [Validators.required, Validators.pattern(this.pwrRegex), validateConfirmPwr]),
  })

  resetForm() {
    this.changepwrFormGroup.setValue({
      usernameOrEmail: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
  }

  checkNewPassword() {
    if (this.changepwrFormGroup.controls.newPassword.errors === null) this.invalidPattern.set(false)
    else this.invalidPattern.set(true)
    if (this.changepwrFormGroup.controls.confirmPassword.errors) {

        const object = this.changepwrFormGroup.controls.confirmPassword.errors as unknown as Object

        if (object != undefined && object != null) {
      const controlEntries = Object.entries(object)

      for (const [errorName, errorValue] of controlEntries) {
        if (errorName === "invalidConfirmation") this.notEqualPasswords.set(errorValue)
      }

    }
    } else this.notEqualPasswords.set(false)
  }

  changePwr() {
    const usernameOrEmail = this.changepwrFormGroup.value.usernameOrEmail
    const oldPassword = this.changepwrFormGroup.value.oldPassword
    const newPassword = this.changepwrFormGroup.value.newPassword
    const confirmPassword = this.changepwrFormGroup.value.confirmPassword

    if (!this.changepwrFormGroup.valid) return this.resetForm()

    if (newPassword === confirmPassword) {
      if (!usernameOrEmail || !oldPassword || !newPassword) return window.location.reload()
        const changePwrObject = {
          username: usernameOrEmail,
          oldPassword: oldPassword,
          newPassword: newPassword
        }
        this.authApi.changePwr(changePwrObject).subscribe((res) => {
          if (res.status === 201) {
            const accessToken = res.headers.get(environment.tokenHeader)
            if (!accessToken) this.router.navigate(["/error500"])
            else {  
              this.jwtApi.setAccessToken = accessToken 
              this.changePwr()
            } 
          } else {
            this.pwrChanged.set(true)
            this.jwtApi.deleteRefreshToken()
            this.jwtApi.setAccessToken = ""
            setTimeout(() => {
              this.router.navigate(["/signin"])
              this.pwrChanged.set(false)
              
            }, 2000)
          }
        }, (err: HttpErrorResponse) => {
          switch (err.status) {
          case (400): {
              if (err.error?.response === "missing-credentials") {
                window.location.reload();
              }
              break
            }
          case (401): {
            const response = err.error?.response; 
          if (response === "jwt-unauthorized") {
            this.pwrChanged.set(false)
            this.jwtApi.setAccessToken = "";
            this.jwtApi.deleteRefreshToken()
            this.router.navigate(["/signin"])
          } else if (response === "not-found") {
            this.errorResponse.set(response)
            this.resetForm()
          } else if (response === "equal-to-old-password") {
            this.errorResponse.set(response)
            this.resetForm()
          } else if (response === 'invalid-password') {
            this.errorResponse.set(response)
            this.resetForm()
          } else if (response === 'wrong-password') {
            this.errorResponse.set(response)
            this.resetForm()
          }
          break
        };
        case (403): {
          if (err.error?.response === "jwt-not-found") {
            this.pwrChanged.set(false)
            this.jwtApi.setAccessToken = "";
            this.jwtApi.deleteRefreshToken()
            window.location.reload()
          }
          break
        }
        default: {
          this.router.navigate(["/error500"])
        } 
          }
        })
    } else {
      this.notEqualPasswords.set(true)
      this.changepwrFormGroup.setValue({
      usernameOrEmail: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    }
  }
}
