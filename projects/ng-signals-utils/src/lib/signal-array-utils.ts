import { Signal, WritableSignal, computed } from '@angular/core';

/**
 * Pushes an item to an array signal
 * @param arraySignal - Writable array signal
 * @param item - Item to push
 */
export function arraySignalPush<T>(
  arraySignal: WritableSignal<T[]>,
  item: T
): void {
  arraySignal.update(arr => [...arr, item]);
}

/**
 * Removes an item from an array signal at the specified index
 * @param arraySignal - Writable array signal
 * @param index - Index to remove
 */
export function arraySignalRemoveAt<T>(
  arraySignal: WritableSignal<T[]>,
  index: number
): void {
  arraySignal.update(arr => arr.filter((_, i) => i !== index));
}

/**
 * Filters an array signal
 * @param arraySignal - Array signal
 * @param predicate - Filter predicate
 * @returns Computed signal with filtered array
 */
export function arraySignalFilter<T>(
  arraySignal: Signal<T[]>,
  predicate: (item: T, index: number) => boolean
): Signal<T[]> {
  return computed(() => arraySignal().filter(predicate));
}

/**
 * Maps an array signal
 * @param arraySignal - Array signal
 * @param fn - Mapping function
 * @returns Computed signal with mapped array
 */
export function arraySignalMap<T, R>(
  arraySignal: Signal<T[]>,
  fn: (item: T, index: number) => R
): Signal<R[]> {
  return computed(() => arraySignal().map(fn));
}

/**
 * Sorts an array signal
 * @param arraySignal - Array signal
 * @param compareFn - Optional comparison function
 * @returns Computed signal with sorted array
 */
export function arraySignalSort<T>(
  arraySignal: Signal<T[]>,
  compareFn?: (a: T, b: T) => number
): Signal<T[]> {
  return computed(() => [...arraySignal()].sort(compareFn));
}

/**
 * Finds an item in an array signal
 * @param arraySignal - Array signal
 * @param predicate - Find predicate
 * @returns Computed signal with found item or undefined
 */
export function arraySignalFind<T>(
  arraySignal: Signal<T[]>,
  predicate: (item: T, index: number) => boolean
): Signal<T | undefined> {
  return computed(() => arraySignal().find(predicate));
}

/**
 * Gets the length of an array signal
 * @param arraySignal - Array signal
 * @returns Computed signal with array length
 */
export function arraySignalLength<T>(
  arraySignal: Signal<T[]>
): Signal<number> {
  return computed(() => arraySignal().length);
}

/**
 * Checks if an array signal is empty
 * @param arraySignal - Array signal
 * @returns Computed signal indicating if array is empty
 */
export function arraySignalIsEmpty<T>(
  arraySignal: Signal<T[]>
): Signal<boolean> {
  return computed(() => arraySignal().length === 0);
}
