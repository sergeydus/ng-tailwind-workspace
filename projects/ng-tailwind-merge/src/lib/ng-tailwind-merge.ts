import { computed, Directive, effect, ElementRef, HostAttributeToken, inject, input, Renderer2 } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function mergeTailwindClasses(...inputs: ClassValue[]): string {
  return cn(...inputs);
}

function removeSupersededClasses(
  element: HTMLElement,
  renderer: Renderer2,
  inputs: ClassValue[],
  mergedClasses: string,
): void {
  // Remove only classes supplied by this directive's inputs. A class token shared with
  // an independent [class.foo] binding cannot be distinguished here; see the README.
  const retained = new Set(mergedClasses.split(/\s+/));
  for (const className of clsx(inputs).split(/\s+/)) {
    if (className && !retained.has(className)) {
      renderer.removeClass(element, className);
    }
  }
}

@Directive({
  selector: '[twMerge]',
  standalone: true,
  host: { '[class]': 'mergedClasses()' },
})
export class NgTailwindMerge {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  readonly class = input<ClassValue>('');
  readonly ngClass = input<Record<string, boolean> | string | string[] | null>(null);
  protected readonly mergedClasses = computed(() => cn(this.class(), this.ngClass()));

  constructor() {
    effect(() => {
      removeSupersededClasses(
        this.element.nativeElement,
        this.renderer,
        [this.class(), this.ngClass()],
        this.mergedClasses(),
      );
    });
  }
}

@Directive({
  selector: '[merge]',
  standalone: true,
  host: { '[class]': 'mergedClasses()' },
})
export class NgMerge {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly staticClasses = inject(new HostAttributeToken('class'), { optional: true }) ?? '';
  readonly merge = input<ClassValue | ClassValue[]>([]);
  protected readonly mergedClasses = computed(() => cn(this.staticClasses, this.merge()));

  constructor() {
    effect(() => {
      removeSupersededClasses(
        this.element.nativeElement,
        this.renderer,
        [this.staticClasses, this.merge()],
        this.mergedClasses(),
      );
    });
  }
}
