import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  HostListener,
  inject,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EMPTY, interval } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { startWith, switchMap } from 'rxjs/operators';
import { SvgStateService } from '../../core/services/svg-state';
import { ApiService } from '../../core/services/api';

@Component({
  imports: [],
  selector: 'app-svg-workspace',
  styleUrl: './svg-workspace.css',
  templateUrl: './svg-workspace.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgWorkspace {
  protected readonly svgContent = signal<SafeHtml>('');
  private readonly selectedElements = new Set<SVGElement>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly svgStateService: SvgStateService,
    private readonly apiService: ApiService,
  ) {
    this.http
      .get('./plant.svg', { responseType: 'text' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(catchError(() => EMPTY))
      .subscribe((svg) => this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svg)));

    effect(() => {
      const selectedId = this.svgStateService.selectedDeviceId();
      const isPreview = this.svgStateService.previewMode();
      this.svgContent();
      const svgRoot = this.getSvgRoot();

      for (const selectedElement of this.selectedElements) {
        this.renderer.removeClass(selectedElement, 'highlighted');
      }
      this.selectedElements.clear();

      if (!isPreview && selectedId && svgRoot) {
        const targetElement = this.findDeviceElement(svgRoot, selectedId);

        if (targetElement) {
          this.renderer.addClass(targetElement, 'highlighted');
          this.selectedElements.add(targetElement);
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }
    });

    effect((onCleanup) => {
      const isPreview = this.svgStateService.previewMode();
      this.svgContent();
      const svgRoot = this.getSvgRoot();

      if (isPreview) {
        const sub = interval(5000)
          .pipe(
            startWith(0),
            switchMap(() => this.apiService.searchDevices('')),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe((devices) => {
            if (!svgRoot) return;

            devices.forEach((device) => {
              const el = this.findDeviceElement(svgRoot, device.id);
              if (el) {
                this.renderer.setAttribute(el, 'data-status', device.status);
              }
            });
          });

        onCleanup(() => {
          sub.unsubscribe();
          if (svgRoot) {
            const elements = svgRoot.querySelectorAll('[data-status]');
            elements.forEach((el) => this.renderer.removeAttribute(el, 'data-status'));
          }
        });
      }
    });
  }

  @HostListener('click', ['$event'])
  protected onSvgClick(event: MouseEvent): void {
    if (this.svgStateService.previewMode()) return;
    const target = event.target;

    if (!(target instanceof Element)) {
      this.svgStateService.closeModal();
      return;
    }

    const deleteAction = target.closest<SVGElement>('[data-label-delete]');
    if (deleteAction) {
      const labelGroup = deleteAction.closest<SVGGElement>('[data-label-group]');
      if (labelGroup) {
        this.renderer.removeChild(this.getSvgRoot(), labelGroup);
      }
      return;
    }

    const element = target.closest<SVGElement>('rect, path, circle, g');
    const svgRoot = this.getSvgRoot();

    if (!element || !svgRoot?.contains(element)) {
      this.svgStateService.closeModal();
      return;
    }

    for (const selectedElement of this.selectedElements) {
      this.renderer.removeClass(selectedElement, 'highlighted');
    }

    this.selectedElements.clear();
    this.renderer.addClass(element, 'highlighted');
    this.selectedElements.add(element);

    const attributesList = Array.from(element.attributes).map((attr) => ({
      name: attr.name,
      value: attr.value,
    }));

    this.svgStateService.openModal({
      x: event.clientX,
      y: event.clientY,
      attributes: attributesList,
      selectedElement: element,
    });
  }

  @HostListener('contextmenu', ['$event'])
  protected onSvgContextMenu(event: MouseEvent): void {
    event.preventDefault();
    if (this.svgStateService.previewMode()) return;
    const svgRoot = this.getSvgRoot();
    if (!svgRoot) {
      return;
    }

    const pt = svgRoot.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const screenCTM = svgRoot.getScreenCTM();
    if (!screenCTM) return;

    const cursorPoint = pt.matrixTransform(screenCTM.inverse());
    const x = cursorPoint.x;
    const y = cursorPoint.y;

    const label = window.prompt('Enter label text:');

    if (!label) {
      return;
    }

    const labelGroup = this.renderer.createElement('g', 'svg');
    this.renderer.setAttribute(labelGroup, 'data-label-group', '');

    const textElement = this.renderer.createElement('text', 'svg');

    this.renderer.setAttribute(textElement, 'x', `${x}`);
    this.renderer.setAttribute(textElement, 'y', `${y}`);

    this.renderer.setAttribute(textElement, 'dominant-baseline', 'hanging');

    this.renderer.addClass(textElement, 'svg-label');

    this.renderer.appendChild(textElement, this.renderer.createText(label));

    const deleteButton = this.renderer.createElement('text', 'svg');
    this.renderer.setAttribute(deleteButton, 'x', `${x + 2 + label.length * 8}`);
    this.renderer.setAttribute(deleteButton, 'y', `${y}`);
    this.renderer.setAttribute(deleteButton, 'data-label-delete', '');
    this.renderer.addClass(deleteButton, 'svg-label-delete');
    this.renderer.appendChild(deleteButton, this.renderer.createText('x'));

    this.renderer.appendChild(labelGroup, textElement);
    this.renderer.appendChild(labelGroup, deleteButton);
    this.renderer.appendChild(svgRoot, labelGroup);
  }

  private getSvgRoot(): SVGSVGElement | null {
    return this.elementRef.nativeElement.querySelector('svg');
  }

  private findDeviceElement(svgRoot: SVGSVGElement, deviceId: string): SVGElement | null {
    const normalizedDeviceId = deviceId.toLowerCase();
    return (
      Array.from(svgRoot.querySelectorAll<SVGElement>('[data-device-id]')).find(
        (element) => element.dataset['deviceId']?.toLowerCase() === normalizedDeviceId,
      ) ?? null
    );
  }
}
