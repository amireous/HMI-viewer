import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceSearch } from './device-search';

describe('DeviceSearch', () => {
  let component: DeviceSearch;
  let fixture: ComponentFixture<DeviceSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceSearch],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
