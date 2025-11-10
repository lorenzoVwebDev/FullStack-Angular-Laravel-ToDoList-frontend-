import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtaskModal } from './addtask.modal';

describe('AddtaskModal', () => {
  let component: AddtaskModal;
  let fixture: ComponentFixture<AddtaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddtaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddtaskModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
