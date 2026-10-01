import { Signal, effect, EffectRef, CreateEffectOptions, untracked } from '@angular/core';

/**
 * Creates an effect that skips the initial value and runs on later net source changes.
 * Changes that return to the previous value before the effect runs are ignored.
 * The callback's signal reads do not become dependencies.
 * @param source - Source signal to watch
 * @param fn - Effect function
 * @param options - Effect options
 * @returns EffectRef
 */
export function watchSignal<T>(
  source: Signal<T>,
  fn: (value: T, previousValue: T | undefined) => void,
  options?: CreateEffectOptions
): EffectRef {
  let previousValue: T | undefined = undefined;
  let isFirst = true;
  
  return effect(() => {
    const value = source();
    if (!isFirst && !Object.is(value, previousValue)) {
      untracked(() => fn(value, previousValue));
    }
    previousValue = value;
    isFirst = false;
  }, options);
}

/**
 * Creates an effect that runs once when the source meets a condition, including initially.
 * Predicate and callback signal reads do not become dependencies.
 * @param source - Source signal to watch
 * @param predicate - Condition to check
 * @param fn - Effect function
 * @param options - Effect options
 * @returns EffectRef
 */
export function watchUntil<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  fn: (value: T) => void,
  options?: CreateEffectOptions
): EffectRef {
  let hasRun = false;
  
  const effectRef = effect(() => {
    if (hasRun) return;
    
    const value = source();
    if (untracked(() => predicate(value))) {
      untracked(() => fn(value));
      hasRun = true;
      effectRef.destroy();
    }
  }, options);
  
  return effectRef;
}

/**
 * Creates a throttled effect with an immediate leading call and the latest
 * source value delivered at the end of each throttle window.
 * @param source - Source signal to watch
 * @param fn - Effect function
 * @param ms - Throttle delay in milliseconds
 * @param options - Effect options
 * @returns EffectRef
 */
export function throttleEffect<T>(
  source: Signal<T>,
  fn: (value: T) => void,
  ms: number,
  options?: CreateEffectOptions
): EffectRef {
  let lastRun: number | undefined;

  return effect((onCleanup) => {
    const value = source();
    const now = Date.now();
    const elapsed = lastRun === undefined ? ms : now - lastRun;

    if (elapsed >= ms) {
      lastRun = now;
      untracked(() => fn(value));
      return;
    }

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      lastRun = Date.now();
      untracked(() => fn(value));
    }, ms - elapsed);
    onCleanup(() => clearTimeout(timeoutId));
  }, options);
}

/**
 * Creates a debounced effect. The initial value is scheduled after the delay.
 * Pending callbacks are canceled on a source change or effect destruction.
 * @param source - Source signal to watch
 * @param fn - Effect function
 * @param ms - Debounce delay in milliseconds
 * @param options - Effect options
 * @returns EffectRef
 */
export function debounceEffect<T>(
  source: Signal<T>,
  fn: (value: T) => void,
  ms: number,
  options?: CreateEffectOptions
): EffectRef {
  return effect((onCleanup) => {
    const value = source();
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      untracked(() => fn(value));
    }, ms);
    onCleanup(() => clearTimeout(timeoutId));
  }, options);
}
