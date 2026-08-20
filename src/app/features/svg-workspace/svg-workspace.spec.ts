import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgWorkspace } from './svg-workspace';

describe('SvgWorkspace', () => {
  let component: SvgWorkspace;
  let fixture: ComponentFixture<SvgWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(SvgWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
