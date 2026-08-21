import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SvgWorkspace } from './features/svg-workspace/svg-workspace';
import { FloatingModal } from './features/floating-modal/floating-modal';
import { DeviceSearch } from './features/device-search/device-search';
import { SvgStateService } from './core/services/svg-state';

@Component({
  imports: [SvgWorkspace, FloatingModal, DeviceSearch],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly svgStateService = inject(SvgStateService);
}
