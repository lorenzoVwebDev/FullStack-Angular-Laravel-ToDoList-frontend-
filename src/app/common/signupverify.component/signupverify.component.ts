import { AuthService } from 'app/services/auth.service';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment.development';
//material
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signupverify.component',
  imports: [MatProgressSpinnerModule],
  templateUrl: './signupverify.component.html',
  styleUrl: './signupverify.component.scss'
})
export class SignupverifyComponent {
  private route = inject(ActivatedRoute);
  public verifyToken = signal<string>("");
  public registrationApproved = signal(false)
  public invalidToken = signal(false)
  public tokenExpired = signal(false)
  public requestedToken = signal(false)
  public approvedToken = signal(false);
  imgPath: String = `${environment.apiUrl}assets/lcp/home-lcp.png`

  constructor(private authService: AuthService, public router: Router) {
    this.route.queryParams.subscribe(res => {
      if (res["verifytoken"]) {
        this.verifyToken.set(res["verifytoken"]);
        this.authService.verifySignUp(this.verifyToken()).subscribe((res) => {
          this.registrationApproved.set(true)
          console.log(res.body)
        }, (err: HttpErrorResponse) => {
          switch (err.status) {
            case 401: {
              if (err.error.response === "invalid-token")
              this.invalidToken.set(true);
              else this.tokenExpired.set(true)
              break;
            }
            default:
              this.router.navigate(["/error500"]);
              return
          }
        })
      } else {
        this.router.navigate(["/error500"]);
      }
    })
  }

  signIn() {
    this.router.navigate(["/signin"])
  }

  signUp() {
    this.router.navigate(["/signup"])
  }

  requestNewToken() {
    if (!this.verifyToken()) return
    this.requestedToken.set(true)
    this.authService.getNewVerificationToken(this.verifyToken()).subscribe((res) => {
      this.approvedToken.set(true)
    }, (err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          this.invalidToken.set(true);
          break;
        default:
          this.router.navigate(["/error500"]);
          return
      }
    })
  }
}
