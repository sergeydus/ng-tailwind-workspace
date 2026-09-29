import { signal, type Signal } from '@angular/core';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  arraySignalFilter,
  arraySignalFind,
  arraySignalIsEmpty,
  arraySignalLength,
  arraySignalMap,
  arraySignalPush,
  arraySignalRemoveAt,
  arraySignalSort,
} from '../public-api';

describe('signal array helpers', () => {
  it('pushes a value without mutating the previous array', () => {
    const previous = [1];
    const values = signal(previous);
    if (false) {
      // @ts-expect-error arraySignalPush requires the array item type.
      arraySignalPush(values, 'wrong');
    }
    arraySignalPush(values, 2);
    expect(values()).toEqual([1, 2]);
    expect(values()).not.toBe(previous);
    expect(previous).toEqual([1]);
  });

  it('removes the requested index and leaves invalid indices without element changes', () => {
    const values = signal(['a', 'b', 'c']);
    arraySignalRemoveAt(values, 1);
    expect(values()).toEqual(['a', 'c']);
    arraySignalRemoveAt(values, -1);
    arraySignalRemoveAt(values, 10);
    expect(values()).toEqual(['a', 'c']);
  });

  it('filters using item and index after source updates', () => {
    const values = signal([10, 11, 12]);
    const filtered = arraySignalFilter(values, (value, index) => value > 10 && index % 2 === 0);
    expect(filtered()).toEqual([12]);
    values.set([13, 14]);
    expect(filtered()).toEqual([13]);
    values.set([]);
    expect(filtered()).toEqual([]);
  });

  it('maps to a new value type and passes the current index', () => {
    const values = signal([2, 4]);
    const mapped = arraySignalMap(values, (value, index) => `${index}:${value}`);
    expectTypeOf(mapped).toEqualTypeOf<Signal<string[]>>();
    expect(mapped()).toEqual(['0:2', '1:4']);
    values.set([6]);
    expect(mapped()).toEqual(['0:6']);
  });

  it('sorts without mutating the source and accepts a comparator', () => {
    const previous = [3, 1, 2];
    const values = signal(previous);
    const sorted = arraySignalSort(values, (a, b) => a - b);
    expect(sorted()).toEqual([1, 2, 3]);
    expect(previous).toEqual([3, 1, 2]);
    values.set([5, 4]);
    expect(sorted()).toEqual([4, 5]);
    values.set([]);
    expect(sorted()).toEqual([]);
  });

  it('finds a matching item or undefined after updates', () => {
    const values = signal([{ id: 1 }, { id: 2 }]);
    const found = arraySignalFind(values, (item, index) => item.id === 2 && index === 1);
    expectTypeOf(found).toEqualTypeOf<Signal<{ id: number } | undefined>>();
    expect(found()).toEqual({ id: 2 });
    values.set([{ id: 3 }]);
    expect(found()).toBeUndefined();
  });

  it('tracks array length', () => {
    const values = signal<number[]>([]);
    const length = arraySignalLength(values);
    expect(length()).toBe(0);
    arraySignalPush(values, 1);
    expect(length()).toBe(1);
  });

  it('tracks empty and nonempty states', () => {
    const values = signal<string[]>([]);
    const empty = arraySignalIsEmpty(values);
    expect(empty()).toBe(true);
    values.set(['value']);
    expect(empty()).toBe(false);
    values.set([]);
    expect(empty()).toBe(true);
  });
});
