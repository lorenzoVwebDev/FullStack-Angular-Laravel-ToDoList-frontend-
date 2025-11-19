import { type Slide } from './../../types/types';
import { Component, WritableSignal, signal, PLATFORM_ID, inject, computed,  ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
//directives
import { SubmitdisabledDirective } from 'app/directives/submitdisabled.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
//components
import { Carousel } from '@common/carousel/carousel';
import { GlobalFooter } from '../common/global.footer/global.footer';
import { GlobalHeader } from '../common/global.header/global.header';
//material
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
//rxjs
import { toSignal } from '@angular/core/rxjs-interop';
//services
import { AuthService } from 'app/services/auth.service';
import { JwtService } from 'app/services/jwt.service';
import { environment } from 'environments/environment.development';
//types

const validateFile = (control: AbstractControl): ValidationErrors | null => {
  const file: File | null | undefined = control.value
  const allowedTypes = ["image/png", "image/jpeg"]

  if (file && !allowedTypes.includes(file.type)) {
    return {typeNotAllowed: true}
  }
  return null
}

@Component({
  selector: 'home-component',
  imports: [GlobalFooter, GlobalHeader, ReactiveFormsModule, NgOptimizedImage, SubmitdisabledDirective, MatIconModule, RouterLink, Carousel, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
/*   sliderContainer = viewChild('sliderContainer')
  sliderCtnr = computed(() => this.sliderContainer()) */
  @ViewChild('sliderContainer') container: ElementRef | undefined;

  public sliderArray: Slide[] = [
    {
      icon: "authentication",
      title: "Complete Authetication Api",
      description: "Laravel authetication API that includes sign-in, sign-up, change-pwr, log-out and JWT-authetication. Powered by eloquent models (mysql database), JWT middleware, Avatar creator middleware (to store raw binary data directly in the database), expections handling and expections logging through MonoLog."
    }, {
      icon: "tasks",
      title: "Task CRUD Api",
      description: "Laravel tasks CRUD-API to get, create, update and delete tasks. It also allow to retrive tasks based on keywords and to filter them. Powered by eloquent models (mysql database), JWT middleware, expections handling and expections logging through MonoLog."
    }, {
      icon: "ui",
      title: "Angular Features",
      description: "Routing, http client, dependecy injection, deferrable contents, search and filter tasks, pagination, input/outputs, pipes, reactive templates, guards, resolvers... Those are many of the Angular features that I have used to create the To do List Full Stack application. Project is still improving."
    }
  ]

  private route = inject(ActivatedRoute)
  private routeData = toSignal(this.route.data)
  testData = computed(() => {
    if (this.routeData() != undefined) {
      return this.routeData()
    } else {
        return null
      }}
  )

  elementWidth = signal<number>(0)
  isSignUpOk: WritableSignal<boolean> = signal<boolean>(false)
  duplicateUser: WritableSignal<boolean> = signal<boolean>(false)
  signedIn: WritableSignal<boolean> = signal<boolean>(false)
  usernameRegex: RegExp = /^(?!.*[<>\"'/`&])(?:[a-zA-Z0-9._-]{3,32}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  pwrRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  file: File | undefined = undefined;
  imgPath: String = "https://i.ibb.co/TMWXdR3j/Gemini-Generated-Image-19exxp19exxp19ex.png"
  //Platform
  platformId = inject(PLATFORM_ID);

  constructor(public jwtApi: JwtService, public authApi: AuthService, public router: Router, private matRegistry: MatIconRegistry, private domSanitaizer: DomSanitizer) {
    if (this.testData()?.["loggedInResolver"]) this.signedIn.set(true);
    this.matRegistry.addSvgIcon("angular", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/angular-ico.svg`));
    this.matRegistry.addSvgIcon("laravel", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/laravel-ico.svg`));
    this.matRegistry.addSvgIcon("mysql", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/mysql-ico.svg`));
    this.matRegistry.addSvgIcon("authentication", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/authentication.svg`));
    this.matRegistry.addSvgIcon("tasks", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/tasks.svg`));
    this.matRegistry.addSvgIcon("ui", this.domSanitaizer.bypassSecurityTrustResourceUrl(`${environment.apiUrl}assets/icons/ui.svg`))
  }


  ngAfterViewInit(): void {
    console.log(this.container?.nativeElement.clientWidth)
    this.elementWidth.set(this.container?.nativeElement.clientWidth)
  }

  onImagePicker(event: Event) {
    if (event != null && event != undefined) {
      if (event.target === null) return undefined
      const input = event.target as HTMLInputElement

      if (input.files && input) return this.file = input.files[0]
      else return undefined
    } else return undefined
  }

  onResize() {
    this.elementWidth.set(this.container?.nativeElement.clientWidth)
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
          this.router.navigate(["/signin"])
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
