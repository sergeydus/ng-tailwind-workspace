# @sergeydus/ng-signals-utils examples

Every TypeScript block below is a complete standalone Angular component. The packed-consumer check extracts these blocks and compiles them against the installed package in both Angular 21 and 22.

## Signal transformations

`mapSignal`, `filterSignal`, `combineSignals`, and `distinctSignal` update synchronously. `debounceSignal` publishes later changes after a delay and must be created in an injection context or given an injector.

```typescript
import { Component, signal } from '@angular/core';
import {
  combineSignals,
  debounceSignal,
  distinctSignal,
  filterSignal,
  mapSignal,
} from '@sergeydus/ng-signals-utils';

@Component({
  selector: 'app-transformations-example',
  template: `
    <input [value]="query()" (input)="onInput($event)" />
    <p>Double: {{ doubled() }}</p>
    <p>Last positive: {{ lastPositive() }}</p>
    <p>Delayed query: {{ delayedQuery() }}</p>
    <p>Combined: {{ combined()[0] }} / {{ combined()[1] }}</p>
    <p>Distinct count: {{ distinctCount() }}</p>
  `,
})
export class TransformationsExample {
  readonly count = signal(0);
  readonly query = signal('');
  readonly doubled = mapSignal(this.count, value => value * 2);
  readonly lastPositive = filterSignal(this.count, value => value > 0, 0);
  readonly delayedQuery = debounceSignal(this.query, 300);
  readonly combined = combineSignals([this.count, this.query]);
  readonly distinctCount = distinctSignal(this.count);
  readonly tuple: readonly [number, string] = this.combined();

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
```

## Array helpers

`arraySignalPush` and `arraySignalRemoveAt` update a writable array signal. The other array helpers return readonly computed signals.

```typescript
import { Component, signal } from '@angular/core';
import {
  arraySignalFilter,
  arraySignalFind,
  arraySignalIsEmpty,
  arraySignalLength,
  arraySignalMap,
  arraySignalPush,
  arraySignalRemoveAt,
  arraySignalSort,
} from '@sergeydus/ng-signals-utils';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-array-example',
  template: `
    <input #text />
    <button (click)="add(text.value); text.value = ''">Add</button>
    <p>Total: {{ total() }}; completed: {{ completed().length }}</p>
    <p>First open: {{ firstOpen()?.text ?? 'none' }}</p>
    @if (empty()) {
      <p>No tasks yet</p>
    }
    @for (task of sorted(); track task.id) {
      <p>{{ task.text }} <button (click)="remove(task.id)">Remove</button></p>
    }
  `,
})
export class ArrayExample {
  readonly tasks = signal<Task[]>([]);
  readonly completed = arraySignalFilter(this.tasks, task => task.completed);
  readonly labels = arraySignalMap(this.tasks, task => task.text);
  readonly sorted = arraySignalSort(this.tasks, (a, b) => a.text.localeCompare(b.text));
  readonly firstOpen = arraySignalFind(this.tasks, task => !task.completed);
  readonly total = arraySignalLength(this.tasks);
  readonly empty = arraySignalIsEmpty(this.tasks);
  private nextId = 1;

  add(text: string): void {
    if (text.trim()) {
      arraySignalPush(this.tasks, { id: this.nextId++, text: text.trim(), completed: false });
    }
  }

  remove(id: number): void {
    const index = this.tasks().findIndex(task => task.id === id);
    if (index !== -1) arraySignalRemoveAt(this.tasks, index);
  }
}
```

## Object helpers

`patchSignal` updates a writable object signal. The pick, omit, pluck, keys, values, and entries helpers return computed signals.

```typescript
import { Component, signal } from '@angular/core';
import {
  objectSignalEntries,
  objectSignalKeys,
  objectSignalValues,
  omitSignal,
  patchSignal,
  pickSignal,
  pluckSignal,
} from '@sergeydus/ng-signals-utils';

interface Profile {
  id: number;
  name: string;
  email: string;
  secret: string;
}

@Component({
  selector: 'app-object-example',
  template: `
    <h2>{{ name() }}</h2>
    <p>Public email: {{ publicProfile().email }}</p>
    <p>Visible email: {{ visibleFields().email }}</p>
    <p>Keys: {{ keys().join(', ') }}</p>
    <p>Values: {{ values().length }}; entries: {{ entries().length }}</p>
    <button (click)="rename('Jane')">Rename</button>
  `,
})
export class ObjectExample {
  readonly profile = signal<Profile>({
    id: 1,
    name: 'John',
    email: 'john@example.com',
    secret: 'private',
  });
  readonly publicProfile = pickSignal(this.profile, 'id', 'name', 'email');
  readonly visibleFields = omitSignal(this.profile, 'secret');
  readonly name = pluckSignal(this.profile, 'name');
  readonly keys = objectSignalKeys(this.profile);
  readonly values = objectSignalValues(this.profile);
  readonly entries = objectSignalEntries(this.profile);

  rename(name: string): void {
    patchSignal(this.profile, { name });
  }
}
```

## Effect helpers

Create these helpers in a component field initializer or pass `{ injector }` in the options argument. Angular destroys these effects with the component. `watchSignal` skips the initial value; `watchUntil` checks it. `throttleEffect` calls immediately and later delivers the latest value in each window; `debounceEffect` waits for a quiet period.

```typescript
import { Component, signal } from '@angular/core';
import {
  debounceEffect,
  throttleEffect,
  watchSignal,
  watchUntil,
} from '@sergeydus/ng-signals-utils';

@Component({
  selector: 'app-effect-example',
  template: `
    <p>Count: {{ count() }}</p>
    <button (click)="increment()">Increment</button>
  `,
})
export class EffectExample {
  readonly count = signal(0);
  readonly changes = watchSignal(this.count, (current, previous) => {
    console.log('Changed from', previous, 'to', current);
  });
  readonly reachedThree = watchUntil(this.count, value => value >= 3, () => {
    console.log('Reached three');
  });
  readonly throttled = throttleEffect(this.count, value => {
    console.log('Latest count in window:', value);
  }, 200);
  readonly debounced = debounceEffect(this.count, value => {
    console.log('Settled count:', value);
  }, 300);

  increment(): void {
    this.count.update(value => value + 1);
  }
}
```

For issues and source, visit the [ng-tailwind-workspace repository](https://github.com/sergeydus/ng-tailwind-workspace).
