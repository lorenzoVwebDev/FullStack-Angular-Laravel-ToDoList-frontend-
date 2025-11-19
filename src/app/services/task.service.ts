import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { JwtService } from './jwt.service';
//types
import { GetTasksType, TaskType } from 'types/types';
import { environment } from 'environments/environment.development';
import { env } from 'process';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  pageTasks = signal<TaskType[]>([])

  constructor(private http: HttpClient, private jwtApi: JwtService) {}

  getTasks(_user_id: string, pageIndex: number, pageSize: number) {
    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`);
    headers = headers.append("Content-Type", "application/x-www-form-urlencoded")
    const params = new HttpParams({
      fromObject: {
        "_user_id": _user_id,
        "page": pageIndex.toString(),
        "limit": pageSize.toString()
      }
    })

    return this.http.get<GetTasksType>(`${environment.apiUrl}tasks`, {
      headers,
      params,
      observe: 'response',
      withCredentials: true
    })
  }

  postTask(task: TaskType) {
    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`)

    return this.http.post(`${environment.apiUrl}tasks`, task, {
      headers,
      withCredentials: true,
      observe: "response"
    })
  }

  editTask(newTask: {
    idTask: string,
    description: string,
    taskDone?: "Y" | "N",
    dueDate?: number
  }) {
    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`)
/*     console.log(newTask) */
    return this.http.put(`${environment.apiUrl}tasks`, newTask, {
      headers,
      observe: "response",
      withCredentials: true
    })
  }

  deleteTask(id: string) {
    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`)

    return this.http.delete(`${environment.apiUrl}tasks/${id}`, {
      headers,
      observe: "response",
      withCredentials: true
    })
  }

  set setPageTasks(tasks: TaskType[]) {
    if (tasks === this.pageTasks()) return
    this.pageTasks.set(tasks)
  }

  get getPageTasks(): TaskType[] {
    return this.pageTasks()
  }

  searchTask(_user_id: string, keyword: string, pageIndex: number, pageSize: number) {
    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`)

    let params = new HttpParams({
      fromObject: {
        "_user_id": _user_id,
        "keyword": keyword,
        "page": pageIndex.toString(),
        "limit": pageSize.toString()
      }
    })

    return this.http.get(`${environment.apiUrl}tasks/searchtasks`, {
      headers,
      params,
      observe: "response",
      withCredentials: true
    })
  }

  filterTask(_user_id: string, page: number, limit: number, addedBefore?: any,  addedAfter?: any, taskSubject?: string | null, taskDone?: string | null) {
    if (!addedBefore && !addedAfter && !taskSubject && !taskDone) return null

    let headers = new HttpHeaders().append(environment.tokenHeader, `Bearer ${this.jwtApi.accessToken}`)

    const params = new HttpParams({
      fromObject: {
        "_user_id": _user_id,
        "addedBefore": addedBefore ? addedBefore : "" ,
        "addedAfter": addedAfter ? addedAfter : "",
        "taskSubject": taskSubject ? taskSubject : "",
        "taskDone": taskDone ? taskDone : "",
        "page": page.toString(),
        "limit": limit.toString()
      }
    })
    console.log(addedBefore);
    return this.http.get(`${environment.apiUrl}tasks/filtertasks`, {
      observe: "response",
      headers,
      params,
      withCredentials: true
    })
  }
}


