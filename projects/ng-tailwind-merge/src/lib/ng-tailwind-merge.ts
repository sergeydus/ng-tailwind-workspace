import { Directive, ElementRef, inject, effect, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function mergeTailwindClasses(...inputs: ClassValue[]): string {
  return cn(...inputs);
}

@Directive({
  selector: '[twMerge]',
  standalone: true
})
export class NgTailwindMerge {
  private el = inject(ElementRef<HTMLElement>);
  class = input<string>('');
  ngClass = input<Record<string, boolean> | string | string[] | null>(null);

  constructor() {
    effect(() => {
      this.el.nativeElement.setAttribute('class', cn(this.class(), this.ngClass()));
    });
  }
}

@Directive({
  selector: '[merge]',
  standalone: true
})
export class NgMerge {
  private el = inject(ElementRef<HTMLElement>);
  merge = input<ClassValue | ClassValue[]>([]);

  constructor() {
    effect(() => {
      const classes = Array.isArray(this.merge()) ? this.merge() as ClassValue[] : [this.merge()];
      this.el.nativeElement.setAttribute('class', cn(...classes));
    });
  }
}
