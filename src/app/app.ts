import { Component, signal } from '@angular/core';
import { SvgWorkspace } from './features/svg-workspace/svg-workspace';
import { FloatingModal } from './features/floating-modal/floating-modal';

@Component({
  imports: [SvgWorkspace, FloatingModal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('i4twins-dashboard');
}
