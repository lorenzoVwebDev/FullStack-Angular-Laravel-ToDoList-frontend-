import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersModal } from './filters.modal';

describe('FiltersModal', () => {
  let component: FiltersModal;
  let fixture: ComponentFixture<FiltersModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
