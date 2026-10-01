import { signal, type Signal } from '@angular/core';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  objectSignalEntries,
  objectSignalKeys,
  objectSignalValues,
  omitSignal,
  patchSignal,
  pickSignal,
  pluckSignal,
} from '../public-api';

describe('signal object helpers', () => {
  it('patches fields without mutating the previous object', () => {
    const previous = { id: 1, name: 'Ada', active: false };
    const person = signal(previous);
    patchSignal(person, { name: 'Grace', active: true });
    expect(person()).toEqual({ id: 1, name: 'Grace', active: true });
    expect(person()).not.toBe(previous);
    expect(previous).toEqual({ id: 1, name: 'Ada', active: false });
  });

  it('picks typed keys and reflects later values', () => {
    const person = signal({ id: 1, name: 'Ada', active: false });
    const picked = pickSignal(person, 'id', 'name');
    expectTypeOf(picked).toEqualTypeOf<Signal<{ id: number; name: string }>>();
    if (false) {
      // @ts-expect-error pickSignal accepts only keys of the source object.
      pickSignal(person, 'missing');
      // @ts-expect-error patchSignal keeps the source field types.
      patchSignal(person, { id: 'wrong' });
    }
    expect(picked()).toEqual({ id: 1, name: 'Ada' });
    patchSignal(person, { name: 'Grace' });
    expect(picked()).toEqual({ id: 1, name: 'Grace' });
    expect(pickSignal(person)()).toEqual({});
  });

  it('omits typed keys while retaining the source object', () => {
    const person = signal({ id: 1, name: 'Ada', active: false });
    const omitted = omitSignal(person, 'active');
    expectTypeOf(omitted).toEqualTypeOf<Signal<{ id: number; name: string }>>();
    expect(omitted()).toEqual({ id: 1, name: 'Ada' });
    expect(person().active).toBe(false);
    person.set({ id: 2, name: 'Grace', active: true });
    expect(omitted()).toEqual({ id: 2, name: 'Grace' });
    expect(omitSignal(person)()).toEqual(person());
  });

  it('plucks a property with its inferred value type', () => {
    const person = signal({ id: 1, name: 'Ada' });
    const name = pluckSignal(person, 'name');
    expectTypeOf(name).toEqualTypeOf<Signal<string>>();
    expect(name()).toBe('Ada');
    person.set({ id: 2, name: 'Grace' });
    expect(name()).toBe('Grace');
  });

  it('derives keys after an object shape changes', () => {
    const value = signal<Record<string, number>>({ a: 1 });
    const keys = objectSignalKeys(value);
    expect(keys()).toEqual(['a']);
    value.set({ b: 2, c: 3 });
    expect(keys()).toEqual(['b', 'c']);
  });

  it('derives values after an object value changes', () => {
    const value = signal({ a: 1, b: 2 });
    const values = objectSignalValues(value);
    expect(values()).toEqual([1, 2]);
    value.set({ a: 3, b: 4 });
    expect(values()).toEqual([3, 4]);
  });

  it('derives entries after an object value changes', () => {
    const value = signal({ a: 1, b: 2 });
    const entries = objectSignalEntries(value);
    expect(entries()).toEqual([['a', 1], ['b', 2]]);
    value.set({ a: 3, b: 4 });
    expect(entries()).toEqual([['a', 3], ['b', 4]]);
  });
});
