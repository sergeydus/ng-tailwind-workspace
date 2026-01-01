import { Directive, ElementRef, inject, effect, input, Input } from '@angular/core';
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

@Directive({
  selector: '[twClass]',
  standalone: true
})
export class NgTwClass {
  private el = inject(ElementRef<HTMLElement>);
  twClass = input<string>('');
  @Input() set class(value: string) {
    this._staticClass = value;
  }
  private _staticClass = '';

  constructor() {
    effect(() => {
      this.el.nativeElement.setAttribute('class', cn(this._staticClass, this.twClass()));
    });
  }
}

@Directive({
  selector: '[merge]',
  standalone: true
})
export class NgMergeLegacy {
  private el = inject(ElementRef<HTMLElement>);
  @Input() set merge(value: ClassValue | ClassValue[]) {
    this._mergeValue = value;
    this._applyClasses();
  }
  private _mergeValue: ClassValue | ClassValue[] = [];

  private _applyClasses() {
    const classes = Array.isArray(this._mergeValue) ? this._mergeValue as ClassValue[] : [this._mergeValue];
    this.el.nativeElement.setAttribute('class', cn(...classes));
  }

  constructor() {
    this._applyClasses();
  }
}
