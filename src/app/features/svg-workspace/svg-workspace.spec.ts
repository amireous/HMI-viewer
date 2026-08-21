import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgWorkspace } from './svg-workspace';

describe('SvgWorkspace', () => {
  let component: SvgWorkspace;
  let fixture: ComponentFixture<SvgWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgWorkspace],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SvgWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
