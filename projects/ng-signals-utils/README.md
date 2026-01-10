# @sergeydus/ng-signals-utils

[![npm version](https://img.shields.io/npm/v/@sergeydus/ng-signals-utils.svg)](https://www.npmjs.com/package/@sergeydus/ng-signals-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)

**Powerful utility functions for Angular signals that make reactive programming easier and more intuitive.**

Stop writing repetitive signal manipulation code. `@sergeydus/ng-signals-utils` provides a comprehensive set of utilities for transforming, filtering, and managing signals in your Angular applications.

## 🚀 Why ng-signals-utils?

Angular's signals are powerful, but common operations require boilerplate code. This library provides:

- ✅ **Signal Transformations** - Map, filter, debounce, and combine signals effortlessly
- ✅ **Array Operations** - Work with array signals using familiar array methods
- ✅ **Object Utilities** - Update and transform object signals with ease
- ✅ **Effect Helpers** - Advanced effect management with debouncing, throttling, and more
- ✅ **Type-Safe** - Full TypeScript support with proper type inference
- ✅ **Tree-Shakeable** - Only bundle what you use
- ✅ **Zero Dependencies** - Except Angular core, of course

## 📦 Installation

```bash
npm install @sergeydus/ng-signals-utils
```

```bash
yarn add @sergeydus/ng-signals-utils
```

```bash
pnpm add @sergeydus/ng-signals-utils
```

## 🎯 Quick Examples

### Before vs After

**Without ng-signals-utils:**
```typescript
// Debouncing a search signal
const searchTerm = signal('');
const debouncedSearch = signal('');
let timeoutId: any;

effect(() => {
  const value = searchTerm();
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    debouncedSearch.set(value);
  }, 300);
});
```

**With ng-signals-utils:**
```typescript
import { debounceSignal } from '@sergeydus/ng-signals-utils';

const searchTerm = signal('');
const debouncedSearch = debounceSignal(searchTerm, 300);
// Done! 🎉
```

---

**Without ng-signals-utils:**
```typescript
// Filtering an array signal
const allTodos = signal<Todo[]>([]);
const completedTodos = computed(() => 
  allTodos().filter(todo => todo.completed)
);
```

**With ng-signals-utils:**
```typescript
import { arraySignalFilter } from '@sergeydus/ng-signals-utils';

const allTodos = signal<Todo[]>([]);
const completedTodos = arraySignalFilter(allTodos, todo => todo.completed);
// More expressive and reusable! ✨
```

## 💡 Common Use Cases

### Real-time Search with Debouncing

```typescript
import { Component, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceSignal } from '@sergeydus/ng-signals-utils';

@Component({
  selector: 'app-search',
  template: `
    <input [value]="searchTerm()" (input)="onSearch($event)" />
    <p>Searching for: {{ debouncedSearch() }}</p>
  `
})
export class SearchComponent {
  private http = inject(HttpClient);
  
  searchTerm = signal('');
  debouncedSearch = debounceSignal(this.searchTerm, 300);
  
  // API calls automatically debounced!
  constructor() {
    effect(() => {
      const query = this.debouncedSearch();
      if (query) this.searchAPI(query);
    });
  }
  
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }
  
  searchAPI(query: string) {
    this.http.get(`/api/search?q=${query}`).subscribe(results => {
      console.log('Search results:', results);
      // Handle your search results here
    });
  }
}
```

### Managing Todo Lists

```typescript
import { arraySignalPush, arraySignalRemoveAt, arraySignalFilter } from '@sergeydus/ng-signals-utils';

export class TodoComponent {
  todos = signal<Todo[]>([]);
  completedTodos = arraySignalFilter(this.todos, t => t.completed);
  pendingTodos = arraySignalFilter(this.todos, t => !t.completed);
  
  addTodo(text: string) {
    arraySignalPush(this.todos, { id: Date.now(), text, completed: false });
  }
  
  removeTodo(index: number) {
    arraySignalRemoveAt(this.todos, index);
  }
}
```

### Form State Management

```typescript
import { patchSignal, pickSignal } from '@sergeydus/ng-signals-utils';

export class UserFormComponent {
  user = signal({
    id: 1,
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  // Only expose safe fields
  publicUser = pickSignal(this.user, 'id', 'name', 'email');
  
  updateField(field: string, value: any) {
    patchSignal(this.user, { [field]: value });
  }
}
```

### Combining Multiple Signals

```typescript
import { combineSignals } from '@sergeydus/ng-signals-utils';

export class CheckoutComponent {
  items = signal<Item[]>([]);
  tax = signal(0.08);
  shipping = signal(10);
  
  // Automatically recalculates when any signal changes
  combined = combineSignals([this.items, this.tax, this.shipping]);
  
  orderSummary = computed(() => {
    const [itemList, taxRate, shippingCost] = this.combined();
    
    const subtotal = itemList.reduce((sum, item) => sum + item.price, 0);
    return {
      subtotal,
      tax: subtotal * taxRate,
      shipping: shippingCost,
      total: subtotal * (1 + taxRate) + shippingCost
    };
  });
}
```

## 📚 API Reference

### Signal Transformations

| Function | Description |
|----------|-------------|
| `mapSignal<T, R>(source, fn)` | Transform signal values to another type |
| `filterSignal<T>(source, predicate, initial)` | Filter signal updates based on a condition |
| `debounceSignal<T>(source, ms)` | Debounce signal updates |
| `combineSignals<T>(signals)` | Combine multiple signals into one |
| `distinctSignal<T>(source, compareFn?)` | Emit only distinct consecutive values |

### Array Utilities

| Function | Description |
|----------|-------------|
| `arraySignalPush<T>(signal, item)` | Add item to array signal |
| `arraySignalRemoveAt<T>(signal, index)` | Remove item at index |
| `arraySignalFilter<T>(signal, predicate)` | Create filtered computed signal |
| `arraySignalMap<T, R>(signal, fn)` | Create mapped computed signal |
| `arraySignalSort<T>(signal, compareFn?)` | Create sorted computed signal |
| `arraySignalFind<T>(signal, predicate)` | Find item in array signal |
| `arraySignalLength<T>(signal)` | Get array length as signal |
| `arraySignalIsEmpty<T>(signal)` | Check if array is empty |

### Object Utilities

| Function | Description |
|----------|-------------|
| `patchSignal<T>(signal, partial)` | Update object signal with partial values |
| `pickSignal<T, K>(signal, ...keys)` | Pick specific keys from object |
| `omitSignal<T, K>(signal, ...keys)` | Omit specific keys from object |
| `pluckSignal<T, K>(signal, key)` | Extract single property as signal |
| `objectSignalKeys<T>(signal)` | Get object keys as signal |
| `objectSignalValues<T>(signal)` | Get object values as signal |
| `objectSignalEntries<T>(signal)` | Get object entries as signal |

### Effect Helpers

| Function | Description |
|----------|-------------|
| `watchSignal<T>(source, fn, options?)` | Watch signal with access to previous value |
| `watchUntil<T>(source, predicate, fn, options?)` | Run effect once when condition is met |
| `throttleEffect<T>(source, fn, ms, options?)` | Throttle effect execution |
| `debounceEffect<T>(source, fn, ms, options?)` | Debounce effect execution |

## 📖 Full Documentation

For comprehensive examples and advanced usage patterns, see [EXAMPLES.md](./EXAMPLES.md).

## 🔧 Requirements

- Angular 17.0.0 or higher
- TypeScript 5.0 or higher

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Your Name]

## 🌟 Show Your Support

If you find this library helpful, please give it a star on GitHub!

## 📮 Feedback & Issues

Found a bug or have a feature request? [Open an issue](https://github.com/yourusername/ng-signals-utils/issues)

---

Made with ❤️ for the Angular community
