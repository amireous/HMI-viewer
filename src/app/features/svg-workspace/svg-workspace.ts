import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, Renderer2, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgStateService } from '../../core/services/svg-state';
 
@Component({
  imports: [],
  selector: 'app-svg-workspace',
  styleUrl: './svg-workspace.css',
  templateUrl: './svg-workspace.html',
})
export class SvgWorkspace {
  protected readonly svgContent = signal<SafeHtml>('');
  private readonly selectedElements = new Set<SVGElement>();

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly svgStateService: SvgStateService
  ) {
    this.http.get('/plant.svg', { responseType: 'text' }).subscribe((svg) => {
      this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    });
  }

  @HostListener('click', ['$event'])
  protected onSvgClick(event: MouseEvent): void {
    const target = event.target;
    // console.log('Clicked target:', target);
    if (!(target instanceof Element)) {
      this.svgStateService.closeModal(); // اگر جای نامربوط کلیک شد، مودال بسته شود
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

    const attributesList = Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    }));

    console.log('---------=============', event, attributesList, element)

    this.svgStateService.openModal({
      x: event.clientX,
      y: event.clientY,
      attributes: attributesList,
      selectedElement: element
    });
  }

@HostListener('contextmenu', ['$event'])
protected onSvgContextMenu(event: MouseEvent): void {
  event.preventDefault();

  const svgRoot = this.getSvgRoot() as SVGSVGElement;
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
  
  this.renderer.setAttribute(textElement, 'fill', '#334155');
  this.renderer.setAttribute(textElement, 'font-size', '14');

  this.renderer.appendChild(textElement, this.renderer.createText(label));

  const deleteButton = this.renderer.createElement('text', 'svg');
  this.renderer.setAttribute(deleteButton, 'x', `${x + 2 + label.length * 8}`);
  this.renderer.setAttribute(deleteButton, 'y', `${y}`);
  this.renderer.setAttribute(deleteButton, 'data-label-delete', '');
  this.renderer.setAttribute(deleteButton, 'fill', '#b91c1c');
  this.renderer.setAttribute(deleteButton, 'font-size', '12');
  this.renderer.setAttribute(deleteButton, 'font-weight', 'bold');
  this.renderer.setAttribute(deleteButton, 'cursor', 'pointer');
  this.renderer.appendChild(deleteButton, this.renderer.createText('x'));

  this.renderer.appendChild(labelGroup, textElement);
  this.renderer.appendChild(labelGroup, deleteButton);
  this.renderer.appendChild(svgRoot, labelGroup);
}

  private getSvgRoot(): SVGSVGElement | null {
    // console.log('Searching for SVG root in:', this.elementRef.nativeElement);
    return this.elementRef.nativeElement.querySelector('svg');
  }
}
