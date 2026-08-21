import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { Device } from '../../core/models/device';
import { ApiService } from '../../core/services/api';
import { SvgStateService } from '../../core/services/svg-state';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-device-search',
  styleUrl: './device-search.css',
  templateUrl: './device-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceSearch {
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchResults = signal<Device[]>([]);
  protected readonly isLoading = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly apiService: ApiService,
    protected readonly svgStateService: SvgStateService,
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((query) => query.trim()),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) {
            this.searchResults.set([]);
            this.isLoading.set(false);
            return of([] as Device[]);
          }

          this.isLoading.set(true);
          return this.apiService
            .searchDevices(query)
            .pipe(finalize(() => this.isLoading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((devices) => this.searchResults.set(devices));
  }

  protected selectDevice(device: Device): void {
    this.svgStateService.selectDevice(device);

    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults.set([]);
  }
}
