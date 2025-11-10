
export type RoutesObj = {
  name: string,
  route: string,
  icon: string
}

export type UserInfoType = {
  roles: number[],
  username: string;
  _id: string
}

export type ChangePwrType = {
    username: string;
    oldPassword: string;
    newPassword: string;
}

export type TaskType = {
  id?: any,
  _user_id: string,
  label?: string,
  name: string,
  description: string,
  dueDate?: number,
  addDate?: number,
  done: boolean
}

export type GetTasksType = {
  tasks: TaskType[],
  totalUserTasks: number
}

export type SearchTaskResponseType = {
  filteredTasks: TaskType[],
  totalFilteredTasks: number
}

export type SubjectArrayType = ["school", "work",  "family", "friends", "hobbies"]

export interface Slide {
  icon: string;
  title: string;
  description: string;
}
export type SubjectLiterals = SubjectArrayType[number]
