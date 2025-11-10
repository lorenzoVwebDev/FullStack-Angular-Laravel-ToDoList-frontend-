import {inject} from '@angular/core'
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Router, RedirectCommand, ActivatedRoute, NavigationExtras } from '@angular/router';
import {map, of, catchError} from "rxjs"
import { environment } from "environments/environment.development";
import { JwtService } from "../services/jwt.service";
import  {AuthService} from "../services/auth.service";

export const loggedInResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const jwtApi = inject(JwtService);

  if (jwtApi.refreshTokenInPlace()) {
    return true
  } else {
    return false
  }
}

