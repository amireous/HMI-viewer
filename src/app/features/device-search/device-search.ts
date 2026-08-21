import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, of, switchMap, tap } from 'rxjs';
import { Device } from '../../core/models/device';
import { ApiService } from '../../core/services/api';
import { SvgStateService } from '../../core/services/svg-state';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-device-search',
  styleUrl: './device-search.css',
  templateUrl: './device-search.html',
})
export class DeviceSearch {
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchResults = signal<Device[]>([]);
  protected readonly isLoading = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly apiService: ApiService,
    protected readonly svgStateService: SvgStateService
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        tap((query) => {
          if (query.trim().length < 2) {
            this.searchResults.set([]);
            this.isLoading.set(false);
          }
        }),
        filter((query) => query.trim().length >= 2),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading.set(true);
          return this.apiService.searchDevices(query.trim()).pipe(
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((devices) => this.searchResults.set(devices));
  }

  protected selectDevice(device: Device): void {
    this.svgStateService.selectDevice(device);

    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults.set([]);
  }
}
