import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOutlet } from './dashboard.outlet';

describe('DashboardOutlet', () => {
  let component: DashboardOutlet;
  let fixture: ComponentFixture<DashboardOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOutlet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
