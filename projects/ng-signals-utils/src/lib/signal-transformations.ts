import { Signal, computed, signal, effect, linkedSignal, untracked, type Injector } from '@angular/core';

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
 * Retains the last source value accepted by a predicate, synchronously.
 * @param source - Source signal
 * @param predicate - Filter predicate
 * @param initialValue - Initial value to use if predicate fails
 * @returns Readonly signal that changes only when a new source value passes the predicate
 */
export function filterSignal<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  initialValue: T
): Signal<T> {
  const filtered = linkedSignal<T, T>({
    source: () => source(),
    computation: (value, previous) => {
      return untracked(() => predicate(value)) ? value : previous ? previous.value : initialValue;
    },
  });

  return filtered.asReadonly();
}

/**
 * Debounces source updates. The initial value is available immediately.
 * Requires an injection context unless an injector is passed in options.
 * Pending updates are canceled when the owning injector is destroyed.
 * @param source - Source signal
 * @param ms - Debounce delay in milliseconds
 * @param options - Pass an injector when calling outside an injection context
 * @returns Readonly debounced signal
 */
export function debounceSignal<T>(
  source: Signal<T>,
  ms: number,
  options?: { injector?: Injector },
): Signal<T> {
  const debounced = signal(source());

  effect((onCleanup) => {
    const value = source();
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => debounced.set(value), ms);
    onCleanup(() => clearTimeout(timeoutId));
  }, options);

  return debounced.asReadonly();
}

/**
 * Combines multiple signals into a single signal while inferring tuple types
 * @param signals - Array of signals to combine
 * @returns Combined signal with array of values
 */
export function combineSignals<const T extends readonly Signal<unknown>[]>(
  signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  type Values = { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };
  return computed(() => signals.map(s => s()) as unknown as Values);
}

/**
 * Creates a synchronous computed signal that retains the last distinct value
 * @param source - Source signal
 * @param compareFn - Optional comparison function
 * @returns Signal that only updates on distinct values
 */
export function distinctSignal<T>(
  source: Signal<T>,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): Signal<T> {
  return computed(() => source(), { equal: compareFn });
}
