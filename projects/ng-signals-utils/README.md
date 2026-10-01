# @sergeydus/ng-signals-utils

[![npm version](https://img.shields.io/npm/v/@sergeydus/ng-signals-utils.svg)](https://www.npmjs.com/package/@sergeydus/ng-signals-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Angular](https://img.shields.io/badge/Angular-21%20%7C%2022-red.svg)](https://angular.dev/)

Signal transformations, array and object helpers, and effect helpers for Angular applications. This package is a library; it has no application to start or serve.

## Requirements

- Angular 21 or 22 (`@angular/core >=21.0.0 <23.0.0`). The package is built with Angular 21, and its packed artifact passes production builds in clean Angular 21 and 22 consumers.
- Use the TypeScript version required by your Angular major: `>=5.9.0 <6.0.0` for Angular 21 or `>=6.0.0 <6.1.0` for Angular 22. See [Angular's compatibility table](https://angular.dev/reference/versions).

## Installation

```bash
npm install @sergeydus/ng-signals-utils
```

## Quick example

This complete standalone component can be copied into an Angular application. `debounceSignal` is created in a component field initializer, which is an injection context.

```typescript
import { Component, signal } from '@angular/core';
import { combineSignals, debounceSignal, filterSignal } from '@sergeydus/ng-signals-utils';

@Component({
  selector: 'app-signal-search',
  template: `
    <input [value]="query()" (input)="onInput($event)" />
    <p>Delayed query: {{ delayedQuery() }}</p>
    <p>Last nonnegative count: {{ nonnegativeCount() }}</p>
    <p>{{ queryAndCount()[0] }}: {{ queryAndCount()[1] }}</p>
  `,
})
export class SignalSearchComponent {
  readonly query = signal('');
  readonly count = signal(0);
  readonly delayedQuery = debounceSignal(this.query, 300);
  readonly nonnegativeCount = filterSignal(this.count, value => value >= 0, 0);
  readonly queryAndCount = combineSignals([this.query, this.count]);

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
```

## API

| Group | Exports |
| --- | --- |
| Transformations | `mapSignal`, `filterSignal`, `debounceSignal`, `combineSignals`, `distinctSignal` |
| Arrays | `arraySignalPush`, `arraySignalRemoveAt`, `arraySignalFilter`, `arraySignalMap`, `arraySignalSort`, `arraySignalFind`, `arraySignalLength`, `arraySignalIsEmpty` |
| Objects | `patchSignal`, `pickSignal`, `omitSignal`, `pluckSignal`, `objectSignalKeys`, `objectSignalValues`, `objectSignalEntries` |
| Effects | `watchSignal`, `watchUntil`, `throttleEffect`, `debounceEffect` |

See [EXAMPLES.md](./EXAMPLES.md) for complete, compilable examples of every helper. The packed package includes that file. Generate API reference HTML from this workspace with `npm run docs:ng-signals-utils`; generated HTML is kept out of the npm package.

## Timing and injection context

- `mapSignal`, `filterSignal`, `combineSignals`, and `distinctSignal` are synchronous derivations that work outside an injection context. `filterSignal` retains the last accepted value, or the supplied initial value before any match, and returns a readonly signal. The filter predicate does not add dependencies. `combineSignals([a, b])` infers a readonly tuple.
- `debounceSignal` exposes the source's initial value immediately and publishes later values after the delay. It needs an injection context or an explicit `{ injector }` third argument. A pending update is canceled when its injector is destroyed.
- `watchSignal`, `watchUntil`, `throttleEffect`, and `debounceEffect` create Angular effects. Create them in a component or service field initializer, or pass `{ injector }` in the final options argument. Callback and predicate reads do not become dependencies.
- `watchSignal` skips the initial value and batched changes that return to the previous value. `watchUntil` checks the initial value and runs once when its predicate passes.
- `throttleEffect` calls immediately with the initial value, then delivers the latest change at the end of each window. `debounceEffect` schedules the initial value after the delay and resets its timer on source changes. Both cancel pending callbacks on cleanup.

## Issues and license

[Open an issue](https://github.com/sergeydus/ng-tailwind-workspace/issues). Licensed under [MIT](./LICENSE).
