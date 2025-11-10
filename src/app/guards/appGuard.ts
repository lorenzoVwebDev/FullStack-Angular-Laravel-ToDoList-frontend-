import { inject } from "@angular/core";
import { JwtService } from "../services/jwt.service";
import  {AuthService} from "../services/auth.service";
import { RedirectCommand, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from "@angular/router";
import {map, of, catchError} from "rxjs"
import { environment } from "environments/environment.development";

export const todoListGuard: CanActivateFn = (snapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const jwtApi = inject(JwtService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (jwtApi.refreshTokenInPlace()) {

    if (jwtApi.accessToken && jwtApi.isAccessTokenExpired()) {

      return authService.getNewAccessToken().pipe(map((res: any) => {
        const accessToken = res.headers.get(environment.tokenHeader)
        if (!accessToken) return false
        jwtApi.setAccessToken = accessToken;
        return true
      }), catchError((err) => {
        const loginPage = router.parseUrl("/signin");
        new RedirectCommand(loginPage);
        return of(false);
      }))
    } else if (jwtApi.accessToken) {

      return true;
    } else {
      return authService.getNewAccessToken().pipe(map((res: any) => {
        const accessToken = res.headers.get(environment.tokenHeader)
        if (!accessToken) return false
        jwtApi.setAccessToken = accessToken;
        return true
      }), catchError((err) => {
        console.log(err)
        jwtApi.deleteRefreshToken()
        const loginPage = router.parseUrl("/signin");
        new RedirectCommand(loginPage);
        return of(false);
      }))
    }
  } else {
    const loginPage = router.parseUrl("/signin");
    return new RedirectCommand(loginPage);
  }
}







































