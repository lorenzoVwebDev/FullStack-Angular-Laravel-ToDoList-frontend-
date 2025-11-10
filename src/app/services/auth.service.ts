import {Injectable, signal, WritableSignal} from "@angular/core"
import {HttpClient, HttpHeaders} from "@angular/common/http"
import { JwtService } from "./jwt.service"
import { environment}  from "environments/environment.development"
import { ChangePwrType } from "types/types"
@Injectable({
  providedIn: "root"
})

export class AuthService {
  isSignInActive: WritableSignal<boolean> = signal<boolean>(false)
  constructor(private http: HttpClient, private jwtApi: JwtService) {}

  signIn(username: string, password: string) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    })

    const postObj = {
      username,
      password
    }

    return this.http.post(`${environment.apiUrl}authentication/signin`, postObj, {
      observe: "response",
      withCredentials: true,
      headers
    })
  }

  signUp(username: string, email: string, password: string, avatar?: File) {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("email", email)
    formData.append("password", password)
    avatar ? formData.append("avatar", avatar) : undefined

    return this.http.post(`${environment.apiUrl}authentication/signup`, formData, {
      observe: "response",
      withCredentials: true
    })
  }

  logOut() {
    const headers = new HttpHeaders().append(`${environment.tokenHeader}`, `Bearer ${this.jwtApi.accessToken}`)

    return this.http.delete(`${environment.apiUrl}authentication/logout`, {
      withCredentials: true,
      headers,
      observe: "response"
    })
  }

  changePwr(changePwrObj: ChangePwrType) {
    const headers = new HttpHeaders().append(`${environment.tokenHeader}`, `Bearer ${this.jwtApi.accessToken}`)

    return this.http.post(`${environment.apiUrl}authentication/changepwr`, changePwrObj, {
      observe: "response",
      withCredentials: true,
      headers
    })
  }

  getNewAccessToken() {
    return this.http.get(`${environment.apiUrl}refreshtoken`, {
      withCredentials: true,
      observe: "response"
    })
  }
}
