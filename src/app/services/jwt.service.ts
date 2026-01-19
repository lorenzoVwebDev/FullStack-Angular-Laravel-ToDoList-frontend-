import { Injectable } from '@angular/core';
import { jwtDecode as jwt_decode} from "jwt-decode";
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'environments/environment.development';
import dayjs from 'dayjs'
//types
import { type UserInfoType } from 'types/types';
@Injectable({
  providedIn: 'root'
})
export class JwtService {
  accessToken: string = "";
  decodedAccessToken: {[key: string]: string} | undefined = undefined
  constructor( private cookieService: CookieService) {}

  set setAccessToken(token: string) {
    if (token) this.accessToken = token
  }

  decodeAccessToken() {
    if (this.accessToken) this.decodedAccessToken = jwt_decode(this.accessToken)
  }

  getDecodedToken() {
    if (this.decodedAccessToken) return this.decodedAccessToken
    else if (this.accessToken) return jwt_decode(this.accessToken)
    else return undefined
  }

  getAccessTokenUser() {
    if (this.decodedAccessToken) {
      const tokenUser = this.decodedAccessToken['userInfo'] as unknown as UserInfoType
      return tokenUser.username;
    } else {
      if (this.accessToken) {
        this.decodeAccessToken()
        if (this.decodedAccessToken) {
          const tokenUser = this.decodedAccessToken['userInfo'] as unknown as UserInfoType
          return tokenUser.username;
        } else return undefined
      } else return undefined
    }
  }

  getExpirationTime() {
    if (this.decodedAccessToken) {
      const tokenExp = this.decodedAccessToken['exp']
      return tokenExp;
    } else {
      if (this.accessToken) {
        this.decodeAccessToken()
        if (this.decodedAccessToken) {
          const tokenExp = this.decodedAccessToken['exp']
          return tokenExp;
        } else return undefined
      } else return undefined
    }
  }

  getAccessTokenUserId() {
    if (this.decodedAccessToken) {
      const token_id = this.decodedAccessToken['userInfo'] as unknown as UserInfoType
      return token_id._id;
    } else {
      if (this.accessToken) {
        this.decodeAccessToken()
        if (this.decodedAccessToken) {
          const token_id = this.decodedAccessToken['userInfo'] as unknown as UserInfoType
          return token_id._id;
        } else return undefined
      } else return undefined
    }
  }

  isAccessTokenExpired() {
    const expirationTime = this.getExpirationTime();
    if (!expirationTime) return undefined;
    const currentUnix = dayjs().unix();
    return currentUnix > Number(expirationTime) ? 'expired' : "not-expired"
  }

  refreshTokenInPlace() {
    if (this.cookieService.get("refreshToken")) return true
    else return false
  }

  deleteRefreshToken() {
    let bool = false;
    document.cookie.split("; ").forEach((cookie) => {
      if (cookie.includes("refreshToken=")) {
        document.cookie = `refreshToken=; path=/; domain=${environment.cookieDomain}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        bool = true
      }
    })

    return bool
  }
}
