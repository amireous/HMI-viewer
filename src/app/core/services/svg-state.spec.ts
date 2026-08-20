import { TestBed } from '@angular/core/testing';
import { SvgState } from './svg-state';

describe('SvgState', () => {
  let service: SvgState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
