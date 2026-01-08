import { Signal, WritableSignal, computed } from '@angular/core';

/**
 * Patches an object signal with partial values
 * @param objectSignal - Writable object signal
 * @param partial - Partial object to merge
 */
export function patchSignal<T extends object>(
  objectSignal: WritableSignal<T>,
  partial: Partial<T>
): void {
  objectSignal.update(obj => ({ ...obj, ...partial }));
}

/**
 * Picks specific keys from an object signal
 * @param objectSignal - Object signal
 * @param keys - Keys to pick
 * @returns Computed signal with picked keys
 */
export function pickSignal<T extends object, K extends keyof T>(
  objectSignal: Signal<T>,
  ...keys: K[]
): Signal<Pick<T, K>> {
  return computed(() => {
    const obj = objectSignal();
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = obj[key];
    }
    return result;
  });
}

/**
 * Omits specific keys from an object signal
 * @param objectSignal - Object signal
 * @param keys - Keys to omit
 * @returns Computed signal with omitted keys
 */
export function omitSignal<T extends object, K extends keyof T>(
  objectSignal: Signal<T>,
  ...keys: K[]
): Signal<Omit<T, K>> {
  return computed(() => {
    const obj = objectSignal();
    const result = { ...obj } as any;
    for (const key of keys) {
      delete result[key];
    }
    return result;
  });
}

/**
 * Gets a property value from an object signal
 * @param objectSignal - Object signal
 * @param key - Property key
 * @returns Computed signal with property value
 */
export function pluckSignal<T extends object, K extends keyof T>(
  objectSignal: Signal<T>,
  key: K
): Signal<T[K]> {
  return computed(() => objectSignal()[key]);
}

/**
 * Gets the keys of an object signal
 * @param objectSignal - Object signal
 * @returns Computed signal with object keys
 */
export function objectSignalKeys<T extends object>(
  objectSignal: Signal<T>
): Signal<(keyof T)[]> {
  return computed(() => Object.keys(objectSignal()) as (keyof T)[]);
}

/**
 * Gets the values of an object signal
 * @param objectSignal - Object signal
 * @returns Computed signal with object values
 */
export function objectSignalValues<T extends object>(
  objectSignal: Signal<T>
): Signal<T[keyof T][]> {
  return computed(() => Object.values(objectSignal()) as T[keyof T][]);
}

/**
 * Gets the entries of an object signal
 * @param objectSignal - Object signal
 * @returns Computed signal with object entries
 */
export function objectSignalEntries<T extends object>(
  objectSignal: Signal<T>
): Signal<[keyof T, T[keyof T]][]> {
  return computed(() => Object.entries(objectSignal()) as [keyof T, T[keyof T]][]);
}
