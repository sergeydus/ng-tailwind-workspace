import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mapSignal, combineSignals, distinctSignal } from './signal-transformations';

describe('Signal Transformations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('mapSignal', () => {
    it('should map signal values', () => {
      const source = signal(5);
      const mapped = mapSignal(source, (x) => x * 2);
      
      expect(mapped()).toBe(10);
      
      source.set(10);
      expect(mapped()).toBe(20);
    });
  });

  describe('combineSignals', () => {
    it('should combine multiple signals', () => {
      const sig1 = signal(1);
      const sig2 = signal('hello');
      const sig3 = signal(true);
      
      const combined = combineSignals([sig1, sig2, sig3]);
      
      expect(combined()).toEqual([1, 'hello', true]);
      
      sig1.set(2);
      expect(combined()).toEqual([2, 'hello', true]);
    });
  });

  describe('distinctSignal', () => {
    it('should emit only distinct values', () => {
      const source = signal(1);
      const distinct = distinctSignal(source);
      
      expect(distinct()).toBe(1);
      
      source.set(1);
      expect(distinct()).toBe(1);
      
      source.set(2);
      expect(distinct()).toBe(2);
    });
  });
});
