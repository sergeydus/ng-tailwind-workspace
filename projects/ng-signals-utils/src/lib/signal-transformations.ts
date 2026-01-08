import { Signal, computed, signal, WritableSignal, effect } from '@angular/core';

/**
 * Maps a signal value to another type
 * @param source - Source signal
 * @param fn - Mapping function
 * @returns Computed signal with mapped value
 */
export function mapSignal<T, R>(
  source: Signal<T>,
  fn: (value: T) => R
): Signal<R> {
  return computed(() => fn(source()));
}

/**
 * Filters signal updates based on a predicate
 * @param source - Source signal
 * @param predicate - Filter predicate
 * @param initialValue - Initial value to use if predicate fails
 * @returns Signal that only updates when predicate returns true
 */
export function filterSignal<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  initialValue: T
): Signal<T> {
  const filtered = signal(initialValue);
  
  effect(() => {
    const value = source();
    if (predicate(value)) {
      (filtered as WritableSignal<T>).set(value);
    }
  });
  
  return filtered.asReadonly();
}

/**
 * Debounces signal updates
 * @param source - Source signal
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced signal
 */
export function debounceSignal<T>(
  source: Signal<T>,
  ms: number
): Signal<T> {
  const debounced = signal(source());
  let timeoutId: any;
  
  effect(() => {
    const value = source();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      (debounced as WritableSignal<T>).set(value);
    }, ms);
  });
  
  return debounced.asReadonly();
}

/**
 * Combines multiple signals into a single signal
 * @param signals - Array of signals to combine
 * @returns Combined signal with array of values
 */
export function combineSignals<T extends readonly Signal<any>[]>(
  signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return computed(() => signals.map(s => s()) as any);
}

/**
 * Creates a signal that emits distinct values only
 * @param source - Source signal
 * @param compareFn - Optional comparison function
 * @returns Signal that only updates on distinct values
 */
export function distinctSignal<T>(
  source: Signal<T>,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): Signal<T> {
  const distinct = signal(source());
  let lastValue = source();
  
  effect(() => {
    const value = source();
    if (!compareFn(value, lastValue)) {
      lastValue = value;
      (distinct as WritableSignal<T>).set(value);
    }
  });
  
  return distinct.asReadonly();
}
