import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffWorkload } from './staff-workload';

describe('StaffWorkload', () => {
  let component: StaffWorkload;
  let fixture: ComponentFixture<StaffWorkload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffWorkload],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffWorkload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
