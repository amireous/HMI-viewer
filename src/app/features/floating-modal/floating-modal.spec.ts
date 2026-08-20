import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingModal } from './floating-modal';

describe('FloatingModal', () => {
  let component: FloatingModal;
  let fixture: ComponentFixture<FloatingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingModal],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
