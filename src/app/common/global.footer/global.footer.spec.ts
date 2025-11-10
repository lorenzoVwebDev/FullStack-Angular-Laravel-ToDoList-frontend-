import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalFooter } from './global.footer';

describe('GlobalFooter', () => {
  let component: GlobalFooter;
  let fixture: ComponentFixture<GlobalFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
