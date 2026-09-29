import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounceEffect, throttleEffect, watchSignal, watchUntil } from '../public-api';

describe('signal effect helpers', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  afterEach(() => vi.useRealTimers());

  it('watches changed values with the previous value and ignores callback dependencies', () => {
    const source = signal(0);
    const incidental = signal(0);
    const calls: [number, number | undefined][] = [];
    const ref = TestBed.runInInjectionContext(() => watchSignal(source, (value, previous) => {
      incidental();
      calls.push([value, previous]);
    }));
    TestBed.tick();
    expect(calls).toEqual([]);
    source.set(1);
    TestBed.tick();
    expect(calls).toEqual([[1, 0]]);
    incidental.set(1);
    TestBed.tick();
    expect(calls).toEqual([[1, 0]]);
    ref.destroy();
    source.set(2);
    TestBed.tick();
    expect(calls).toEqual([[1, 0]]);
  });

  it('does not report a change when a source returns to its previous value before the effect runs', () => {
    const source = signal('A');
    const calls: [string, string | undefined][] = [];
    TestBed.runInInjectionContext(() => watchSignal(source, (value, previous) => {
      calls.push([value, previous]);
    }));
    TestBed.tick();
    source.set('B');
    source.set('A');
    TestBed.tick();
    expect(calls).toEqual([]);
    source.set('B');
    TestBed.tick();
    expect(calls).toEqual([['B', 'A']]);
  });

  it('runs watchUntil once when the predicate is true on its first run', () => {
    const source = signal(2);
    const calls: number[] = [];
    TestBed.runInInjectionContext(() => watchUntil(source, value => value > 1, value => calls.push(value)));
    TestBed.tick();
    expect(calls).toEqual([2]);
    source.set(3);
    TestBed.tick();
    expect(calls).toEqual([2]);
  });

  it('tracks only watchUntil source and stops on injector destruction', () => {
    const source = signal(1);
    const threshold = signal(2);
    const incidental = signal(0);
    const calls: number[] = [];
    TestBed.runInInjectionContext(() => watchUntil(source, value => {
      incidental();
      return value > threshold();
    }, value => calls.push(value)));
    TestBed.tick();
    threshold.set(0);
    incidental.set(1);
    TestBed.tick();
    expect(calls).toEqual([]);
    source.set(3);
    TestBed.tick();
    expect(calls).toEqual([3]);

    const pending = signal(0);
    const later: number[] = [];
    TestBed.runInInjectionContext(() => watchUntil(pending, value => value > 0, value => later.push(value)));
    TestBed.tick();
    TestBed.resetTestingModule();
    pending.set(1);
    expect(later).toEqual([]);
  });

  it('throttles with an immediate leading call and the latest trailing value', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const source = signal(0);
    const incidental = signal(0);
    const calls: number[] = [];
    const ref = TestBed.runInInjectionContext(() => throttleEffect(source, value => {
      incidental();
      calls.push(value);
    }, 100));
    TestBed.tick();
    expect(calls).toEqual([0]);
    source.set(1);
    TestBed.tick();
    vi.advanceTimersByTime(50);
    source.set(2);
    TestBed.tick();
    vi.advanceTimersByTime(49);
    expect(calls).toEqual([0]);
    vi.advanceTimersByTime(1);
    expect(calls).toEqual([0, 2]);
    incidental.set(1);
    TestBed.tick();
    expect(calls).toEqual([0, 2]);
    source.set(3);
    TestBed.tick();
    ref.destroy();
    vi.advanceTimersByTime(100);
    expect(calls).toEqual([0, 2]);
  });

  it('debounces the initial and later values and cancels pending work on destroy', () => {
    vi.useFakeTimers();
    const source = signal('initial');
    const calls: string[] = [];
    const ref = TestBed.runInInjectionContext(() => debounceEffect(source, value => calls.push(value), 100));
    TestBed.tick();
    vi.advanceTimersByTime(50);
    source.set('next');
    TestBed.tick();
    vi.advanceTimersByTime(99);
    expect(calls).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(calls).toEqual(['next']);
    source.set('pending');
    TestBed.tick();
    ref.destroy();
    vi.advanceTimersByTime(100);
    expect(calls).toEqual(['next']);
  });

  it('accepts an explicit injector outside an injection context', () => {
    const source = signal(0);
    expect(() => watchSignal(source, () => {})).toThrow(/NG0203/);
    const injector = TestBed.inject(Injector);
    const calls: number[] = [];
    const ref = watchSignal(source, value => calls.push(value), { injector });
    TestBed.tick();
    source.set(1);
    TestBed.tick();
    expect(calls).toEqual([1]);
    ref.destroy();
  });
});
