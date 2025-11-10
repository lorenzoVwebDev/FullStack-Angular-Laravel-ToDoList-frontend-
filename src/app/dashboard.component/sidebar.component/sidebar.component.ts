import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { type RoutesObj } from 'types/types';
const RoutesArray = [
  {
    name: "Main Dashboard",
    route: "maindashboard",
    icon: "dashboard"
  }, {
    name: "To Do List",
    route: "todolist",
    icon: "list"
  }, {
    name: "Contacts",
    route: "contacts",
    icon: "contact_mail"
  }
];

@Component({
  selector: 'sidebar-component',
  imports: [MatIconModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sideBarStatusEmitter = output<boolean>()
  sideBarStatus = input<boolean>(false);
  routesArray: RoutesObj[] = RoutesArray;

  toggleSideBar() {
    if (!this.sideBarStatus()) this.sideBarStatusEmitter.emit(true)
    else this.sideBarStatusEmitter.emit(false)
  }
}
