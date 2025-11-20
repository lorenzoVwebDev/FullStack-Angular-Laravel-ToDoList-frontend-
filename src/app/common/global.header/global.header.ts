import { Component, signal, WritableSignal, AfterViewInit, PLATFORM_ID, inject, computed, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SigninModal } from 'app/modals/signin.modal/signin.modal';
import { JwtService } from 'app/services/jwt.service';
import { AuthService } from 'app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment.development';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'global-header',
  imports: [MatIconModule, RouterLink],
  templateUrl: './global.header.html',
  styleUrl: './global.header.scss'
})
export class GlobalHeader /* implements AfterViewInit */ {
  @ViewChild('headerRight') headerRight: ElementRef | undefined;
  @ViewChild('burger') burger: ElementRef | undefined;
  burgerVisible = signal(false);
  browser = false
  private route = inject(ActivatedRoute)
  private routeData = toSignal(this.route.data)
  testData = computed(() => {
    if (this.routeData() != undefined) {
      return this.routeData()
    } else {
        return null
      }}
  )
  signedIn: WritableSignal<boolean> = signal<boolean>(false)
  platformId = inject(PLATFORM_ID)

  constructor(public dialog: MatDialog, public jwtApi: JwtService, public authApi: AuthService, private router: Router) {
    if (this.testData()?.["loggedInResolver"]) this.signedIn.set(true)
      if (isPlatformBrowser(this.platformId)) {
        this.browser = true
      }
  }

  navigateHome() {
    this.router.navigate(["/"])
  }
  openSignInModal() {
    this.dialog.open(SigninModal)
  }

  logOut() {

    this.authApi.logOut().subscribe((res) => {
      if (res.status === 201) {
        const accessToken = res.headers.get(environment.tokenHeader)
        if (!accessToken) return
        this.jwtApi.setAccessToken = accessToken
        this.logOut()
      } else {
        this.signedIn.set(false)
        this.jwtApi.setAccessToken = "";
        this.jwtApi.deleteRefreshToken()
        window.location.reload()
      }
    }, (err: HttpErrorResponse) => {
      switch (err.status) {
        case (401): {
          if (err.error?.response === "jwt-unauthorized") {
            this.signedIn.set(false)
            this.jwtApi.setAccessToken = "";
            this.jwtApi.deleteRefreshToken()
                    window.location.reload()
            break
          };
          break
        };
        case (403): {
          if (err.error?.response === "jwt-not-found") {
            this.signedIn.set(false)
            this.jwtApi.setAccessToken = "";
            this.jwtApi.deleteRefreshToken()
            window.location.reload()
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

  toggleNavBar() {
    this.headerRight?.nativeElement.classList.toggle('header-right-visible')
    this.burger?.nativeElement.classList.toggle('hamburger-rotate')
    this.burgerVisible.update((state) => !state);
  }
}
