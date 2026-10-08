import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnDetails } from './return-details';

describe('ReturnDetails', () => {
  let component: ReturnDetails;
  let fixture: ComponentFixture<ReturnDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
