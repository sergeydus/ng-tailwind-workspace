import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { cn, mergeTailwindClasses, NgMerge, NgTailwindMerge } from './ng-tailwind-merge';

@Component({
  standalone: true,
  imports: [NgTailwindMerge, NgMerge],
  template: `
    <div id="tw-static" twMerge class="p-2 p-4 text-red-500"></div>
    <div id="tw-ng-class" twMerge class="p-2 text-red-500" [ngClass]="{ 'p-4': big() }"></div>
    <div id="tw-bound-class" twMerge [class]="boundClass()"></div>
    <div id="tw-bound-array" twMerge [class]="boundArray()"></div>
    <div id="tw-bound-object" twMerge [class]="boundObject()"></div>
    <div id="tw-class-property" twMerge class="p-2" [class.font-bold]="bold()"></div>
    <div id="tw-input-class" twMerge class="p-2" [ngClass]="{ 'p-4': big() }" [class.font-bold]="bold()"></div>
    <div id="merge-string" [merge]="mergeString()"></div>
    <div id="merge-array" [merge]="mergeArray()"></div>
    <div id="merge-object" [merge]="mergeObject()"></div>
    <div id="merge-static" class="static-x p-2" [merge]="mergeStatic()"></div>
    <div id="merge-class-property" class="p-2" [merge]="mergeStatic()" [class.font-bold]="bold()"></div>
  `,
})
class DirectiveHost {
  readonly big = signal(false);
  readonly bold = signal(true);
  readonly boundClass = signal('bg-red-500 bg-blue-500');
  readonly boundArray = signal(['p-2', 'p-4']);
  readonly boundObject = signal({ 'text-sm': true, 'text-lg': true });
  readonly mergeString = signal('p-2 p-4 bg-red-500 bg-blue-500');
  readonly mergeArray = signal(['p-2', 'p-4', 'text-sm']);
  readonly mergeObject = signal({ 'p-2': true, 'p-4': true, 'font-bold': true });
  readonly mergeStatic = signal(['p-4']);
}

@Component({
  standalone: true,
  imports: [NgTailwindMerge, NgClass],
  template: `<div twMerge class="p-2" [ngClass]="{ 'p-4': big() }"></div>`,
})
class CombinedNgClassHost {
  readonly big = signal(true);
}

async function renderHost() {
  const fixture = TestBed.createComponent(DirectiveHost);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;

  const element = (id: string): HTMLElement => {
    const match = host.querySelector<HTMLElement>(`#${id}`);
    if (!match) throw new Error(`Missing test element #${id}`);
    return match;
  };

  return { fixture, element };
}

function classes(element: HTMLElement): string[] {
  return Array.from(element.classList);
}

function expectClasses(element: HTMLElement, expected: string[]): void {
  expect(new Set(classes(element))).toEqual(new Set(expected));
}

describe('class utilities', () => {
  it('merges conflicts and conditional class values', () => {
    expect(cn()).toBe('');
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('p-2', null, false, ['text-sm', { hidden: true, italic: false }])).toBe(
      'p-2 text-sm hidden',
    );
  });

  it('exposes mergeTailwindClasses as an alias for cn', () => {
    const values = ['p-2 bg-red-500', ['p-4', { 'bg-blue-500': true }]] as const;
    expect(mergeTailwindClasses(...values)).toBe(cn(...values));
    expect(mergeTailwindClasses(...values)).toBe('p-4 bg-blue-500');
  });
});

