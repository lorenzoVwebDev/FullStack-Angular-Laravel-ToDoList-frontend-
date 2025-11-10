import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditdeleteModal } from './editdelete.modal';

describe('EditdeleteModal', () => {
  let component: EditdeleteModal;
  let fixture: ComponentFixture<EditdeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditdeleteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditdeleteModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
