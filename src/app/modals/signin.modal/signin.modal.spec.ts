import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninModal } from './signin.modal';

describe('SigninModal', () => {
  let component: SigninModal;
  let fixture: ComponentFixture<SigninModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
