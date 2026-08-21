import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgStateService } from '../../core/services/svg-state';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-floating-modal',
  styleUrl: './floating-modal.css',
  templateUrl: './floating-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingModal {
  constructor(
    public readonly svgStateService: SvgStateService,
    private readonly renderer: Renderer2,
  ) {}

  protected saveAttributes(): void {
    const modalState = this.svgStateService.modalState();

    if (modalState.selectedElement) {
      for (const attribute of modalState.attributes) {
        this.renderer.setAttribute(modalState.selectedElement, attribute.name, attribute.value);
      }
    }

    this.svgStateService.closeModal();
  }
}
