import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangepwrComponent } from './changepwr.component';

describe('ChangepwrComponent', () => {
  let component: ChangepwrComponent;
  let fixture: ComponentFixture<ChangepwrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangepwrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangepwrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
