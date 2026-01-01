# NgTailwindMerge

An Angular standalone directive that **merges Tailwind CSS classes** from `class` and `ngClass` using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) and `clsx`. Built on Angular's signal-based inputs.

## Requirements

- Angular `@angular/core` and `@angular/common` **^21.0.0** (standalone + signal inputs)
- `tailwind-merge` **^3.4.0**
- `clsx` **^2.1.1**

These are declared as peer dependencies.

## Installation

```bash
npm install ng-tailwind-merge
```

## Usage (standalone)

### `twMerge` Directive

Merges `class` and `ngClass` attributes:

```typescript
import { Component, signal } from '@angular/core';
import { NgTailwindMerge } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgTailwindMerge],
  template: `
    <!-- Simple merge: last conflicting class wins -->
    <div twMerge class="bg-red-500 bg-blue-500">
      Uses bg-blue-500
    </div>

    <!-- Merge class + ngClass -->
    <div
      twMerge
      class="p-4 bg-red-500"
      [ngClass]="{ 'text-white': isActive(), 'font-bold': true }">
      Merged with ngClass
    </div>

    <!-- Conflicts resolved -->
    <div twMerge class="p-4 p-8 m-2">
      Uses p-8 and m-2
    </div>
  `
})
export class ExampleComponent {
  isActive = signal(true);
}
```

### `merge` Directive

Property binding for dynamic class merging:

```typescript
import { Component, signal } from '@angular/core';
import { NgMerge } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgMerge],
  template: `
    <!-- String input -->
    <div [merge]="'bg-red-500 bg-blue-500 p-4'">
      Uses bg-blue-500 and p-4
    </div>

    <!-- Array input -->
    <div [merge]="['bg-red-500', 'bg-blue-500', 'p-4']">
      Array merging
    </div>

    <!-- Object input -->
    <div [merge]="{ 'bg-blue-500': true, 'p-4': isActive(), 'text-white': false }">
      Conditional classes
    </div>

    <!-- Mixed input (array + object) -->
    <div [merge]="['bg-red-500', { 'p-4': true, 'font-bold': isActive() }]">
      Mixed types
    </div>

    <!-- Signal-based classes -->
    <div [merge]="classes()">
      Dynamic signal classes
    </div>
  `
})
export class ExampleComponent {
  isActive = signal(true);
  classes = signal('bg-green-500 p-8 text-white');
}
```

## API

### `NgTailwindMerge`
- **Selector:** `[twMerge]`
- **Behavior:** Reads `class` and `ngClass` attributes and merges them via `tailwind-merge`.

### `NgMerge`
- **Selector:** `[merge]`
- **Input:** `merge` - accepts `ClassValue | ClassValue[]` (string, string[], object, or mixed array)
- **Behavior:** Merges the input value(s) and applies the result to the element's `class` attribute.

Both directives:
- Are standalone (no module required)
- Use signal-based inputs
- Resolve Tailwind conflicts (last variant wins)
- Are tree-shakeable (`sideEffects: false`)

## How it works

- Signal-based inputs read the current values reactively.
- `clsx` normalizes inputs; `tailwind-merge` resolves Tailwind conflicts.
- The final merged string is applied to the element's `class` attribute via `effect()`.

