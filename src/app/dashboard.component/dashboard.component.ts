import { Component, signal, WritableSignal } from '@angular/core';
import { NgClass } from '@angular/common';
import { GlobalFooter } from '../common/global.footer/global.footer';
import { GlobalHeader } from '../common/global.header/global.header';
import { SidebarComponent } from './sidebar.component/sidebar.component';
import { DashboardOutlet } from './dashboard.outlet/dashboard.outlet';
@Component({
  selector: 'app-dashboard.component',
  imports: [GlobalFooter, GlobalHeader, SidebarComponent, DashboardOutlet, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  sideBarStatus: WritableSignal<boolean> = signal<boolean>(false)
}
