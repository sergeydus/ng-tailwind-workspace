import { Signal, effect, EffectRef, CreateEffectOptions } from '@angular/core';

/**
 * Creates an effect that runs only when the signal value changes
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
    if (!isFirst) {
      fn(value, previousValue);
    }
    previousValue = value;
    isFirst = false;
  }, options);
}

/**
 * Creates an effect that runs once when the signal meets a condition
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
    if (predicate(value)) {
      fn(value);
      hasRun = true;
      effectRef.destroy();
    }
  }, options);
  
  return effectRef;
}

/**
 * Creates a throttled effect
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
  let lastRun = 0;
  
  return effect(() => {
    const value = source();
    const now = Date.now();
    
    if (now - lastRun >= ms) {
      fn(value);
      lastRun = now;
    }
  }, options);
}

/**
 * Creates a debounced effect
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
  let timeoutId: any;
  
  return effect(() => {
    const value = source();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(value), ms);
  }, options);
}
