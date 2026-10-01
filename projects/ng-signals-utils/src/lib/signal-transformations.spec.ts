import { Injector, signal, type Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { combineSignals, debounceSignal, distinctSignal, filterSignal, mapSignal } from '../public-api';

describe('signal transformations', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  afterEach(() => vi.useRealTimers());

  it('maps initial and updated values to a new type', () => {
    const source = signal(5);
    const mapped = mapSignal(source, (value) => `value-${value * 2}`);
    expectTypeOf(mapped).toEqualTypeOf<Signal<string>>();
    expect(mapped()).toBe('value-10');
    source.set(10);
    expect(mapped()).toBe('value-20');
  });

  it('retains the last accepted filter value synchronously and exposes a readonly signal', () => {
    const source = signal(1);
    const filtered = filterSignal(source, (value) => value % 2 === 0, 0);
    expectTypeOf(filtered).toEqualTypeOf<Signal<number>>();
    expect(filtered()).toBe(0);
    source.set(2);
    expect(filtered()).toBe(2);
    source.set(3);
    expect(filtered()).toBe(2);
    source.set(4);
    expect(filtered()).toBe(4);
    expect('set' in filtered).toBe(false);
  });

  it('filters only when the source changes, not when predicate dependencies change', () => {
    const source = signal(4);
    const threshold = signal(5);
    const filtered = filterSignal(source, (value) => value > threshold(), 0);
    expect(filtered()).toBe(0);
    threshold.set(3);
    expect(filtered()).toBe(0);
    source.set(6);
    expect(filtered()).toBe(6);
  });

  it('debounces updates, keeps the initial value, and does not reset for equal source values', () => {
    vi.useFakeTimers();
    const source = signal('initial');
    const debounced = TestBed.runInInjectionContext(() => debounceSignal(source, 100));
    TestBed.tick();
    expect(debounced()).toBe('initial');
    source.set('next');
    TestBed.tick();
    vi.advanceTimersByTime(50);
    expect(debounced()).toBe('initial');
    source.set('next');
    TestBed.tick();
    vi.advanceTimersByTime(50);
    expect(debounced()).toBe('next');
  });

  it('cancels a pending debounce when its injector is destroyed', () => {
    vi.useFakeTimers();
    const source = signal('initial');
    const debounced = TestBed.runInInjectionContext(() => debounceSignal(source, 100));
    TestBed.tick();
    source.set('pending');
    TestBed.tick();
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(100);
    expect(debounced()).toBe('initial');
  });

  it('accepts an explicit injector outside an injection context', () => {
    vi.useFakeTimers();
    const source = signal(1);
    expect(() => debounceSignal(source, 10)).toThrow(/NG0203/);
    const injector = TestBed.inject(Injector);
    const debounced = debounceSignal(source, 10, { injector });
    TestBed.tick();
    source.set(2);
    TestBed.tick();
    vi.advanceTimersByTime(10);
    expect(debounced()).toBe(2);
  });

  it('combines an empty list and preserves heterogeneous tuple types', () => {
    const empty = combineSignals([]);
    expect(empty()).toEqual([]);
    const count = signal(1);
    const label = signal('one');
    const combined = combineSignals([count, label]);
    expectTypeOf(combined).toEqualTypeOf<Signal<readonly [number, string]>>();
    if (false) {
      // @ts-expect-error combineSignals accepts signals, not plain values.
      combineSignals([count, 1]);
    }
    expect(combined()).toEqual([1, 'one']);
    count.set(2);
    label.set('two');
    expect(combined()).toEqual([2, 'two']);
  });

  it('returns distinct values synchronously outside injection context', () => {
    const source = signal(1);
    const distinct = distinctSignal(source);
    expect(distinct()).toBe(1);
    source.set(1);
    expect(distinct()).toBe(1);
    source.set(2);
    expect(distinct()).toBe(2);
  });

  it('uses a custom equality function to retain the last distinct value', () => {
    const first = { id: 1, label: 'first' };
    const source = signal(first);
    const distinct = distinctSignal(source, (a, b) => a.id === b.id);
    expect(distinct()).toBe(first);
    source.set({ id: 1, label: 'ignored' });
    expect(distinct()).toBe(first);
    const second = { id: 2, label: 'second' };
    source.set(second);
    expect(distinct()).toBe(second);
  });
});