describe('NgTailwindMerge host behavior', () => {
  it('merges conflicting static classes', async () => {
    const { element } = await renderHost();
    expect(element('tw-static').className).toBe('p-4 text-red-500');
  });

  it('records the current behavior of the string [class] input', async () => {
    const { element } = await renderHost();
    expectClasses(element('tw-bound-class'), ['bg-blue-500']);
  });

  it('accepts array and object [class] values', async () => {
    const { element } = await renderHost();
    expectClasses(element('tw-bound-array'), ['p-4']);
    expectClasses(element('tw-bound-object'), ['text-lg']);
  });

  it('replaces array and object [class] values without stale classes', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.boundArray.set(['p-8', 'm-2']);
    fixture.componentInstance.boundObject.set({ 'text-sm': true, 'text-lg': false });
    await fixture.whenStable();
    expectClasses(element('tw-bound-array'), ['p-8', 'm-2']);
    expectClasses(element('tw-bound-object'), ['text-sm']);
  });

  it('uses its own ngClass input without importing NgClass', async () => {
    const { fixture, element } = await renderHost();
    expectClasses(element('tw-ng-class'), ['p-2', 'text-red-500']);

    fixture.componentInstance.big.set(true);
    await fixture.whenStable();
    expectClasses(element('tw-ng-class'), ['text-red-500', 'p-4']);

    fixture.componentInstance.big.set(false);
    await fixture.whenStable();
    expectClasses(element('tw-ng-class'), ['p-2', 'text-red-500']);
  });

  it('preserves a class-property binding on first render', async () => {
    const { element } = await renderHost();
    expect(classes(element('tw-class-property'))).toContain('font-bold');
    expect(classes(element('tw-class-property'))).toContain('p-2');
  });

  it('removes a class-property binding when it becomes false', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.bold.set(false);
    await fixture.whenStable();
    expect(classes(element('tw-class-property'))).not.toContain('font-bold');
    expect(classes(element('tw-class-property'))).toContain('p-2');
  });

  it('preserves a class-property binding when ngClass input changes', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.big.set(true);
    await fixture.whenStable();

    expect(classes(element('tw-input-class'))).toContain('font-bold');
    expect(classes(element('tw-input-class'))).toContain('p-4');
    expect(classes(element('tw-input-class'))).not.toContain('p-2');
  });

  it('keeps a re-enabled class-property binding through later input updates', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.bold.set(false);
    await fixture.whenStable();
    fixture.componentInstance.bold.set(true);
    await fixture.whenStable();
    expect(classes(element('tw-input-class'))).toContain('font-bold');

    fixture.componentInstance.big.set(true);
    await fixture.whenStable();
    expect(classes(element('tw-input-class'))).toContain('font-bold');
  });

  it('has deterministic behavior when Angular NgClass is also imported', async () => {
    const fixture = TestBed.createComponent(CombinedNgClassHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(classes(element)).toContain('p-4');
    expect(classes(element)).not.toContain('p-2');

    fixture.componentInstance.big.set(false);
    await fixture.whenStable();
    expect(classes(element)).toContain('p-2');
    expect(classes(element)).not.toContain('p-4');

    fixture.componentInstance.big.set(true);
    await fixture.whenStable();
    expect(classes(element)).toContain('p-4');
    expect(classes(element)).not.toContain('p-2');
  });
});

describe('NgMerge host behavior', () => {
  it('handles string, array, and object inputs', async () => {
    const { element } = await renderHost();
    expectClasses(element('merge-string'), ['p-4', 'bg-blue-500']);
    expectClasses(element('merge-array'), ['p-4', 'text-sm']);
    expectClasses(element('merge-object'), ['p-4', 'font-bold']);
  });

  it('updates classes without leaving stale values', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.mergeString.set('p-4 p-8 bg-blue-500 bg-green-500');
    fixture.componentInstance.mergeArray.set(['p-8', 'text-lg']);
    fixture.componentInstance.mergeObject.set({ 'p-2': true, 'p-4': false, 'font-bold': false });
    await fixture.whenStable();

    expectClasses(element('merge-string'), ['p-8', 'bg-green-500']);
    expectClasses(element('merge-array'), ['p-8', 'text-lg']);
    expectClasses(element('merge-object'), ['p-2']);
  });

  it('preserves static classes with provisional input-over-static conflict precedence', async () => {
    const { element } = await renderHost();
    expect(classes(element('merge-static'))).toContain('static-x');
    expect(classes(element('merge-static'))).not.toContain('p-2');
    expect(classes(element('merge-static'))).toContain('p-4');
  });

  it('preserves static classes after the merge input changes', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.mergeStatic.set(['p-8']);
    await fixture.whenStable();

    expect(classes(element('merge-static'))).toContain('static-x');
    expect(classes(element('merge-static'))).not.toContain('p-2');
    expect(classes(element('merge-static'))).toContain('p-8');
  });

  it('preserves a class-property binding on first render', async () => {
    const { element } = await renderHost();
    expect(classes(element('merge-class-property'))).toContain('font-bold');
    expect(classes(element('merge-class-property'))).toContain('p-4');
  });

  it('preserves a class-property binding when merge input changes', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.mergeStatic.set(['p-8']);
    await fixture.whenStable();
    expect(classes(element('merge-class-property'))).toContain('font-bold');
    expect(classes(element('merge-class-property'))).toContain('p-8');
  });

  it('follows class-property toggles independently of merge updates', async () => {
    const { fixture, element } = await renderHost();
    fixture.componentInstance.bold.set(false);
    await fixture.whenStable();
    expectClasses(element('merge-class-property'), ['p-4']);

    fixture.componentInstance.mergeStatic.set(['p-8']);
    fixture.componentInstance.bold.set(true);
    await fixture.whenStable();
    expectClasses(element('merge-class-property'), ['p-8', 'font-bold']);
  });
});
