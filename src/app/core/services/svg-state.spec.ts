import { TestBed } from '@angular/core/testing';
import { SvgStateService } from './svg-state';

describe('SvgStateService', () => {
  let service: SvgStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
